import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? ''
    const idToken = authHeader.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await adminAuth().verifyIdToken(idToken)
    const { token } = await request.json() as { token?: string }
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

    await adminDb()
      .collection('users')
      .doc(decoded.uid)
      .update({ fcmTokens: FieldValue.arrayUnion(token) })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('save-token error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
