'use client'

import { useEffect, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc, type Timestamp } from 'firebase/firestore'
import { format } from 'date-fns'
import { db } from '@/lib/firebase'

export interface DailyLog {
  date: string
  tasks: Record<string, boolean>
  chaturmasReadings: Record<string, boolean>
  submitted: boolean
  submittedAt: Timestamp | null
  pointsAwarded: number
  updatedAt: Timestamp | null
}

export function todayKey(d: Date = new Date()): string {
  return format(d, 'yyyy-MM-dd')
}

function dailyLogRef(uid: string, dateKey: string) {
  return doc(db, 'users', uid, 'dailyLog', dateKey)
}

export function useDailyLog(uid: string | undefined, dateKey: string) {
  const [log, setLog] = useState<DailyLog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setLog(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = onSnapshot(
      dailyLogRef(uid, dateKey),
      (snap) => {
        setLog(snap.exists() ? (snap.data() as DailyLog) : null)
        setLoading(false)
      },
      (error) => {
        console.error('Daily log listener error:', error)
        setLoading(false)
      },
    )
    return () => unsubscribe()
  }, [uid, dateKey])

  return { log, loading }
}

export async function toggleTaskInLog(uid: string, dateKey: string, taskName: string, done: boolean) {
  await setDoc(
    dailyLogRef(uid, dateKey),
    { date: dateKey, [`tasks.${taskName}`]: done, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export async function submitDailyLog(uid: string, dateKey: string, pointsAwarded: number) {
  await setDoc(
    dailyLogRef(uid, dateKey),
    {
      date: dateKey,
      submitted: true,
      submittedAt: serverTimestamp(),
      pointsAwarded,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function markChaturmasReading(
  uid: string,
  dateKey: string,
  textId: string,
  alreadySubmittedToday: boolean,
  taskName: string | null,
) {
  const update: Record<string, unknown> = {
    date: dateKey,
    [`chaturmasReadings.${textId}`]: true,
    updatedAt: serverTimestamp(),
  }
  if (taskName && !alreadySubmittedToday) {
    update[`tasks.${taskName}`] = true
  }
  await setDoc(dailyLogRef(uid, dateKey), update, { merge: true })
}
