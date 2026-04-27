'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import type { UserProfile, ActivityId } from '@/types'

export interface AdminUser extends Omit<UserProfile, 'fcmTokens'> {}

export function useAdminUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    user.getIdToken().then((token) => {
      fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json()
        })
        .then((data) => {
          if (!cancelled) {
            setUsers(data.users ?? [])
            setLoading(false)
          }
        })
        .catch((e: Error) => {
          if (!cancelled) {
            setError(e.message)
            setLoading(false)
          }
        })
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
