'use client'

/**
 * Navbar Component
 * 
 * Displays the app header with:
 * - App logo and name
 * - User greeting (when logged in)
 * - Logout button (when logged in)
 */

import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export function Navbar() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        {/* App Logo and Name */}
        <div className="flex items-center gap-2">
          <Image 
            src="/baps-logo.png" 
            alt="BAPS Swaminarayan Logo" 
            width={36} 
            height={36}
            className="object-contain"
          />
          <span className="text-xl font-bold text-foreground">Aahanik</span>
        </div>

        {/* User Section */}
        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:block">
              Welcome, <span className="font-medium text-foreground">{user.displayName?.split(' ')[0]}</span>
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </motion.header>
  )
}
