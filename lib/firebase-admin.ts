import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { getAuth } from 'firebase-admin/auth'

let adminApp: App | undefined

function parsePrivateKey(raw: string): string {
  // Vercel stores the key either with literal \n escape sequences or with actual newlines.
  // Handle both so the PEM is always correctly formatted.
  const key = raw.replace(/\\n/g, '\n')
  // Strip surrounding quotes that are sometimes copy-pasted from the JSON file
  return key.replace(/^["']|["']$/g, '')
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
