'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { useFcm } from '@/contexts/fcm-context'
import { saveReminder } from '@/lib/firestore-helpers'
import { todayKey } from '@/lib/date-utils'
import type { ReminderPref } from '@/types'

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function nowMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

// Persist fired-today keys in localStorage so page refresh doesn't re-fire
function firedKey(activityId: string): string {
  return `aahanik-notif-${todayKey()}-${activityId}`
}

function hasFiredToday(activityId: string): boolean {
  try {
    return localStorage.getItem(firedKey(activityId)) === '1'
  } catch {
    return false
  }
}

function markFiredToday(activityId: string): void {
  try {
    localStorage.setItem(firedKey(activityId), '1')
  } catch { /* ignore */ }
}

function checkAndFire(
  reminders: Record<string, ReminderPref>,
  todayDoneIds: string[],
  activityNames: Record<string, string>
) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  const now = nowMinutes()

  Object.values(reminders).forEach((pref) => {
    if (!pref.enabled) return
    if (todayDoneIds.includes(pref.activityId)) return
    if (hasFiredToday(pref.activityId)) return

    const reminderAt = toMinutes(pref.time)
    // Fire if we're within a 5-minute window past the reminder time
    if (now < reminderAt || now > reminderAt + 5) return

    markFiredToday(pref.activityId)
    const name = activityNames[pref.activityId] ?? 'your activity'
    new Notification('Aahanik — Time for Seva', {
      body: `${name} — don't forget your daily practice 🙏`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: pref.activityId,
    })
  })
}

export function useReminders(todayDoneIds: string[] = [], activityNames: Record<string, string> = {}) {
  const { user } = useAuth()
  const { requestPermission } = useFcm()
  const [reminders, setReminders] = useState<Record<string, ReminderPref>>({})
  const remindersRef = useRef(reminders)
  const doneIdsRef = useRef(todayDoneIds)
  const namesRef = useRef(activityNames)

  useEffect(() => { remindersRef.current = reminders }, [reminders])
  useEffect(() => { doneIdsRef.current = todayDoneIds }, [todayDoneIds])
  useEffect(() => { namesRef.current = activityNames }, [activityNames])

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

  // Poll every 30s; also check immediately when reminders load
  useEffect(() => {
    const run = () => checkAndFire(remindersRef.current, doneIdsRef.current, namesRef.current)
    run()
    const id = setInterval(run, 30_000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-check when reminders data first loads from Firestore
  useEffect(() => {
    if (Object.keys(reminders).length > 0) {
      checkAndFire(reminders, doneIdsRef.current, namesRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders])

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
