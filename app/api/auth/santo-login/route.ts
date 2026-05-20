import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

const SANTO_UID = 'santo-global-admin'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    const envUser = process.env.SANTO_USERNAME ?? 'santo'
    const envPass = process.env.SANTO_PASSWORD ?? 'aahanik@2025'

    if (username !== envUser || password !== envPass) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Create custom token — Firestore profile is created/updated client-side after sign-in
    const token = await adminAuth().createCustomToken(SANTO_UID, { isAdmin: true })
    return NextResponse.json({ token })
  } catch (err) {
    console.error('Santo login error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
