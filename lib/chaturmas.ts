'use client'

import { useEffect, useState } from 'react'
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { differenceInCalendarDays } from 'date-fns'
import { db } from '@/lib/firebase'

export type Lang = 'en' | 'gu'

export interface Bilingual {
  en: string
  gu: string
}

export interface ChaturmasSeasonConfig {
  year: number
  startDate: Date
  endDate: Date
  totalDays: number
}

export interface ChaturmasText {
  id: string
  name: string
  nameGu: string
  totalUnits: number
  order: number
  taskListMatch: string | null
  gradient: string
}

export interface ChaturmasReading {
  day: number
  textId: string
  unitLabel: Bilingual
  original: Bilingual
  keyTeaching: Bilingual
  memorablePassage: Bilingual
  storyCard: {
    title: Bilingual
    summary: Bilingual
    imageUrl: string
  }
}

export function pick(b: Bilingual, lang: Lang): string {
  return lang === 'gu' ? b.gu : b.en
}

export function dayKey(day: number): string {
  return String(day).padStart(3, '0')
}

export function getChaturmasDayNumber(date: Date, config: ChaturmasSeasonConfig): number | null {
  const diff = differenceInCalendarDays(date, config.startDate) + 1
  if (diff < 1 || diff > config.totalDays) return null
  return diff
}

async function fetchSeasonConfig(): Promise<ChaturmasSeasonConfig | null> {
  const snap = await getDoc(doc(db, 'chaturmasConfig', 'current'))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    year: data.year,
    startDate: data.startDate.toDate(),
    endDate: data.endDate.toDate(),
    totalDays: data.totalDays,
  }
}

async function fetchChaturmasTexts(): Promise<ChaturmasText[]> {
  const q = query(collection(db, 'chaturmasTexts'), orderBy('order'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChaturmasText, 'id'>) }))
}

async function fetchReading(textId: string, day: number): Promise<ChaturmasReading | null> {
  const snap = await getDoc(doc(db, 'chaturmasTexts', textId, 'readings', dayKey(day)))
  if (!snap.exists()) return null
  return snap.data() as ChaturmasReading
}

export function useSeasonConfig() {
  const [config, setConfig] = useState<ChaturmasSeasonConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchSeasonConfig()
      .then((c) => {
        if (!cancelled) setConfig(c)
      })
      .catch((error) => console.error('Error fetching Chaturmas season config:', error))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { config, loading }
}

export function useChaturmasTexts() {
  const [texts, setTexts] = useState<ChaturmasText[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchChaturmasTexts()
      .then((t) => {
        if (!cancelled) setTexts(t)
      })
      .catch((error) => console.error('Error fetching Chaturmas texts:', error))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { texts, loading }
}

export function useReading(textId: string | null, day: number | null) {
  const [reading, setReading] = useState<ChaturmasReading | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!textId || !day) {
      setReading(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchReading(textId, day)
      .then((r) => {
        if (!cancelled) setReading(r)
      })
      .catch((error) => console.error('Error fetching Chaturmas reading:', error))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [textId, day])

  return { reading, loading }
}

export async function markChaturmasProgress(uid: string, textId: string, day: number) {
  await setDoc(
    doc(db, 'users', uid, 'chaturmasProgress', textId),
    {
      textId,
      completedDays: arrayUnion(day),
      lastReadDay: day,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export function useChaturmasProgress(uid: string | undefined, textId: string) {
  const [completedDays, setCompletedDays] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid || !textId) {
      setCompletedDays([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = onSnapshot(
      doc(db, 'users', uid, 'chaturmasProgress', textId),
      (snap) => {
        setCompletedDays(snap.exists() ? ((snap.data().completedDays as number[]) ?? []) : [])
        setLoading(false)
      },
      (error) => {
        console.error('Chaturmas progress listener error:', error)
        setLoading(false)
      },
    )
    return () => unsubscribe()
  }, [uid, textId])

  return { completedDays, loading }
}
