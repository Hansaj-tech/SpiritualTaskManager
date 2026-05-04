'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Loader2, Users, Settings, ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { userProfile, loading, refreshProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    refreshProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    )
  }

  const hasAccess = userProfile?.isAdmin || userProfile?.isKshetraAdmin

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 gap-4 px-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-2">
          <span className="text-3xl">🔒</span>
        </div>
        <p className="text-orange-900 font-bold text-lg">Access Restricted</p>
        <p className="text-orange-400 text-sm text-center">Admin privileges required to view this page.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors shadow-sm"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50/70">
      {/* Admin header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-orange-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-8 h-8 rounded-xl hover:bg-orange-50 flex items-center justify-center text-orange-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-orange-900">
              {userProfile?.isKshetraAdmin && !userProfile?.isAdmin
                ? `${userProfile.kshetra ?? ''} Admin`
                : 'Admin Panel'}
            </span>
          </div>

          <nav className="flex items-center gap-1">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-orange-700 hover:bg-orange-50 transition-colors"
            >
              <Users className="w-4 h-4" />
              Users
            </Link>
            {userProfile?.isAdmin && (
              <Link
                href="/admin/settings"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-orange-700 hover:bg-orange-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {children}
      </main>
    </div>
  )
}
