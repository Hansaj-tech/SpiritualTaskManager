'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AchievementTab } from '@/components/profile/achievement-tab'
import { useAuth } from '@/contexts/auth-context'
import { getAppConfig } from '@/lib/firestore-helpers'
import type { AppConfig } from '@/types'

export default function AchievementsPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null)

  useEffect(() => {
    getAppConfig().then(setAppConfig)
  }, [])

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-stone-950">
      <header className="sticky top-0 z-40 bg-white dark:bg-stone-900 border-b border-orange-100 dark:border-stone-700 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full hover:bg-orange-50 dark:hover:bg-stone-800 flex items-center justify-center text-orange-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-orange-900 dark:text-orange-50">Achievements</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <AchievementTab
          rajipo={userProfile?.rajipo ?? 0}
          stages={appConfig?.achievementStages}
        />
      </main>
    </div>
  )
}
