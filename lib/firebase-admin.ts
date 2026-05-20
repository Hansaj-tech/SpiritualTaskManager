import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { getAuth } from 'firebase-admin/auth'

let adminApp: App | undefined

function parsePrivateKey(raw: string): string {
  const trimmed = raw.trim()
  // Case 1: value was pasted with surrounding quotes from .env.local or the JSON file,
  // e.g.  "-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"
  // JSON.parse handles both the quote removal and \n unescaping in one step.
  if (trimmed.startsWith('"')) {
    try { return JSON.parse(trimmed) } catch { /* fall through */ }
  }
  // Case 2: value has no outer quotes but still has literal \n sequences
  return trimmed.replace(/\\n/g, '\n')
}

function getAdminApp(): App {
  if (!adminApp) {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
          privateKey:  parsePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY!),
        }),
      })
    } else {
      adminApp = getApps()[0]
    }
  }
  return adminApp
}

export const adminDb = () => getFirestore(getAdminApp())
export const adminAuth = () => getAuth(getAdminApp())
export const adminMessaging = () => getMessaging(getAdminApp())
