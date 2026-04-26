'use client'

/**
 * Dashboard Component
 * 
 * Displays user stats in card format:
 * - Today's Points (earned in the current session)
 * - Wallet Balance (total accumulated points)
 * - Streak Counter (consecutive days with all tasks completed)
 */

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardProps {
  todaysPoints: number
  wallet: number
  streak: number
}

// Animation variants for staggered card animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
}

export function Dashboard({ todaysPoints, wallet, streak }: DashboardProps) {
  const stats = [
    {
      title: "Today's Rajipo",
      value: todaysPoints,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Rajipo Balance',
      value: wallet,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      title: 'Streak',
      value: streak,
      gradient: 'from-red-500 to-pink-500',
    },
  ]

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-3"
    >
      {stats.map((stat) => (
        <motion.div key={stat.title} variants={cardVariants}>
          <Card className="relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            {/* Gradient Background Decoration */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Image 
                src="/mahant-swami.png" 
                alt="Mahant Swami Maharaj" 
                width={28} 
                height={28}
                className="rounded-full object-cover"
              />
            </CardHeader>
            
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  {stat.value}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
