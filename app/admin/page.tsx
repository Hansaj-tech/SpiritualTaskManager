'use client'

import { useState, useMemo } from 'react'
import { useAdminUsers } from '@/hooks/use-admin'
import { UsersTable } from '@/components/admin/users-table'
import { useAuth } from '@/contexts/auth-context'

export default function AdminPage() {
  const { userProfile } = useAuth()
  const { users, loading, error } = useAdminUsers()
  const [activeKshetra, setActiveKshetra] = useState<string | null>(null)

  const isGlobalAdmin = userProfile?.isAdmin

  const { kshetrasWithUsers, kshetraCounts, noKshetraCount } = useMemo(() => {
    const counts: Record<string, number> = {}
    let noKsh = 0
    for (const u of users) {
      if (u.kshetra) {
        counts[u.kshetra] = (counts[u.kshetra] ?? 0) + 1
      } else {
        noKsh++
      }
    }
    const sorted = Object.keys(counts).sort(
      (a, b) => parseInt(a.replace('K', '')) - parseInt(b.replace('K', ''))
    )
    return { kshetrasWithUsers: sorted, kshetraCounts: counts, noKshetraCount: noKsh }
  }, [users])

  const filteredUsers = useMemo(() => {
    if (!isGlobalAdmin || activeKshetra === null) return users
    if (activeKshetra === '__none__') return users.filter(u => !u.kshetra)
    return users.filter(u => u.kshetra === activeKshetra)
  }, [users, isGlobalAdmin, activeKshetra])

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
      active
        ? 'bg-orange-600 text-white shadow-sm'
        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    }`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-orange-900">Users</h1>
        <span className="text-sm text-orange-500">{filteredUsers.length} members</span>
      </div>

      {isGlobalAdmin && !loading && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveKshetra(null)}
            className={tabClass(activeKshetra === null)}
          >
            All ({users.length})
          </button>
          {kshetrasWithUsers.map(k => (
            <button
              key={k}
              onClick={() => setActiveKshetra(k)}
              className={tabClass(activeKshetra === k)}
            >
              {k} ({kshetraCounts[k]})
            </button>
          ))}
          {noKshetraCount > 0 && (
            <button
              onClick={() => setActiveKshetra('__none__')}
              className={tabClass(activeKshetra === '__none__')}
            >
              No Kshetra ({noKshetraCount})
            </button>
          )}
        </div>
      )}

      <UsersTable users={filteredUsers} loading={loading} error={error} />
    </div>
  )
}
