import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Wrapped in try/catch so Next.js static prerendering (which runs in Node.js
// before NEXT_PUBLIC_ vars are injected by Vercel) does not throw a build error.
// All real Firebase usage is inside 'use client' components/hooks that only
// run in the browser, so undefined exports are never reached at runtime.
let _app: FirebaseApp | undefined
let _auth: Auth | undefined
let _db: Firestore | undefined

try {
  _app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  _auth = getAuth(_app)
  _db   = getFirestore(_app)
} catch {
  // env vars absent during build prerender — client-side code re-initializes
}

export const auth = _auth!
export const db = _db!
export const googleProvider = new GoogleAuthProvider()

export async function getMessagingInstance() {
  if (typeof window === 'undefined' || !_app) return null
  try {
    if (!(await isSupported())) return null
    return getMessaging(_app)
  } catch {
    return null
  }
}
