'use client'

import { useAdminUsers } from '@/hooks/use-admin'
import { UsersTable } from '@/components/admin/users-table'

export default function AdminPage() {
  const { users, loading, error } = useAdminUsers()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-orange-900">Users</h1>
        <span className="text-sm text-orange-500">{users.length} members</span>
      </div>
      <UsersTable users={users} loading={loading} error={error} />
    </div>
  )
}
