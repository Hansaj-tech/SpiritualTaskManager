'use client'

import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { LoginScreen } from '@/components/login-screen'
import { ChaturmasApp } from '@/components/chaturmas/chaturmas-app'

export default function ChaturmasPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 animate-pulse items-center justify-center">
            <Image src="/baps-logo.png" alt="BAPS Swaminarayan Logo" width={80} height={80} className="object-contain" />
          </div>
          <p className="text-sm text-muted-foreground">Loading Aahanik...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return <ChaturmasApp />
}
