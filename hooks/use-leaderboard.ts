'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import type { LeaderboardEntry } from '@/types'

export interface RankedView {
  entries: LeaderboardEntry[]
  userRank: number | null
  userEntry: LeaderboardEntry | null
}

interface UserLeaderboardData {
  isAdmin: false
  monthly: RankedView
  lifetime: RankedView
  kshetra: string | null
}

interface AdminLeaderboardData {
  isAdmin: true
  monthly: Record<string, LeaderboardEntry[]>
  lifetime: Record<string, LeaderboardEntry[]>
}

export type LeaderboardData = UserLeaderboardData | AdminLeaderboardData

function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7) // YYYY-MM
}

function toEntry(uid: string, data: Record<string, unknown>, currentUid: string): Omit<LeaderboardEntry, 'rank'> {
  const month = currentMonthKey()
  const storedMonth = (data.monthlyRajipoMonth as string) ?? ''
  const monthlyRajipo = storedMonth === month ? ((data.monthlyRajipo as number) ?? 0) : 0
  return {
    uid,
    displayName: (data.displayName as string) ?? 'Unknown',
    photoURL: (data.photoURL as string | null) ?? null,
    rajipo: (data.rajipo as number) ?? 0,
    monthlyRajipo,
    tasksCompleted: Math.round(((data.rajipo as number) ?? 0) / 10),
    streak: (data.streak as number) ?? 0,
    isCurrentUser: uid === currentUid,
  }
}

function buildRankedView(
  entries: (Omit<LeaderboardEntry, 'rank'>)[],
  sortKey: 'rajipo' | 'monthlyRajipo',
  currentUid: string
): RankedView {
  const sorted = [...entries]
    .sort((a, b) => b[sortKey] - a[sortKey])
    .map((e, i) => ({ ...e, rank: i + 1 }))

  const top5 = sorted.slice(0, 5)
  const userEntry = sorted.find((e) => e.uid === currentUid)

  return {
    entries: top5,
    userRank: userEntry?.rank ?? null,
    userEntry: userEntry && userEntry.rank > 5 ? userEntry : null,
  }
}

export function useLeaderboard() {
  const { user, userProfile } = useAuth()
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !userProfile) return
    let cancelled = false

    async function load() {
      try {
        if (userProfile!.isAdmin) {
          const snap = await getDocs(collection(db, 'users'))
          const monthly: Record<string, LeaderboardEntry[]> = {}
          const lifetime: Record<string, LeaderboardEntry[]> = {}

          const byKshetra: Record<string, Omit<LeaderboardEntry, 'rank'>[]> = {}
          snap.docs.forEach((doc) => {
            const d = doc.data()
            const kshetra = (d.kshetra as string) ?? 'Other'
            if (!byKshetra[kshetra]) byKshetra[kshetra] = []
            byKshetra[kshetra].push(toEntry(doc.id, d, user!.uid))
          })

          for (const k of Object.keys(byKshetra)) {
            monthly[k] = [...byKshetra[k]]
              .sort((a, b) => b.monthlyRajipo - a.monthlyRajipo)
              .map((e, i) => ({ ...e, rank: i + 1 }))
            lifetime[k] = [...byKshetra[k]]
              .sort((a, b) => b.rajipo - a.rajipo)
              .map((e, i) => ({ ...e, rank: i + 1 }))
          }

          if (!cancelled) setData({ isAdmin: true, monthly, lifetime })
        } else if (userProfile!.isKshetraAdmin && userProfile!.kshetra) {
          const kshetra = userProfile!.kshetra
          const snap = await getDocs(query(collection(db, 'users'), where('kshetra', '==', kshetra)))
          const entries = snap.docs.map((doc) => toEntry(doc.id, doc.data(), user!.uid))
          const monthly: Record<string, LeaderboardEntry[]> = {
            [kshetra]: [...entries].sort((a, b) => b.monthlyRajipo - a.monthlyRajipo).map((e, i) => ({ ...e, rank: i + 1 })),
          }
          const lifetime: Record<string, LeaderboardEntry[]> = {
            [kshetra]: [...entries].sort((a, b) => b.rajipo - a.rajipo).map((e, i) => ({ ...e, rank: i + 1 })),
          }
          if (!cancelled) setData({ isAdmin: true, monthly, lifetime })
        } else {
          const kshetra = userProfile!.kshetra
          if (!kshetra) {
            const empty: RankedView = { entries: [], userRank: null, userEntry: null }
            if (!cancelled) setData({ isAdmin: false, monthly: empty, lifetime: empty, kshetra: null })
            return
          }

          const snap = await getDocs(query(collection(db, 'users'), where('kshetra', '==', kshetra)))
          const entries = snap.docs.map((doc) => toEntry(doc.id, doc.data(), user!.uid))

          if (!cancelled) {
            setData({
              isAdmin: false,
              monthly: buildRankedView(entries, 'monthlyRajipo', user!.uid),
              lifetime: buildRankedView(entries, 'rajipo', user!.uid),
              kshetra,
            })
          }
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [user, userProfile])

  return { data, loading, error }
}
