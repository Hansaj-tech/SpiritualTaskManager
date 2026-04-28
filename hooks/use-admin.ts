'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { docToUserProfile } from '@/lib/firestore-helpers'
import { ACTIVITY_IDS } from '@/lib/constants'
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
  const [totalDays, setTotalDays] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !uid) return
    let cancelled = false

    const now = new Date()
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

    const logsRef = collection(db, 'users', uid, 'activityLogs')
    const q = query(logsRef, where('date', '>=', monthStart), where('date', '<=', monthEnd))

    getDocs(q).then((snap) => {
      if (cancelled) return
      const doneCounts: Record<string, number> = {}
      for (const id of ACTIVITY_IDS) doneCounts[id] = 0

      for (const doc of snap.docs) {
        const activities = doc.data().activities as Record<string, { done: boolean }> | undefined
        if (!activities) continue
        for (const id of ACTIVITY_IDS) {
          if (activities[id]?.done) doneCounts[id]++
        }
      }

      const log: Record<string, { done: number; total: number }> = {}
      for (const id of ACTIVITY_IDS) {
        log[id] = { done: doneCounts[id], total: snap.size }
      }
      setActivityLog(log as Record<ActivityId, { done: number; total: number }>)
      setTotalDays(snap.size)
      setLoading(false)
    }).catch(() => setLoading(false))

    return () => { cancelled = true }
  }, [user, uid])

  return { activityLog, totalDays, loading }
}
