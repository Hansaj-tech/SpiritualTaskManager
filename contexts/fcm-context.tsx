'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getMessagingInstance } from '@/lib/firebase'

interface FcmContextValue {
  hasPermission: boolean
  requestPermission: () => Promise<string | null>
}

const FcmContext = createContext<FcmContextValue>({
  hasPermission: false,
  requestPermission: async () => null,
})

export function FcmProvider({ children }: { children: ReactNode }) {
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setHasPermission(Notification.permission === 'granted')
    }
  }, [])

  // Listen for foreground FCM messages
  useEffect(() => {
    let unsub: (() => void) | undefined
    getMessagingInstance().then(async (messaging) => {
      if (!messaging) return
      const { onMessage } = await import('firebase/messaging')
      unsub = onMessage(messaging, (payload) => {
        if (Notification.permission === 'granted' && payload.notification) {
          new Notification(payload.notification.title ?? 'Aahanik', {
            body: payload.notification.body,
            icon: '/icon-192x192.png',
          })
        }
      })
    })
    return () => unsub?.()
  }, [])

  async function requestPermission(): Promise<string | null> {
    if (typeof Notification === 'undefined') return null
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null
    setHasPermission(true)

    try {
      const messaging = await getMessagingInstance()
      if (!messaging) return null
      const { getToken } = await import('firebase/messaging')
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      })
      return token
    } catch {
      return null
    }
  }

  return (
    <FcmContext.Provider value={{ hasPermission, requestPermission }}>
      {children}
    </FcmContext.Provider>
  )
}

export function useFcm() {
  return useContext(FcmContext)
}
