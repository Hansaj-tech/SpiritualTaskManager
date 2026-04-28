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
      <div className="min-h-screen flex items-center justify-center bg-orange-600">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-orange-600">
      {/* Header */}
      <div className="flex flex-col items-center justify-center px-6 pt-14 pb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mb-5 ring-2 ring-white/20">
          <svg viewBox="0 0 120 120" className="w-10 h-10 text-white" fill="currentColor">
            <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fontSize="72" fontFamily="serif">ॐ</text>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome to Aahanik</h1>
        <p className="text-orange-100 text-sm mt-2 leading-relaxed">
          Select your Kshetra to get started<br />with your spiritual journey
        </p>
      </div>

      {/* White content card */}
      <div className="flex-1 bg-white rounded-t-[2rem] px-5 pt-6 pb-10 shadow-2xl">
        <KshetraGrid />
      </div>
    </div>
  )
}
