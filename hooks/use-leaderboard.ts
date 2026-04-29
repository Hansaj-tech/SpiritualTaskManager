'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import type { LeaderboardEntry } from '@/types'

interface UserLeaderboardData {
  isAdmin: false
  entries: LeaderboardEntry[]
  userRank: number | null
  userEntry: LeaderboardEntry | null
  kshetra: string | null
}

interface AdminLeaderboardData {
  isAdmin: true
  groups: Record<string, LeaderboardEntry[]>
}

export type LeaderboardData = UserLeaderboardData | AdminLeaderboardData

function toEntry(uid: string, data: Record<string, unknown>, currentUid: string, rank: number): LeaderboardEntry {
  return {
    uid,
    displayName: (data.displayName as string) ?? 'Unknown',
    photoURL: (data.photoURL as string | null) ?? null,
    rajipo: (data.rajipo as number) ?? 0,
    tasksCompleted: Math.round(((data.rajipo as number) ?? 0) / 10),
    streak: (data.streak as number) ?? 0,
    rank,
    isCurrentUser: uid === currentUid,
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
          const groups: Record<string, LeaderboardEntry[]> = {}

          snap.docs.forEach((doc) => {
            const d = doc.data()
            const kshetra = (d.kshetra as string) ?? 'Other'
            if (!groups[kshetra]) groups[kshetra] = []
            groups[kshetra].push(toEntry(doc.id, d, user!.uid, 0))
          })

          for (const k of Object.keys(groups)) {
            groups[k]
              .sort((a, b) => b.rajipo - a.rajipo)
              .forEach((e, i) => { e.rank = i + 1 })
          }

          if (!cancelled) setData({ isAdmin: true, groups })
        } else {
          const kshetra = userProfile!.kshetra
          if (!kshetra) {
            if (!cancelled) setData({ isAdmin: false, entries: [], userRank: null, userEntry: null, kshetra: null })
            return
          }

          const snap = await getDocs(query(collection(db, 'users'), where('kshetra', '==', kshetra)))

          const all = snap.docs
            .map((doc) => toEntry(doc.id, doc.data(), user!.uid, 0))
            .sort((a, b) => b.rajipo - a.rajipo)

          all.forEach((e, i) => { e.rank = i + 1 })

          const top5 = all.slice(0, 5)
          const userEntry = all.find((e) => e.uid === user!.uid)

          if (!cancelled) {
            setData({
              isAdmin: false,
              entries: top5,
              userRank: userEntry?.rank ?? null,
              userEntry: userEntry && userEntry.rank > 5 ? userEntry : null,
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
