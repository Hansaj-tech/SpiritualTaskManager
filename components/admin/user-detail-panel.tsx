'use client'

import { useAdminUserDetail } from '@/hooks/use-admin'
import { DEFAULT_ACTIVITIES, ACTIVITY_IDS } from '@/lib/constants'
import type { AdminUser } from '@/hooks/use-admin'

interface UserDetailPanelProps {
  uid: string
  user?: AdminUser
}

export function UserDetailPanel({ uid, user }: UserDetailPanelProps) {
  const { activityLog, loading } = useAdminUserDetail(uid)

  return (
    <div className="flex flex-col gap-4">
      {/* User summary */}
      {user && (
        <div className="bg-white rounded-2xl border border-orange-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-lg font-bold text-orange-600">
              {(user.displayName || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-orange-900">{user.displayName}</p>
              <p className="text-sm text-orange-400">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 mt-4 pt-4 border-t border-orange-50">
            <div className="text-center">
              <p className="text-lg font-bold text-orange-900">{user.rajipo}</p>
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
        </div>
      )}

      {/* Activity breakdown */}
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-orange-50">
          <h3 className="text-sm font-semibold text-orange-900">Activity Breakdown (This Month)</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          </div>
        ) : (
          ACTIVITY_IDS.map((id) => {
            const def = DEFAULT_ACTIVITIES[id]
            const stats = activityLog[id] ?? { done: 0, total: 0 }
            const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
            return (
              <div key={id} className="px-4 py-3 border-b border-orange-50 last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-orange-900">{def.name}</span>
                  <span className="text-xs text-orange-500 font-medium">
                    {stats.done}/{stats.total}
                  </span>
                </div>
                <div className="h-1.5 bg-orange-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
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
