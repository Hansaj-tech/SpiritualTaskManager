import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { getAuth } from 'firebase-admin/auth'

function parsePrivateKey(raw: string): string {
  let k = raw.trim()
  // Try JSON.parse: handles keys stored as JSON strings (with quotes + \n escapes)
  try {
    const parsed = JSON.parse(k)
    if (typeof parsed === 'string') return parsed
  } catch {}
  // Strip surrounding quotes (single or double)
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1)
  }
  // Convert literal \n sequences to real newlines
  return k.replace(/\\n/g, '\n')
}

let adminApp: App | undefined

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
