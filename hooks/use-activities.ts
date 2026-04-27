'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  doc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import {
  getActivityDefs,
  getAppConfig,
  saveActivityToggle,
  docToDayLog,
} from '@/lib/firestore-helpers'
import { todayKey, computeActivityStreak } from '@/lib/date-utils'
import { ACTIVITY_IDS } from '@/lib/constants'
import type { ActivityDefinition, DayLog, AppConfig } from '@/types'

export interface ActivityState {
  activityDefs: ActivityDefinition[]
  todayLog: DayLog
  activityStreaks: Record<string, number>
  appConfig: AppConfig
  loading: boolean
  toggleActivity: (activityId: string, done: boolean) => Promise<void>
}

function emptyLog(): DayLog {
  return { date: todayKey(), activities: {}, totalPoints: 0, allCompleted: false }
}

export function useActivities(): ActivityState {
  const { user, userProfile } = useAuth()
  const [activityDefs, setActivityDefs] = useState<ActivityDefinition[]>([])
  const [todayLog, setTodayLog] = useState<DayLog>(emptyLog)
  const [activityStreaks, setActivityStreaks] = useState<Record<string, number>>({})
  const [appConfig, setAppConfig] = useState<AppConfig>({ dailyQuote: '', guruImages: [] })
  const [loading, setLoading] = useState(true)

  // Load static config on mount
  useEffect(() => {
    Promise.all([getActivityDefs(), getAppConfig()]).then(([defs, config]) => {
      setActivityDefs(defs)
      setAppConfig(config)
      setLoading(false)
    })
  }, [])

  // Real-time listener for today's activity log
  useEffect(() => {
    if (!user) return
    const logRef = doc(db, 'users', user.uid, 'activityLogs', todayKey())
    const unsub = onSnapshot(logRef, (snap) => {
      if (snap.exists()) {
        setTodayLog(docToDayLog(snap.data()))
      } else {
        setTodayLog(emptyLog())
      }
    })
    return unsub
  }, [user])

  // Compute per-activity streaks from last 30 logs
  useEffect(() => {
    if (!user) return
    const logsRef = collection(db, 'users', user.uid, 'activityLogs')
    const q = query(logsRef, orderBy('date', 'desc'), limit(30))
    getDocs(q).then((snap) => {
      const allLogs = snap.docs.map((d) => ({
        date: d.data().date as string,
        activities: d.data().activities as Record<string, { done: boolean }>,
      }))
      const today = todayKey()
      const streaks: Record<string, number> = {}
      for (const id of ACTIVITY_IDS) {
        const doneDates = allLogs
          .filter((log) => log.activities?.[id]?.done)
          .map((log) => log.date)
        streaks[id] = computeActivityStreak(doneDates, today)
      }
      setActivityStreaks(streaks)
    })
  }, [user, todayLog.totalPoints])

  const toggleActivity = useCallback(
    async (activityId: string, done: boolean) => {
      if (!user || !userProfile) return
      const def = activityDefs.find((a) => a.id === activityId)
      if (!def) return

      // Optimistic update
      setTodayLog((prev) => {
        const updatedActivities = {
          ...prev.activities,
          [activityId]: {
            done,
            pointsEarned: done ? def.points : 0,
            completedAt: done ? new Date() : null,
          },
        }
        const newTotal = activityDefs.reduce((sum, a) => {
          const entry = updatedActivities[a.id]
          return sum + (entry?.done ? (entry.pointsEarned || a.points) : 0)
        }, 0)
        const allCompleted = ACTIVITY_IDS.every((id) => updatedActivities[id]?.done)
        return { ...prev, activities: updatedActivities, totalPoints: newTotal, allCompleted }
      })

      await saveActivityToggle(
        user.uid,
        activityId,
        done,
        def.points,
        todayLog,
        userProfile,
        activityDefs
      )
    },
    [user, userProfile, activityDefs, todayLog]
  )

  return { activityDefs, todayLog, activityStreaks, appConfig, loading, toggleActivity }
}
