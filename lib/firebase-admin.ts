import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { getAuth } from 'firebase-admin/auth'

let adminApp: App | undefined

function getAdminApp(): App {
  if (!adminApp) {
    if (getApps().length === 0) {
      // Preferred: full service account JSON as one env var — no key parsing issues
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
        adminApp = initializeApp({ credential: cert(sa) })
      } else {
        adminApp = initializeApp({
          credential: cert({
            projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
            privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
          }),
        })
      }
    } else {
      adminApp = getApps()[0]
    }
  }
  return adminApp
}

export const adminDb = () => getFirestore(getAdminApp())
export const adminAuth = () => getAuth(getAdminApp())
export const adminMessaging = () => getMessaging(getAdminApp())
