'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  doc,
  collection,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import {
  getActivityDefs,
  saveActivityToggle,
  docToDayLog,
} from '@/lib/firestore-helpers'
import { todayKey, computeActivityStreak, getWeekDates } from '@/lib/date-utils'
import { ACTIVITY_IDS, BONUS_ACTIVITY_IDS } from '@/lib/constants'
import type { ActivityDefinition, DayLog, AppConfig } from '@/types'

export interface ActivityState {
  activityDefs: ActivityDefinition[]
  todayLog: DayLog
  activityStreaks: Record<string, number>
  mainStreak: number
  appConfig: AppConfig
  weeklyTaskCount: number | null
  loading: boolean
  toggleActivity: (activityId: string, done: boolean) => Promise<void>
}

type HistoryLog = { date: string; activities: Record<string, { done: boolean }> }

function emptyLog(): DayLog {
  return { date: todayKey(), activities: {}, totalPoints: 0, allCompleted: false }
}

export function useActivities(): ActivityState {
  const { user, userProfile } = useAuth()
  const [activityDefs, setActivityDefs] = useState<ActivityDefinition[]>([])
  const [todayLog, setTodayLog] = useState<DayLog>(emptyLog)
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([])
  const [activityStreaks, setActivityStreaks] = useState<Record<string, number>>({})
  const [mainStreak, setMainStreak] = useState(0)
  const [appConfig, setAppConfig] = useState<AppConfig>({ dailyQuote: '', guruImages: [] })
  const [weeklyTaskCount, setWeeklyTaskCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Load activity defs once on mount
  useEffect(() => {
    getActivityDefs().then((defs) => {
      setActivityDefs(defs)
      setLoading(false)
    })
  }, [])

  // Real-time listener for app config (guru images, daily quote, vanchan, motivations)
  useEffect(() => {
    const configRef = doc(db, 'config', 'app')
    return onSnapshot(configRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setAppConfig({
          dailyQuote: data.dailyQuote ?? '',
          guruImages: data.guruImages ?? [],
          thisWeeksVanchan: data.thisWeeksVanchan ?? undefined,
          motivations: data.motivations ?? undefined,
          motivationDurationHours: data.motivationDurationHours ?? undefined,
          activityYoutubeLinks: data.activityYoutubeLinks ?? undefined,
        })
      }
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

  // Real-time listener for the last 30 historical logs (excludes today)
  // Using onSnapshot instead of getDocs eliminates all async race conditions
  useEffect(() => {
    if (!user) return
    const today = todayKey()
    const logsRef = collection(db, 'users', user.uid, 'activityLogs')
    const q = query(logsRef, orderBy('date', 'desc'), limit(31))
    return onSnapshot(q, (snap) => {
      setHistoryLogs(
        snap.docs
          .map(d => ({
            date: d.data().date as string,
            activities: d.data().activities as Record<string, { done: boolean }>,
          }))
          .filter(log => log.date !== today)
      )
    })
  }, [user])

  // Recompute all streaks synchronously whenever today's done-set or history changes
  useEffect(() => {
    const today = todayKey()

    // Per-activity streaks
    const streaks: Record<string, number> = {}
    for (const id of [...ACTIVITY_IDS, ...BONUS_ACTIVITY_IDS]) {
      const histDone = historyLogs
        .filter(log => log.activities?.[id]?.done)
        .map(log => log.date)
      const doneDates = todayLog.activities[id]?.done
        ? [today, ...histDone]
        : histDone
      streaks[id] = computeActivityStreak(doneDates, today)
    }
    setActivityStreaks(streaks)

    // Main (all-10) streak
    const allDoneToday = ACTIVITY_IDS.every(id => todayLog.activities[id]?.done)
    const histCompleted = historyLogs
      .filter(log => ACTIVITY_IDS.every(id => log.activities?.[id]?.done))
      .map(log => log.date)
    const mainDates = allDoneToday ? [today, ...histCompleted] : histCompleted
    setMainStreak(computeActivityStreak(mainDates, today))
  }, [todayLog.activities, historyLogs])

  // On Sundays: compute total tasks done for the week (Mon–Sun = max 70)
  useEffect(() => {
    if (!user) return
    if (new Date().getDay() !== 0) return
    const weekDates = getWeekDates(todayKey())
    const monToSat = weekDates.slice(0, 6)
    const logsRef = collection(db, 'users', user.uid, 'activityLogs')
    getDocs(query(logsRef, where('date', 'in', monToSat))).then((snap) => {
      let count = snap.docs.reduce((sum, d) => {
        const acts = d.data().activities as Record<string, { done: boolean }> | undefined
        return sum + ACTIVITY_IDS.filter((id) => acts?.[id]?.done).length
      }, 0)
      count += ACTIVITY_IDS.filter((id) => todayLog.activities[id]?.done).length
      setWeeklyTaskCount(count)
    })
  }, [user, todayLog])

  const toggleActivity = useCallback(
    async (activityId: string, done: boolean) => {
      if (!user || !userProfile) return
      const def = activityDefs.find((a) => a.id === activityId)
      if (!def) return

      // Pre-compute streak from post-toggle state before the optimistic update
      const today = todayKey()
      const nextActivities = { ...todayLog.activities, [activityId]: { done } }
      const willAllComplete = ACTIVITY_IDS.every(id => nextActivities[id]?.done)
      const histCompleted = historyLogs
        .filter(log => ACTIVITY_IDS.every(id => log.activities?.[id]?.done))
        .map(log => log.date)
        .sort((a, b) => b.localeCompare(a))
      const streakDates = willAllComplete ? [today, ...histCompleted] : histCompleted
      const streakData = {
        streak: computeActivityStreak(streakDates, today),
        lastCompletedDate: willAllComplete ? today : (histCompleted[0] ?? null),
      }

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
        activityDefs,
        streakData
      )
    },
    [user, userProfile, activityDefs, todayLog, historyLogs]
  )

  return { activityDefs, todayLog, activityStreaks, mainStreak, appConfig, weeklyTaskCount, loading, toggleActivity }
}
