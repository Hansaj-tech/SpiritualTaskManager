'use client'

import { useAuth } from '@/contexts/auth-context'
import { KshetraGrid } from '@/components/onboarding/kshetra-grid'
import { BapsLogo } from '@/components/baps-logo'
import { Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const { loading } = useAuth()

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
        <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-lg p-2">
          <BapsLogo className="w-full h-full" />
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
