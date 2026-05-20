'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, User, Trophy } from 'lucide-react'
import { ProfileForm } from '@/components/profile/profile-form'
import { AchievementTab } from '@/components/profile/achievement-tab'
import { useAuth } from '@/contexts/auth-context'
import { getAppConfig } from '@/lib/firestore-helpers'
import type { AppConfig } from '@/types'

type Tab = 'profile' | 'achievements'

function ProfilePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const t = searchParams.get('tab')
    return t === 'achievements' ? 'achievements' : 'profile'
  })
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null)

  useEffect(() => {
    getAppConfig().then(setAppConfig)
  }, [])

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-stone-900 border-b border-orange-100 dark:border-stone-700 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full hover:bg-orange-50 dark:hover:bg-stone-800 flex items-center justify-center text-orange-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-orange-900 dark:text-orange-50 flex-1">
            {activeTab === 'profile' ? 'Edit Profile' : 'Achievements'}
          </h1>
        </div>

        {/* Tabs */}
        <div className="max-w-lg mx-auto px-4 flex border-t border-orange-50 dark:border-stone-800">
          <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User className="w-3.5 h-3.5" />} label="Profile" />
          <TabButton active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} icon={<Trophy className="w-3.5 h-3.5" />} label="Achievements" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {activeTab === 'profile' && <ProfileForm />}
        {activeTab === 'achievements' && (
          <AchievementTab
            rajipo={userProfile?.rajipo ?? 0}
            stages={appConfig?.achievementStages}
          />
        )}
      </main>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
        active
          ? 'border-orange-600 text-orange-600 dark:text-orange-400'
          : 'border-transparent text-orange-400 dark:text-stone-500 hover:text-orange-600 dark:hover:text-orange-300'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-orange-50 dark:bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  )
}
