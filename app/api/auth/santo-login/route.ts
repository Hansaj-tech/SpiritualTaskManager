import { NextResponse } from 'next/server'
import crypto from 'crypto'

const SANTO_UID = 'santo-global-admin'

// Builds a Firebase custom token (RS256 JWT) without the firebase-admin SDK.
function buildCustomToken(uid: string, clientEmail: string, privateKeyPem: string): string {
  const now = Math.floor(Date.now() / 1000)
  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: now,
    exp: now + 3600,
    uid,
  })).toString('base64url')
  const input = `${header}.${payload}`
  // Explicitly create a KeyObject (required for OpenSSL 3 / Node 18+)
  const keyObject = crypto.createPrivateKey({ key: privateKeyPem, format: 'pem', type: 'pkcs8' })
  const sig = crypto.createSign('RSA-SHA256').update(input).sign(keyObject, 'base64url')
  return `${input}.${sig}`
}

// Normalise the private key regardless of how it was pasted into Vercel:
//   • with surrounding quotes   → strip them
//   • with literal \n sequences → convert to real newlines
//   • already has real newlines → leave as-is
function normaliseKey(raw: string): string {
  let k = raw.trim()
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1)
  }
  return k.replace(/\\n/g, '\n')
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    const envUser = process.env.SANTO_USERNAME ?? 'santo'
    const envPass = process.env.SANTO_PASSWORD ?? 'aahanik@2025'

    if (username !== envUser || password !== envPass) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    const rawKey      = process.env.FIREBASE_ADMIN_PRIVATE_KEY

    if (!clientEmail || !rawKey) {
      return NextResponse.json({ error: 'Server: admin env vars missing' }, { status: 500 })
    }

    const privateKey = normaliseKey(rawKey)
    const token = buildCustomToken(SANTO_UID, clientEmail, privateKey)
    return NextResponse.json({ token })
  } catch (err) {
    const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? ''
    const keyFirst = rawKey.substring(0, 40)
    console.error('Santo login error:', err, '| key starts with:', JSON.stringify(keyFirst))
    return NextResponse.json({ error: String(err), keyFirst }, { status: 500 })
  }
}
