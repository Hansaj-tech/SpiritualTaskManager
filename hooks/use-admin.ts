'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { docToUserProfile } from '@/lib/firestore-helpers'
import { ACTIVITY_IDS, BONUS_ACTIVITY_IDS } from '@/lib/constants'
import type { UserProfile, ActivityId } from '@/types'

export type AdminUser = Omit<UserProfile, 'fcmTokens'>

export type ActivityStats = Record<ActivityId, { done: number; total: number }>

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

function countStats(
  docs: Array<{ date: string; activities: Record<string, { done: boolean }> | undefined }>,
  total: number
): ActivityStats {
  const allIds = [...ACTIVITY_IDS, ...BONUS_ACTIVITY_IDS]
  const counts: Record<string, number> = {}
  for (const id of allIds) counts[id] = 0
  for (const { activities } of docs) {
    if (!activities) continue
    for (const id of allIds) {
      if (activities[id]?.done) counts[id]++
    }
  }
  const result: Record<string, { done: number; total: number }> = {}
  for (const id of allIds) result[id] = { done: counts[id], total }
  return result as ActivityStats
}

export function useAdminUserDetail(uid: string) {
  const { user } = useAuth()
  const [monthlyLog, setMonthlyLog] = useState<ActivityStats>({} as ActivityStats)
  const [lifetimeLog, setLifetimeLog] = useState<ActivityStats>({} as ActivityStats)
  const [monthlyDays, setMonthlyDays] = useState(0)
  const [lifetimeDays, setLifetimeDays] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !uid) return
    let cancelled = false

    const now = new Date()
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
    const logsRef = collection(db, 'users', uid, 'activityLogs')

    // Fetch all logs once, split into monthly and lifetime
    getDocs(logsRef)
      .then((snap) => {
        if (cancelled) return

        const allDocs = snap.docs.map((d) => ({
          date: d.data().date as string,
          activities: d.data().activities as Record<string, { done: boolean }> | undefined,
        }))

        const monthDocs = allDocs.filter(
          (d) => d.date >= monthStart && d.date <= monthEnd
        )

        setLifetimeLog(countStats(allDocs, allDocs.length))
        setMonthlyLog(countStats(monthDocs, monthDocs.length))
        setLifetimeDays(allDocs.length)
        setMonthlyDays(monthDocs.length)
        setLoading(false)
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [user, uid])

  return { monthlyLog, lifetimeLog, monthlyDays, lifetimeDays, loading, error }
}
