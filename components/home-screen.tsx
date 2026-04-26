'use client'

/**
 * Home Screen Component
 * 
 * Main authenticated view displaying:
 * - User greeting
 * - Stats dashboard (points, wallet, streak)
 * - Daily task list
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Dashboard } from './dashboard'
import { TaskList } from './task-list'
import { Navbar } from './navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

const KSHETRA_OPTIONS = [
  'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'K10', 'K11', 'K12'
]

export function HomeScreen() {
  const { user, userData, updateUserProfile } = useAuth()
  const [todaysPoints, setTodaysPoints] = useState(0)
  const [name, setName] = useState('')
  const [kshetra, setKshetra] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if user profile is complete
  const isProfileComplete = userData?.displayName && userData?.kshetra

  const handleProfileSubmit = async () => {
    if (!name.trim() || !kshetra) return
    
    setIsSubmitting(true)
    try {
      await updateUserProfile(name.trim(), kshetra)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle points earned from task submission
  const handlePointsEarned = (points: number) => {
    setTodaysPoints(points)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Welcome Message */}
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

        {/* Profile Setup - shown if profile is incomplete */}
        {!isProfileComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Complete Your Profile</CardTitle>
                <CardDescription>
                  Please enter your name and select your Kshetra to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Your Name</FieldLabel>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="kshetra">Kshetra</FieldLabel>
                    <Select value={kshetra} onValueChange={setKshetra}>
                      <SelectTrigger id="kshetra">
                        <SelectValue placeholder="Select your Kshetra" />
                      </SelectTrigger>
                      <SelectContent>
                        {KSHETRA_OPTIONS.map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Button 
                    onClick={handleProfileSubmit}
                    disabled={!name.trim() || !kshetra || isSubmitting}
                    className="w-full mt-2"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                  </Button>
                </FieldGroup>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Dashboard */}
        <div className="mb-8">
          <Dashboard 
            todaysPoints={todaysPoints}
            wallet={userData?.wallet || 0}
            streak={userData?.streak || 0}
          />
        </div>

        {/* Task List */}
        <TaskList onPointsEarned={handlePointsEarned} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-6">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Aahanik - Spiritual Task Manager
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Built with devotion ❤️
          </p>
        </div>
      </footer>
    </div>
  )
}
