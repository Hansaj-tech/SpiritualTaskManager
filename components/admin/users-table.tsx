'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import type { AdminUser } from '@/hooks/use-admin'

interface UsersTableProps {
  users: AdminUser[]
  loading: boolean
  error: string | null
}

export function UsersTable({ users, loading, error }: UsersTableProps) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 text-sm">
        Failed to load users: {error}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-orange-400 text-sm">
        No users found.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-orange-50 border-b border-orange-100 text-xs font-semibold text-orange-600 uppercase tracking-wide">
        <span className="col-span-2">Name</span>
        <span>Kshetra</span>
        <span>Streak</span>
        <span>Rajipo</span>
      </div>

      {users.map((u) => (
        <button
          key={u.uid}
          onClick={() => router.push(`/admin/users/${u.uid}`)}
          className="w-full grid grid-cols-5 gap-2 px-4 py-3 border-b border-orange-50 hover:bg-orange-50 transition-colors text-left items-center last:border-0"
        >
          <div className="col-span-2 min-w-0">
            <p className="text-sm font-medium text-orange-900 truncate">{u.displayName}</p>
            <p className="text-xs text-orange-400 truncate">{u.email}</p>
          </div>
          <span className="text-sm text-orange-700 font-medium">{u.kshetra ?? '—'}</span>
          <span className="text-sm text-orange-700">🔥{u.streak}</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-orange-600">{u.rajipo}</span>
            <ChevronRight className="w-4 h-4 text-orange-300 flex-shrink-0" />
          </div>
        </button>
      ))}
    </div>
  )
}
