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

    const token = await adminAuth().createCustomToken(SANTO_UID)
    return NextResponse.json({ token })
  } catch (err) {
    const raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? ''

    // Try every normalisation approach and report the PEM structure each produces
    function pemInfo(key: string) {
      const lines = key.split('\n').filter(Boolean)
      return `lines=${lines.length} | [0]=${JSON.stringify(lines[0]?.slice(0, 40))} | [-1]=${JSON.stringify(lines[lines.length - 1]?.slice(0, 40))}`
    }

    const a1 = raw.replace(/\\n/g, '\n')

    let a2 = raw.trim()
    if ((a2.startsWith('"') && a2.endsWith('"')) || (a2.startsWith("'") && a2.endsWith("'"))) a2 = a2.slice(1, -1)
    a2 = a2.replace(/\\n/g, '\n')

    let a3 = 'JSON.parse failed'
    try {
      const p = JSON.parse(raw.trim())
      a3 = typeof p === 'string' ? p.replace(/\\n/g, '\n') : `not-string: ${typeof p}`
    } catch {}

    const diag = {
      error: String(err),
      raw_len: raw.length,
      raw_char0: JSON.stringify(raw[0]),
      raw_charN: JSON.stringify(raw[raw.length - 1]),
      has_literal_slash_n: raw.includes('\\n'),
      has_real_newline: raw.includes('\n'),
      a1_replace: pemInfo(a1),
      a2_stripQuotes_replace: pemInfo(a2),
      a3_jsonParse: typeof a3 === 'string' && a3 !== 'JSON.parse failed' ? pemInfo(a3) : a3,
    }

    console.error('Santo key diag:', JSON.stringify(diag))
    return NextResponse.json(diag, { status: 500 })
  }
}
