import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb, adminMessaging } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? ''
    const idToken = authHeader.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await adminAuth().verifyIdToken(idToken)
    const userSnap = await adminDb().collection('users').doc(decoded.uid).get()
    if (!userSnap.data()?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, body, targetKshetra } = await request.json() as {
      title: string
      body: string
      targetKshetra?: string
    }

    // Query users (optionally filtered by kshetra)
    let q = adminDb().collection('users') as FirebaseFirestore.Query
    if (targetKshetra) {
      q = q.where('kshetra', '==', targetKshetra)
    }
    const usersSnap = await q.get()

    const allTokens: string[] = []
    for (const doc of usersSnap.docs) {
      const tokens = doc.data().fcmTokens as string[] | undefined
      if (tokens?.length) allTokens.push(...tokens)
    }

    if (allTokens.length === 0) {
      return NextResponse.json({ success: true, sent: 0 })
    }

    // Send in batches of 500
    let sent = 0
    const staleTokens: string[] = []

    for (let i = 0; i < allTokens.length; i += 500) {
      const batch = allTokens.slice(i, i + 500)
      const result = await adminMessaging().sendEachForMulticast({
        tokens: batch,
        notification: { title, body },
      })
      sent += result.successCount

      result.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          staleTokens.push(batch[idx])
        }
      })
    }

    // Remove stale tokens
    if (staleTokens.length > 0) {
      const cleanSnap = await adminDb().collection('users').get()
      const batchOp = adminDb().batch()
      for (const doc of cleanSnap.docs) {
        const tokens = doc.data().fcmTokens as string[] | undefined
        if (!tokens) continue
        const hasStale = staleTokens.some((t) => tokens.includes(t))
        if (hasStale) {
          batchOp.update(doc.ref, { fcmTokens: FieldValue.arrayRemove(...staleTokens) })
        }
      }
      await batchOp.commit()
    }

    return NextResponse.json({ success: true, sent })
  } catch (err) {
    console.error('fcm send error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
