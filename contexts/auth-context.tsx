'use client'

/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app:
 * - Current user state
 * - Loading state
 * - User data from Firestore (wallet, streak, etc.)
 * - Login/logout methods
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  type User 
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { auth, googleProvider, db } from '@/lib/firebase'

// Type definition for user data stored in Firestore
export interface UserData {
  wallet: number
  streak: number
  lastUpdated: Date | null
  displayName: string | null
  kshetra: string | null
}

// Type definition for the auth context
interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshUserData: () => Promise<void>
  updateUserProfile: (name: string, kshetra: string) => Promise<void>
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
  refreshUserData: async () => {},
  updateUserProfile: async () => {},
})

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * Fetches or creates user data from Firestore
   * On first login, creates a new document with default values
   */
  const fetchUserData = async (uid: string) => {
    const userDocRef = doc(db, 'users', uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      // User exists, load their data
      const data = userDoc.data()
      setUserData({
        wallet: data.wallet || 0,
        streak: data.streak || 0,
        lastUpdated: data.lastUpdated?.toDate() || null,
        displayName: data.displayName || null,
        kshetra: data.kshetra || null,
      })
    } else {
      // First time login - create new user document with default values
      const defaultData = {
        wallet: 0,
        streak: 0,
        lastUpdated: null,
        displayName: null,
        kshetra: null,
      }
      await setDoc(userDocRef, defaultData)
      setUserData(defaultData)
    }
  }

  /**
   * Refresh user data from Firestore
   * Called after submitting tasks to update local state
   */
  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.uid)
    }
  }

  /**
   * Update user profile (name and kshetra)
   */
  const updateUserProfile = async (name: string, kshetra: string) => {
    if (!user) return
    
    const userDocRef = doc(db, 'users', user.uid)
    await setDoc(userDocRef, { displayName: name, kshetra }, { merge: true })
    
    // Update local state
    setUserData(prev => prev ? { ...prev, displayName: name, kshetra } : null)
  }

  /**
   * Login with Google popup
   */
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  /**
   * Logout the current user
   */
  const logout = async () => {
    try {
      await signOut(auth)
      setUserData(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      
      if (currentUser) {
        await fetchUserData(currentUser.uid)
      } else {
        setUserData(null)
      }
      
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        userData, 
        loading, 
        loginWithGoogle, 
        logout,
        refreshUserData,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
