'use client'

import { useState } from 'react'
import { useAdminUserDetail } from '@/hooks/use-admin'
import { DEFAULT_ACTIVITIES, ACTIVITY_IDS } from '@/lib/constants'
import type { AdminUser, ActivityStats } from '@/hooks/use-admin'

interface UserDetailPanelProps {
  uid: string
  user?: AdminUser
}

type Period = 'month' | 'lifetime'

export function UserDetailPanel({ uid, user }: UserDetailPanelProps) {
  const { monthlyLog, lifetimeLog, monthlyDays, lifetimeDays, loading, error } = useAdminUserDetail(uid)
  const [period, setPeriod] = useState<Period>('month')

  const log: ActivityStats = period === 'month' ? monthlyLog : lifetimeLog
  const totalDays = period === 'month' ? monthlyDays : lifetimeDays
  const periodLabel = period === 'month' ? 'This Month' : 'All Time'

  return (
    <div className="flex flex-col gap-4">
      {/* User summary card */}
      {user && (
        <div className="bg-white rounded-2xl border border-orange-100 p-4">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-lg font-bold text-orange-600">
                {(user.displayName || 'U')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-orange-900">{user.displayName}</p>
              <p className="text-sm text-orange-400">{user.email}</p>
              {user.isAdmin && (
                <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full font-medium">Admin</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 mt-4 pt-4 border-t border-orange-50">
            <div className="text-center">
              <p className="text-lg font-bold text-orange-900">{user.rajipo.toLocaleString()}</p>
              <p className="text-xs text-orange-400">Rajipo</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-orange-900">{user.streak}d</p>
              <p className="text-xs text-orange-400">Streak</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-orange-900">{user.kshetra ?? '—'}</p>
              <p className="text-xs text-orange-400">Kshetra</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-orange-50 grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-base font-bold text-orange-900">{lifetimeDays}</p>
              <p className="text-xs text-orange-400">Total Days Logged</p>
            </div>
            <div>
              <p className="text-base font-bold text-orange-900">{user.longestStreak}d</p>
              <p className="text-xs text-orange-400">Longest Streak</p>
            </div>
          </div>
        </div>
      )}

      {/* Activity breakdown */}
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
        {/* Header + period toggle */}
        <div className="px-4 py-3 border-b border-orange-50 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-orange-900">Activity Breakdown</h3>
          <div className="flex bg-orange-100 rounded-xl p-0.5 gap-0.5">
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                period === 'month'
                  ? 'bg-white text-orange-900 shadow-sm'
                  : 'text-orange-500 hover:text-orange-700'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('lifetime')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                period === 'lifetime'
                  ? 'bg-white text-orange-900 shadow-sm'
                  : 'text-orange-500 hover:text-orange-700'
              }`}
            >
              Lifetime
            </button>
          </div>
        </div>

        {/* Sub-header */}
        <div className="px-4 py-2 bg-orange-50/50 border-b border-orange-50">
          <p className="text-xs text-orange-400 font-medium">
            {periodLabel} — {totalDays} day{totalDays !== 1 ? 's' : ''} logged
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm font-semibold text-red-500 mb-1">Permission denied</p>
            <p className="text-xs text-orange-400 leading-relaxed">
              Go to Firebase Console → Firestore → Rules and add:<br />
              <code className="bg-orange-50 px-1 rounded text-xs">allow read: if isAdmin();</code><br />
              under the activityLogs match block, then click Publish.
            </p>
          </div>
        ) : totalDays === 0 ? (
          <p className="text-sm text-orange-400 text-center py-10">
            No activity data for {periodLabel.toLowerCase()}.
          </p>
        ) : (
          ACTIVITY_IDS.map((id) => {
            const def = DEFAULT_ACTIVITIES[id]
            const stats = log[id] ?? { done: 0, total: totalDays }
            const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
            return (
              <div key={id} className="px-4 py-3 border-b border-orange-50 last:border-0">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-orange-900 font-medium">{def.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-orange-600">{pct}%</span>
                    <span className="text-xs text-orange-400">{stats.done}/{stats.total}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-orange-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-orange-500' : 'bg-orange-300'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
