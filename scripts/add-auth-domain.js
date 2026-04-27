/**
 * Adds localhost and 127.0.0.1 to Firebase Auth authorized domains
 * using the Identity Toolkit Admin API (bypasses Console UI validation).
 *
 * Usage:
 *   node scripts/add-auth-domain.js
 */

const { initializeApp, cert } = require('firebase-admin/app')

const projectId    = process.env.FIREBASE_ADMIN_PROJECT_ID
const clientEmail  = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey   = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })

async function run() {
  const token = await app.options.credential.getAccessToken()
  const base  = `https://identitytoolkit.googleapis.com/v2/projects/${projectId}/config`
  const auth  = { Authorization: `Bearer ${token.access_token}` }

  // Fetch current config
  const getRes  = await fetch(base, { headers: auth })
  const config  = await getRes.json()

  if (!getRes.ok) {
    console.error('GET failed:', config)
    process.exit(1)
  }

  const existing = config.authorizedDomains ?? []
  const merged   = [...new Set([...existing, 'localhost', '127.0.0.1'])]

  console.log('Current domains:', existing)
  console.log('Adding:         localhost, 127.0.0.1')

  const patchRes = await fetch(`${base}?updateMask=authorizedDomains`, {
    method:  'PATCH',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ authorizedDomains: merged }),
  })
  const result = await patchRes.json()

  if (!patchRes.ok) {
    console.error('PATCH failed:', result)
    process.exit(1)
  }

  console.log('✓ Authorized domains now:', result.authorizedDomains)
}

run().catch(err => { console.error(err); process.exit(1) })
