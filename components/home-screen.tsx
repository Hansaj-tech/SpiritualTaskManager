'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Dashboard } from './dashboard'
import { TaskList } from './task-list'
import { Navbar } from './navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const KSHETRA_OPTIONS = [
  'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'K10', 'K11', 'K12'
]

export function HomeScreen() {
  const { user, userData, updateUserProfile } = useAuth()
  const [todaysPoints, setTodaysPoints] = useState(0)
  const [kshetra, setKshetra] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Profile is complete once kshetra is saved
  const isProfileComplete = !!userData?.kshetra

  const handleProfileSubmit = async () => {
    if (!kshetra) return
    setIsSubmitting(true)
    setProfileError('')
    try {
      const name = userData?.displayName || user?.displayName || 'Devotee'
      await updateUserProfile(name, kshetra)
    } catch (error) {
      console.error('Error updating profile:', error)
      setProfileError('Failed to save. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Jai Swaminarayan, {userData?.displayName || user?.displayName?.split(' ')[0] || 'Devotee'}! 🙏
          </h1>
          <p className="mt-1 text-muted-foreground">
            Complete your daily Aahanik and earn Rajipo
          </p>
        </motion.div>

        {/* First-time Kshetra setup — disappears after save */}
        {!isProfileComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Select Your Kshetra</CardTitle>
                <CardDescription>Choose your Kshetra to get started</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="kshetra">Kshetra</Label>
                  <Select value={kshetra} onValueChange={setKshetra}>
                    <SelectTrigger id="kshetra">
                      <SelectValue placeholder="Select your Kshetra" />
                    </SelectTrigger>
                    <SelectContent>
                      {KSHETRA_OPTIONS.map((k) => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {profileError && (
                  <p className="text-sm text-destructive">{profileError}</p>
                )}
                <Button
                  onClick={handleProfileSubmit}
                  disabled={!kshetra || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Saving...' : 'Continue'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats */}
        <div className="mb-8">
          <Dashboard
            todaysPoints={todaysPoints}
            wallet={userData?.wallet || 0}
            streak={userData?.streak || 0}
          />
        </div>

        <TaskList onPointsEarned={(points) => setTodaysPoints(points)} />
      </main>

      <footer className="border-t border-border bg-muted/30 py-6">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-sm text-muted-foreground">Aahanik - Spiritual Task Manager</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Built with devotion ❤️</p>
        </div>
      </footer>
    </div>
  )
}
