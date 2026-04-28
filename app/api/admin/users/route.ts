import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  // Validate env vars early for a clear error
  if (
    !process.env.FIREBASE_ADMIN_PROJECT_ID ||
    !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    !process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    console.error('Missing Firebase Admin env vars')
    return NextResponse.json(
      { error: 'Server misconfigured: Firebase Admin env vars not set' },
      { status: 500 }
    )
  }

  try {
    const authHeader = request.headers.get('authorization') ?? ''
    const idToken = authHeader.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await adminAuth().verifyIdToken(idToken)
    const callerSnap = await adminDb().collection('users').doc(decoded.uid).get()
    if (!callerSnap.data()?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const usersSnap = await adminDb().collection('users').limit(500).get()

    const users = usersSnap.docs.map((doc) => {
      const data = doc.data()
      return {
        uid: doc.id,
        displayName: data.displayName ?? '',
        email: data.email ?? '',
        photoURL: data.photoURL ?? null,
        kshetra: data.kshetra ?? null,
        isAdmin: data.isAdmin ?? false,
        rajipo: data.rajipo ?? 0,
        streak: data.streak ?? 0,
        longestStreak: data.longestStreak ?? 0,
        lastCompletedDate: data.lastCompletedDate ?? null,
      }
    })

    users.sort((a, b) => b.rajipo - a.rajipo)
    return NextResponse.json({ users })
  } catch (err) {
    console.error('admin users error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
