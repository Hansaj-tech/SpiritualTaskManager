'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { docToUserProfile } from '@/lib/firestore-helpers'
import type { UserProfile, ActivityId } from '@/types'

export type AdminUser = Omit<UserProfile, 'fcmTokens'>

export function useAdminUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    getDocs(collection(db, 'users'))
      .then((snap) => {
        if (cancelled) return
        const list: AdminUser[] = snap.docs.map((d) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { fcmTokens, ...rest } = docToUserProfile(d.id, d.data())
          return rest
        })
        list.sort((a, b) => (b.rajipo ?? 0) - (a.rajipo ?? 0))
        setUsers(list)
        setLoading(false)
      })
      .catch((e: Error) => {
        if (cancelled) return
        setError(e.message)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [user])

  return { users, loading, error }
}

export function useAdminUserDetail(uid: string) {
  const { user } = useAuth()
  const [activityLog, setActivityLog] = useState<Record<ActivityId, { done: number; total: number }>>({} as never)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !uid) return
    let cancelled = false
    user.getIdToken().then((token) => {
      fetch(`/api/admin/activity-log?uid=${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) {
            setActivityLog(data.activityLog ?? {})
            setLoading(false)
          }
        })
    })
    return () => { cancelled = true }
  }, [user, uid])

  return { activityLog, loading }
}
