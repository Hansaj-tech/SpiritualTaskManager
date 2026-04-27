'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { KshetraGrid } from '@/components/onboarding/kshetra-grid'
import { Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const { userProfile, loading } = useAuth()

  useEffect(() => {
    if (!loading && userProfile?.kshetra) {
      window.location.href = '/dashboard'
    }
  }, [userProfile, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      {/* Header */}
      <div className="pt-safe-top" />
      <header className="px-6 pt-12 pb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl font-bold text-white">A</span>
        </div>
        <h1 className="text-2xl font-bold text-orange-900">Welcome to Aahanik</h1>
        <p className="text-orange-500 text-sm mt-1">Jai Swaminarayan 🙏</p>
      </header>

      {/* Grid */}
      <main className="flex-1 flex items-start justify-center px-6 pt-4">
        <KshetraGrid />
      </main>
    </div>
  )
}
