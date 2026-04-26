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

// Type definition for a task
interface Task {
  name: string
  done: boolean
}

// Initial task list as specified
const INITIAL_TASKS: Task[] = [
  { name: 'Morning Aarti', done: false },
  { name: 'Evening Aarti', done: false },
  { name: '1st Mansi', done: false },
  { name: '2nd Mansi', done: false },
  { name: '3rd Mansi', done: false },
  { name: 'Vachnamrut Vanchan', done: false },
  { name: 'Swamini Vato Nu Vanchan', done: false },
  { name: 'Nitya Prerna Shravan', done: false },
  { name: 'Chesta', done: false },
  { name: 'Pooja', done: false },
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
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Calculate completed tasks count
  const completedCount = tasks.filter(task => task.done).length
  const totalTasks = tasks.length
  const allCompleted = completedCount === totalTasks

  /**
   * Toggle task completion status
   */
  const toggleTask = (index: number) => {
    if (submitted) return // Prevent changes after submission
    
    setTasks(prev => 
      prev.map((task, i) => 
        i === index ? { ...task, done: !task.done } : task
      )
    )
  }

  /**
   * Submit today's tasks and update Firestore
   * - Calculate daily points (10 per completed task)
   * - Update wallet balance
   * - Update streak (increment if all complete, reset if not)
   * - Save to Firestore
   */
  const handleSubmit = async () => {
    if (!user || !userData) return

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

      // Update local state
      onPointsEarned(dailyPoints)
      setSubmitted(true)
      
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
          {tasks.map((task, index) => (
            <motion.li 
              key={task.name}
              variants={itemVariants}
              className={`group flex cursor-pointer items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50 ${
                submitted ? 'cursor-default' : ''
              }`}
              onClick={() => toggleTask(index)}
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
                You earned <span className="font-bold text-primary">{completedCount * 10}</span> points today
                {allCompleted && ' 🎉'}
              </p>
            </motion.div>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || completedCount === 0}
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
