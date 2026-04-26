'use client'

/**
 * Aahanik App Component
 * 
 * Root component that handles:
 * - Authentication state checking
 * - Loading state display
 * - Routing between login and home screens
 */

import { useAuth } from '@/contexts/auth-context'
import { LoginScreen } from './login-screen'
import { HomeScreen } from './home-screen'
import Image from 'next/image'

export function AahanikApp() {
  const { user, loading } = useAuth()

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          {/* Animated Logo */}
          <div className="flex h-20 w-20 animate-pulse items-center justify-center">
            <Image 
              src="/baps-logo.png" 
              alt="BAPS Swaminarayan Logo" 
              width={80} 
              height={80}
              className="object-contain"
            />
          </div>
          <p className="text-sm text-muted-foreground">Loading Aahanik...</p>
        </div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen />
  }

  // Show home screen if authenticated
  return <HomeScreen />
}
