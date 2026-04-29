'use client'

import { useState, useEffect } from 'react'
import { getIdToken } from 'firebase/auth'
import { useAuth } from '@/contexts/auth-context'
import type { LeaderboardEntry } from '@/app/api/leaderboard/route'

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

export function useLeaderboard() {
  const { user } = useAuth()
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    getIdToken(user)
      .then((token) =>
        fetch('/api/leaderboard', { headers: { Authorization: `Bearer ${token}` } })
      )
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json as LeaderboardData)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [user])

  return { data, loading, error }
}
