'use client'

import { useState, useMemo } from 'react'
import { useAdminUsers } from '@/hooks/use-admin'
import { UsersTable } from '@/components/admin/users-table'
import { useAuth } from '@/contexts/auth-context'
import { Search, X } from 'lucide-react'

export default function AdminPage() {
  const { userProfile } = useAuth()
  const { users, loading, error } = useAdminUsers()
  const [activeKshetra, setActiveKshetra] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const isGlobalAdmin = userProfile?.isAdmin
  const isMultiKshetraAdmin = !userProfile?.isAdmin && userProfile?.isKshetraAdmin && (userProfile?.adminKshetras?.length ?? 0) > 1
  const showKshetraTabs = isGlobalAdmin || isMultiKshetraAdmin

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
    const sorted = Object.keys(counts).sort((a, b) => {
      const numA = parseInt(a.replace('K', ''))
      const numB = parseInt(b.replace('K', ''))
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB
      if (!isNaN(numA)) return -1
      if (!isNaN(numB)) return 1
      return a.localeCompare(b)
    })
    return { kshetrasWithUsers: sorted, kshetraCounts: counts, noKshetraCount: noKsh }
  }, [users])

  const filteredUsers = useMemo(() => {
    let base = users
    if (showKshetraTabs && activeKshetra !== null) {
      if (activeKshetra === '__none__') base = users.filter(u => !u.kshetra)
      else base = users.filter(u => u.kshetra === activeKshetra)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      base = base.filter(u =>
        u.displayName.toLowerCase().includes(q)
      )
    }
    return base
  }, [users, showKshetraTabs, activeKshetra, searchQuery])

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

      {showKshetraTabs && !loading && (
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
          {isGlobalAdmin && noKshetraCount > 0 && (
            <button
              onClick={() => setActiveKshetra('__none__')}
              className={tabClass(activeKshetra === '__none__')}
            >
              No Kshetra ({noKshetraCount})
            </button>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-9 pr-9 rounded-xl border border-orange-200 bg-white text-sm text-orange-900 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <UsersTable users={filteredUsers} loading={loading} error={error} />
    </div>
  )
}
