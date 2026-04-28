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

function firedKey(activityId: string): string {
  return `aahanik-notif-${todayKey()}-${activityId}`
}

function hasFiredToday(activityId: string): boolean {
  try { return localStorage.getItem(firedKey(activityId)) === '1' } catch { return false }
}

function markFiredToday(activityId: string): void {
  try { localStorage.setItem(firedKey(activityId), '1') } catch { /* ignore */ }
}

export async function sendNotification(title: string, body: string, tag: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

  // Try SW first — works even when tab is backgrounded
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration('/')
      if (reg?.active) {
        reg.active.postMessage({ type: 'SHOW_NOTIFICATION', title, body, tag })
        return
      }
    }
  } catch { /* fall through */ }

  // Direct fallback — works when tab is in foreground or backgrounded
  try {
    new Notification(title, { body, icon: '/icon-192x192.png', tag })
  } catch (e) {
    console.error('[Aahanik] Notification failed:', e)
  }
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
    // Fire if within a 45-minute window past the reminder time
    // Wide window so the notification fires even if app was just opened
    if (now < reminderAt || now > reminderAt + 45) return

    markFiredToday(pref.activityId)
    const name = activityNames[pref.activityId] ?? 'your daily practice'
    sendNotification('Aahanik — Time for Seva', `${name} 🙏`, pref.activityId)
  })
}

export function useReminders(
  todayDoneIds: string[] = [],
  activityNames: Record<string, string> = {}
) {
  const { user } = useAuth()
  const { requestPermission } = useFcm()
  const [reminders, setReminders] = useState<Record<string, ReminderPref>>({})
  const remindersRef = useRef(reminders)
  const doneIdsRef = useRef(todayDoneIds)
  const namesRef = useRef(activityNames)

  useEffect(() => { remindersRef.current = reminders }, [reminders])
  useEffect(() => { doneIdsRef.current = todayDoneIds }, [todayDoneIds])
  useEffect(() => { namesRef.current = activityNames }, [activityNames])

  // Real-time listener for reminders
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

  // Poll every 60s
  useEffect(() => {
    const run = () => checkAndFire(remindersRef.current, doneIdsRef.current, namesRef.current)
    run()
    const id = setInterval(run, 60_000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Also check when reminders data loads
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
