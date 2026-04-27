'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import {
  getOrCreateUserProfile,
  updateUserKshetra,
  updateUserProfileData,
} from '@/lib/firestore-helpers'
import type { UserProfile } from '@/types'
import Cookies from 'js-cookie'

interface AuthContextValue {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateKshetra: (kshetra: string) => Promise<void>
  updateProfile: (data: { displayName?: string; photoURL?: string | null }) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Set auth cookie immediately so proxy lets the user through
        Cookies.set('aahanik-uid', firebaseUser.uid, { expires: 30, sameSite: 'Lax' })
        setUser(firebaseUser)
        try {
          const profile = await getOrCreateUserProfile(firebaseUser.uid, {
            displayName: firebaseUser.displayName ?? '',
            email: firebaseUser.email ?? '',
            photoURL: firebaseUser.photoURL,
          })
          setUserProfile(profile)
          if (profile.kshetra) {
            Cookies.set('aahanik-onboarded', '1', { expires: 30, sameSite: 'Lax' })
          }
        } catch {
          // Firestore unavailable — user can still navigate; profile loads on retry
        }
      } else {
        setUser(null)
        setUserProfile(null)
        Cookies.remove('aahanik-uid')
        Cookies.remove('aahanik-onboarded')
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function loginWithGoogle() {
    await signInWithPopup(auth, googleProvider)
  }

  async function logout() {
    await signOut(auth)
    Cookies.remove('aahanik-uid')
    Cookies.remove('aahanik-onboarded')
  }

  async function updateKshetra(kshetra: string) {
    if (!user) return
    await updateUserKshetra(user.uid, kshetra)
    setUserProfile(prev => (prev ? { ...prev, kshetra } : null))
    Cookies.set('aahanik-onboarded', '1', { expires: 30, sameSite: 'Lax' })
  }

  async function updateProfile(data: { displayName?: string; photoURL?: string | null }) {
    if (!user) return
    await updateUserProfileData(user.uid, data)
    setUserProfile(prev => (prev ? { ...prev, ...data } : null))
  }

  async function refreshProfile() {
    if (!user) return
    const profile = await getOrCreateUserProfile(user.uid, {
      displayName: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL,
    })
    setUserProfile(profile)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        loginWithGoogle,
        logout,
        updateKshetra,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
