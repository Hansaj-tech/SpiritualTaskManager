import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

const SANTO_UID = 'santo-global-admin'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const envUser = process.env.SANTO_USERNAME
  const envPass = process.env.SANTO_PASSWORD

  if (!envUser || !envPass || username !== envUser || password !== envPass) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const db = adminDb()
  const ref = db.collection('users').doc(SANTO_UID)
  const snap = await ref.get()

  if (!snap.exists) {
    await ref.set({
      displayName: 'Santo Admin',
      email: '',
      photoURL: null,
      kshetra: 'K1',
      isAdmin: true,
      isKshetraAdmin: false,
      rajipo: 0,
      monthlyRajipo: 0,
      monthlyRajipoMonth: '',
      streak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      fcmTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  } else {
    await ref.update({ isAdmin: true, updatedAt: new Date() })
  }

  const token = await adminAuth().createCustomToken(SANTO_UID)
  return NextResponse.json({ token })
}
