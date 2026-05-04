import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  if (
    !process.env.FIREBASE_ADMIN_PROJECT_ID ||
    !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    !process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    console.error('Missing Firebase Admin env vars')
    return NextResponse.json({ error: 'Server misconfigured: Firebase Admin env vars not set' }, { status: 500 })
  }

  try {
    const idToken = (request.headers.get('authorization') ?? '').replace('Bearer ', '').trim()
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await adminAuth().verifyIdToken(idToken)
    const callerSnap = await adminDb().collection('users').doc(decoded.uid).get()
    if (callerSnap.data()?.isAdmin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json() as { uid?: string; isKshetraAdmin?: boolean }
    if (!body.uid || typeof body.isKshetraAdmin !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    await adminDb().collection('users').doc(body.uid).update({ isKshetraAdmin: body.isKshetraAdmin })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('set-kshetra-admin error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
