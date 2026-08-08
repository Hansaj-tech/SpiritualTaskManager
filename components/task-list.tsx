'use client'

/**
 * TaskList Component
 *
 * Displays the daily spiritual tasks with checkboxes:
 * - Morning Aarti, Evening Aarti
 * - Mansi (1st, 2nd, 3rd)
 * - Reading/Listening activities
 * - Chesta, Pooja
 *
 * Handles task completion and submission
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Send } from 'lucide-react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { useDailyLog, toggleTaskInLog, submitDailyLog, todayKey } from '@/lib/daily-log'

// Task names, in display order. These exact strings are also referenced by
// the Chaturmas feature (via ChaturmasText.taskListMatch) to sync reading
// completion into this checklist — keep them in sync if renamed.
const TASK_NAMES = [
  'Morning Aarti',
  'Evening Aarti',
  '1st Mansi',
  '2nd Mansi',
  '3rd Mansi',
  'Vachnamrut Vanchan',
  'Swamini Vato Nu Vanchan',
  'Nitya Prerna Shravan',
  'Chesta',
  'Pooja',
]

interface TaskListProps {
  onPointsEarned: (points: number) => void
}

// Animation variants for task items
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
  },
}

export function TaskList({ onPointsEarned }: TaskListProps) {
  const { user, userData, refreshUserData } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dateKey = todayKey()
  const { log, loading } = useDailyLog(user?.uid, dateKey)

  const submitted = log?.submitted ?? false
  const tasks = TASK_NAMES.map((name) => ({ name, done: log?.tasks?.[name] ?? false }))

  // Calculate completed tasks count
  const completedCount = tasks.filter(task => task.done).length
  const totalTasks = tasks.length
  const allCompleted = completedCount === totalTasks

  /**
   * Toggle task completion status
   */
  const toggleTask = async (name: string, done: boolean) => {
    if (!user || loading || submitted) return // Prevent changes before load / after submission

    try {
      await toggleTaskInLog(user.uid, dateKey, name, !done)
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  /**
   * Submit today's tasks and update Firestore
   * - Calculate daily points (10 per completed task)
   * - Update wallet balance
   * - Update streak (increment if all complete, reset if not)
   * - Save to Firestore
   */
  const handleSubmit = async () => {
    if (!user || !userData || submitted) return

    setIsSubmitting(true)

    try {
      // Calculate points
      const dailyPoints = completedCount * 10

      // Calculate new streak
      const newStreak = allCompleted ? userData.streak + 1 : 0

      // Calculate new wallet balance
      const newWallet = userData.wallet + dailyPoints

      // Update Firestore
      const userDocRef = doc(db, 'users', user.uid)
      await updateDoc(userDocRef, {
        wallet: newWallet,
        streak: newStreak,
        lastUpdated: serverTimestamp(),
      })

      await submitDailyLog(user.uid, dateKey, dailyPoints)

      // Update local state
      onPointsEarned(dailyPoints)

      // Refresh user data from Firestore
      await refreshUserData()
    } catch (error) {
      console.error('Error submitting tasks:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Daily Spiritual Tasks</CardTitle>
            <CardDescription className="mt-1">
              Complete your daily activities to earn points
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
            <span className="text-sm font-medium text-primary">
              {completedCount}/{totalTasks}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="divide-y divide-border"
        >
          {tasks.map((task) => (
            <motion.li
              key={task.name}
              variants={itemVariants}
              className={`group flex cursor-pointer items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50 ${
                submitted ? 'cursor-default' : ''
              }`}
              onClick={() => toggleTask(task.name, task.done)}
            >
              {/* Checkbox Icon */}
              <div className="flex-shrink-0">
                {task.done ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </motion.div>
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground group-hover:text-primary/60" />
                )}
              </div>

              {/* Task Name */}
              <span className={`flex-1 text-base transition-colors ${
                task.done
                  ? 'text-muted-foreground line-through'
                  : 'text-foreground'
              }`}>
                {task.name}
              </span>

              {/* Points Indicator */}
              <span className={`text-sm ${
                task.done ? 'text-primary' : 'text-muted-foreground'
              }`}>
                +10 pts
              </span>
            </motion.li>
          ))}
        </motion.ul>

        {/* Submit Button */}
        <div className="border-t border-border bg-muted/30 p-6">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium text-foreground">
                Tasks submitted successfully!
              </p>
              <p className="text-sm text-muted-foreground">
                You earned <span className="font-bold text-primary">{log?.pointsAwarded ?? completedCount * 10}</span> points today
                {allCompleted && ' 🎉'}
              </p>
            </motion.div>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || loading || completedCount === 0}
              className="w-full gap-2"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Today&apos;s Tasks
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
