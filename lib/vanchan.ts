'use client'

import { useEffect, useState } from 'react'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getActiveDate } from '@/lib/date-utils'
import type { ActivityId } from '@/types'

// Only these two activities have an uploadable book behind them.
export type VanchanActivityId = Extract<ActivityId, 'vachnamrut-vanchan' | 'swamini-vato-vanchan'>

export interface VanchanBook {
  activityId: VanchanActivityId
  title: string
  totalPortions: number
  sourceFileName: string
  uploadedAt: Date | null
  uploadedBy: string
}

// Fixed reference date so "today's portion" is the same for every user and
// stays stable across app restarts — only re-uploading the book (which
// changes totalPortions) shifts the rotation.
const ROTATION_EPOCH = new Date(2020, 0, 1)

export function portionIndexForDate(dateStr: string, totalPortions: number): number {
  if (totalPortions <= 0) return 0
  const days = differenceInCalendarDays(parseISO(dateStr), ROTATION_EPOCH)
  return ((days % totalPortions) + totalPortions) % totalPortions
}

function portionDocId(index: number): string {
  return String(index).padStart(4, '0')
}

export function useVanchanBook(activityId: VanchanActivityId) {
  const [book, setBook] = useState<VanchanBook | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = onSnapshot(
      doc(db, 'vanchanBooks', activityId),
      (snap) => {
        if (!snap.exists()) {
          setBook(null)
        } else {
          const data = snap.data()
          setBook({
            activityId,
            title: data.title ?? '',
            totalPortions: data.totalPortions ?? 0,
            sourceFileName: data.sourceFileName ?? '',
            uploadedAt: data.uploadedAt?.toDate?.() ?? null,
            uploadedBy: data.uploadedBy ?? '',
          })
        }
        setLoading(false)
      },
      (error) => {
        console.error('Vanchan book listener error:', error)
        setLoading(false)
      },
    )
    return () => unsubscribe()
  }, [activityId])

  return { book, loading }
}

export function useVanchanPortion(activityId: VanchanActivityId, index: number | null) {
  const [text, setText] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (index === null) {
      setText(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getDoc(doc(db, 'vanchanBooks', activityId, 'portions', portionDocId(index)))
      .then((snap) => {
        if (cancelled) return
        setText(snap.exists() ? ((snap.data().text as string) ?? '') : null)
      })
      .catch((error) => console.error('Error fetching vanchan portion:', error))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activityId, index])

  return { text, loading }
}

export async function updateVanchanPortionText(activityId: VanchanActivityId, index: number, text: string): Promise<void> {
  await setDoc(
    doc(db, 'vanchanBooks', activityId, 'portions', portionDocId(index)),
    { index, text, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export interface VanchanReader {
  title: string
  index: number
  totalPortions: number
  text: string | null
  loading: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  isToday: boolean
}

// Defaults to today's rotated portion; lets the reader browse elsewhere
// without affecting which portion "today" actually points to.
export function useVanchanReader(activityId: VanchanActivityId, fallbackTitle: string): VanchanReader | undefined {
  const { book } = useVanchanBook(activityId)
  const todayIndex = book ? portionIndexForDate(getActiveDate(), book.totalPortions) : 0
  const [browsingIndex, setBrowsingIndex] = useState<number | null>(null)
  const index = browsingIndex ?? todayIndex
  const { text, loading } = useVanchanPortion(activityId, book ? index : null)

  if (!book || book.totalPortions === 0) return undefined

  return {
    title: book.title || fallbackTitle,
    index,
    totalPortions: book.totalPortions,
    text,
    loading,
    onPrev: () => setBrowsingIndex(Math.max(0, index - 1)),
    onNext: () => setBrowsingIndex(Math.min(book.totalPortions - 1, index + 1)),
    onToday: () => setBrowsingIndex(null),
    isToday: index === todayIndex,
  }
}
