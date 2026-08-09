'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { NotificationComposer } from '@/components/admin/notification-composer'

export default function AdminNotifyPage() {
  const { userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (userProfile && !userProfile.isAdmin) {
      router.replace('/admin')
    }
  }, [userProfile, router])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-orange-900">Send Notification</h1>
      <NotificationComposer />
    </div>
  )
}
