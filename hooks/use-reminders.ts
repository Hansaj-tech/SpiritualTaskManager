'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { useFcm } from '@/contexts/fcm-context'
import { saveReminder } from '@/lib/firestore-helpers'
import { todayKey } from '@/lib/date-utils'
import type { ReminderPref } from '@/types'

export function useReminders(todayDoneIds: string[] = []) {
  const { user } = useAuth()
  const { requestPermission } = useFcm()
  const [reminders, setReminders] = useState<Record<string, ReminderPref>>({})
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const firedTodayRef = useRef<Set<string>>(new Set())

  // Listen to user's reminders collection
  useEffect(() => {
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'reminders')
    return onSnapshot(ref, (snap) => {
      const prefs: Record<string, ReminderPref> = {}
      snap.docs.forEach((d) => {
        const data = d.data() as ReminderPref
        prefs[data.activityId] = data
      })
      setReminders(prefs)
    })
  }, [user])

  // Poll every 60s and fire local notifications at reminder time
  useEffect(() => {
    if (typeof Notification === 'undefined') return
    if (pollingRef.current) clearInterval(pollingRef.current)

    pollingRef.current = setInterval(() => {
      if (Notification.permission !== 'granted') return
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const today = todayKey()

      Object.values(reminders).forEach((pref) => {
        if (!pref.enabled || pref.time !== currentTime) return
        if (todayDoneIds.includes(pref.activityId)) return

        const key = `${pref.activityId}-${today}`
        if (firedTodayRef.current.has(key)) return
        firedTodayRef.current.add(key)

        new Notification('Aahanik', {
          body: `Time for your daily practice`,
          icon: '/icon.svg',
          tag: pref.activityId,
        })
      })
    }, 60_000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [reminders, todayDoneIds])

  const setReminder = useCallback(
    async (pref: ReminderPref) => {
      if (!user) return
      if (pref.enabled && Notification.permission !== 'granted') {
        await requestPermission()
      }
      await saveReminder(user.uid, pref)
    },
    [user, requestPermission]
  )

  return { reminders, setReminder }
}
