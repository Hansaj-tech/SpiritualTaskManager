'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Loader2, Users, Settings, ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { userProfile, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    )
  }

  if (!userProfile?.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 gap-4">
        <p className="text-orange-900 font-semibold text-lg">Access Restricted</p>
        <p className="text-orange-500 text-sm">Admin privileges required.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Admin header */}
      <header className="sticky top-0 z-40 bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-8 h-8 rounded-full hover:bg-orange-50 flex items-center justify-center text-orange-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-orange-900">Admin</span>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-700 hover:bg-orange-50 transition-colors"
            >
              <Users className="w-4 h-4" />
              Users
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-700 hover:bg-orange-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        {children}
      </main>
    </div>
  )
}
