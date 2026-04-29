'use client'

import { useState } from 'react'
import { Trophy, Flame, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KSHETRA_OPTIONS } from '@/lib/constants'
import type { LeaderboardData } from '@/hooks/use-leaderboard'
import type { LeaderboardEntry } from '@/types'

const RANK_STYLES: Record<number, { badge: string; text: string }> = {
  1: { badge: 'bg-amber-400 text-white', text: 'text-amber-600' },
  2: { badge: 'bg-gray-300 text-white', text: 'text-gray-500' },
  3: { badge: 'bg-orange-300 text-white', text: 'text-orange-500' },
}

function EntryRow({ entry, compact = false }: { entry: LeaderboardEntry; compact?: boolean }) {
  const rankStyle = RANK_STYLES[entry.rank]
  const initials = (entry.displayName || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 transition-colors',
        entry.isCurrentUser && 'bg-orange-50 dark:bg-stone-800',
        compact && 'py-2'
      )}
    >
      {/* Rank */}
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
          rankStyle ? rankStyle.badge : 'bg-orange-100 dark:bg-stone-700 text-orange-600 dark:text-orange-400'
        )}
      >
        {entry.rank}
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-stone-700 overflow-hidden flex items-center justify-center text-orange-800 dark:text-orange-200 font-bold text-xs flex-shrink-0">
        {entry.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.photoURL} alt="" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold text-orange-900 dark:text-orange-50 truncate', entry.isCurrentUser && 'text-orange-700 dark:text-orange-300')}>
          {entry.displayName}
          {entry.isCurrentUser && (
            <span className="ml-1.5 text-xs font-normal text-orange-400">(you)</span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-0.5 text-xs text-orange-400">
            <Flame className="w-3 h-3" />
            {entry.streak}d
          </span>
          <span className="text-xs text-orange-300">·</span>
          <span className="text-xs text-orange-400">{entry.tasksCompleted} tasks</span>
        </div>
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <p className={cn('text-sm font-bold', rankStyle ? rankStyle.text : 'text-orange-700')}>
          {entry.rajipo.toLocaleString()}
        </p>
        <p className="text-xs text-orange-300">rajipo</p>
      </div>
    </div>
  )
}

function UserView({ data }: { data: Extract<LeaderboardData, { isAdmin: false }> }) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-orange-100 dark:border-stone-700 overflow-hidden">
      <div className="px-4 py-3.5 border-b border-orange-50 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-orange-900 dark:text-orange-50">Leaderboard</h2>
          {data.kshetra && (
            <span className="text-xs bg-orange-100 dark:bg-stone-700 text-orange-600 dark:text-orange-400 font-semibold px-2 py-0.5 rounded-full">
              {data.kshetra}
            </span>
          )}
        </div>
        {data.userRank && (
          <span className="text-xs text-orange-400 font-medium">
            Your rank: <span className="text-orange-700 font-bold">#{data.userRank}</span>
          </span>
        )}
      </div>

      <div className="divide-y divide-orange-50 dark:divide-stone-800">
        {data.entries.length === 0 ? (
          <p className="text-center text-sm text-orange-300 py-6">No members yet</p>
        ) : (
          data.entries.map((entry) => <EntryRow key={entry.uid} entry={entry} />)
        )}

        {/* Show current user below top 5 if they're not in it */}
        {data.userEntry && (
          <>
            <div className="flex items-center gap-2 px-4 py-1.5">
              <div className="flex-1 border-t border-dashed border-orange-200 dark:border-stone-600" />
              <span className="text-xs text-orange-300">your position</span>
              <div className="flex-1 border-t border-dashed border-orange-200 dark:border-stone-600" />
            </div>
            <EntryRow entry={data.userEntry} />
          </>
        )}
      </div>
    </div>
  )
}

function AdminView({ data }: { data: Extract<LeaderboardData, { isAdmin: true }> }) {
  const kshetras = KSHETRA_OPTIONS.filter((k) => (data.groups[k]?.length ?? 0) > 0)
  const [active, setActive] = useState<string>(kshetras[0] ?? KSHETRA_OPTIONS[0])
  const entries = data.groups[active] ?? []

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-orange-100 dark:border-stone-700 overflow-hidden">
      <div className="px-4 py-3.5 border-b border-orange-50 dark:border-stone-800 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-500" />
        <h2 className="text-sm font-bold text-orange-900 dark:text-orange-50">Leaderboard — All Kshetras</h2>
      </div>

      {/* Kshetra tabs */}
      <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto border-b border-orange-50 dark:border-stone-800 scrollbar-hide">
        {KSHETRA_OPTIONS.map((k) => {
          const count = data.groups[k]?.length ?? 0
          return (
            <button
              key={k}
              onClick={() => setActive(k)}
              className={cn(
                'flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                active === k
                  ? 'bg-orange-600 text-white'
                  : count > 0
                    ? 'bg-orange-100 dark:bg-stone-700 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-stone-600'
                    : 'bg-orange-50 dark:bg-stone-800 text-orange-300 cursor-default'
              )}
            >
              {k}
              {count > 0 && (
                <span className={cn('ml-1', active === k ? 'text-orange-200' : 'text-orange-400')}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-2 bg-orange-50/50 dark:bg-stone-800/50">
        <Star className="w-3 h-3 text-orange-300 flex-shrink-0" />
        <span className="flex-1 text-xs text-orange-400 font-medium uppercase tracking-wide">Member</span>
        <span className="text-xs text-orange-400 font-medium uppercase tracking-wide">Rajipo</span>
      </div>

      <div className="divide-y divide-orange-50 dark:divide-stone-800 max-h-80 overflow-y-auto">
        {entries.length === 0 ? (
          <p className="text-center text-sm text-orange-300 py-6">No members in this kshetra</p>
        ) : (
          entries.map((entry) => <EntryRow key={entry.uid} entry={entry} compact />)
        )}
      </div>
    </div>
  )
}

export function LeaderboardCard({ data }: { data: LeaderboardData }) {
  if (data.isAdmin) return <AdminView data={data} />
  return <UserView data={data} />
}
