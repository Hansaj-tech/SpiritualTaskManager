'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { saveReminder } from '@/lib/firestore-helpers'
import { todayKey } from '@/lib/date-utils'
import type { ReminderPref } from '@/types'

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function nowMinutes(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

function firedKey(id: string) {
  return `aahanik-notif-${todayKey()}-${id}`
}

function hasFiredToday(id: string) {
  try { return localStorage.getItem(firedKey(id)) === '1' } catch { return false }
}

function markFiredToday(id: string) {
  try { localStorage.setItem(firedKey(id), '1') } catch { /**/ }
}

export interface ReminderAlert {
  activityId: string
  name: string
}

export function useReminders(
  todayDoneIds: string[] = [],
  activityNames: Record<string, string> = {}
) {
  const { user } = useAuth()
  const [reminders, setReminders] = useState<Record<string, ReminderPref>>({})
  const [alerts, setAlerts] = useState<ReminderAlert[]>([])

  const remindersRef = useRef(reminders)
  const doneIdsRef   = useRef(todayDoneIds)
  const namesRef     = useRef(activityNames)

  useEffect(() => { remindersRef.current = reminders }, [reminders])
  useEffect(() => { doneIdsRef.current = todayDoneIds }, [todayDoneIds])
  useEffect(() => { namesRef.current = activityNames }, [activityNames])

  const fireAlert = useCallback((activityId: string, name: string) => {
    // In-app alert — always works when app is open
    setAlerts((prev) =>
      prev.find((a) => a.activityId === activityId)
        ? prev
        : [...prev, { activityId, name }]
    )
    // Browser notification — bonus if permission granted
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try { new Notification('Aahanik — Time for Seva', { body: `${name} 🙏`, icon: '/icon-192x192.png', tag: activityId }) } catch { /**/ }
    }
  }, [])

  const checkAndFire = useCallback(() => {
    const now = nowMinutes()
    Object.values(remindersRef.current).forEach((pref) => {
      if (!pref.enabled) return
      if (doneIdsRef.current.includes(pref.activityId)) return
      if (hasFiredToday(pref.activityId)) return

      const at = toMinutes(pref.time)
      if (now < at || now > at + 45) return

      markFiredToday(pref.activityId)
      const name = namesRef.current[pref.activityId] ?? 'Daily Practice'
      fireAlert(pref.activityId, name)
    })
  }, [fireAlert])

  // Real-time Firestore listener
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

  // Poll every 60s + check on mount
  useEffect(() => {
    checkAndFire()
    const id = setInterval(checkAndFire, 60_000)
    return () => clearInterval(id)
  }, [checkAndFire])

  // Check when reminders load from Firestore
  useEffect(() => {
    if (Object.keys(reminders).length > 0) checkAndFire()
  }, [reminders, checkAndFire])

  const dismissAlert = useCallback((activityId: string) => {
    setAlerts((prev) => prev.filter((a) => a.activityId !== activityId))
  }, [])

  const setReminder = useCallback(
    async (pref: ReminderPref) => {
      if (!user) return
      if (pref.enabled && typeof Notification !== 'undefined' && Notification.permission === 'default') {
        await Notification.requestPermission()
      }
      await saveReminder(user.uid, pref)
    },
    [user]
  )

  return { reminders, setReminder, alerts, dismissAlert }
}
