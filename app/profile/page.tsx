'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ProfileForm } from '@/components/profile/profile-form'

export default function ProfilePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full hover:bg-orange-50 flex items-center justify-center text-orange-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-orange-900">Edit Profile</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <ProfileForm />
      </main>
    </div>
  )
}
