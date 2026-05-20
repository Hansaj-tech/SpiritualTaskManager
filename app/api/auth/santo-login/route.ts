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

    // Diagnose the private key before passing to Admin SDK
    const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? ''
    const keyInfo = {
      length: rawKey.length,
      firstChars: rawKey.substring(0, 30),
      lastChars: rawKey.substring(rawKey.length - 30),
      hasLiteralBackslashN: rawKey.includes('\\n'),
      hasRealNewline: rawKey.includes('\n'),
      startsWithQuote: rawKey.startsWith('"'),
    }
    console.log('Key diagnostic:', JSON.stringify(keyInfo))

    const token = await adminAuth().createCustomToken(SANTO_UID, { isAdmin: true })
    return NextResponse.json({ token })
  } catch (err) {
    console.error('Santo login error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
