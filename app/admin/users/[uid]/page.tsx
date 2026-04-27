'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAdminUsers } from '@/hooks/use-admin'
import { UserDetailPanel } from '@/components/admin/user-detail-panel'
import { use } from 'react'

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ uid: string }>
}) {
  const { uid } = use(params)
  const { users } = useAdminUsers()
  const router = useRouter()
  const user = users.find((u) => u.uid === uid)

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => router.push('/admin')}
        className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-800 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>
      <UserDetailPanel uid={uid} user={user} />
    </div>
  )
}
