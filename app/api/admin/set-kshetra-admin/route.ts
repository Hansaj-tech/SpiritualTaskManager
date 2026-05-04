import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const idToken = (request.headers.get('authorization') ?? '').replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await adminAuth().verifyIdToken(idToken)
    const callerSnap = await adminDb().collection('users').doc(decoded.uid).get()
    if (!callerSnap.data()?.isAdmin) {
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
