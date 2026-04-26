/**
 * Firebase Configuration
 * 
 * This file initializes and exports Firebase services including:
 * - Firebase App instance
 * - Firebase Auth for authentication
 * - Firestore for database operations
 * 
 * IMPORTANT: Replace the placeholder values below with your actual Firebase project credentials.
 * You can find these in your Firebase Console > Project Settings > General > Your apps
 */

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAGXr2a9ep7xIuKE6-0l-uXN6k7UqAKoBo",
  authDomain: "aahanic-3cd4c.firebaseapp.com",
  projectId: "aahanic-3cd4c",
  storageBucket: "aahanic-3cd4c.firebasestorage.app",
  messagingSenderId: "711551256608",
  appId: "1:711551256608:web:811cffa239787f1af49445",
  measurementId: "G-D30YK3FTFM"
}

// Log config for debugging
console.log('[v0] Firebase authDomain:', firebaseConfig.authDomain)

// Initialize Firebase App (prevent re-initialization in development with hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase Auth
export const auth = getAuth(app)

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider()

// Initialize Firestore Database
export const db = getFirestore(app)

export default app
