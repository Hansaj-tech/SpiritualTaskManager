'use client'

import { GuruCarousel } from './guru-carousel'

interface StatsCardProps {
  rajipo: number
  streak: number
  todayPoints: number
  guruImages: string[]
}

export function StatsCard({ rajipo, streak, todayPoints, guruImages }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-orange-100 dark:border-stone-700 overflow-hidden">
      {/* Guru image carousel */}
      <GuruCarousel images={guruImages} />

      {/* Stats row */}
      <div className="grid grid-cols-3 py-4 px-3 gap-1">
        <StatItem
          value={rajipo.toLocaleString()}
          label="Rajipo"
          color="text-amber-600"
          bg="bg-amber-50 dark:bg-amber-900/20"
          symbol="✨"
        />
        <StatItem
          value={`${streak}`}
          label="Day Streak"
          color="text-orange-600"
          bg="bg-orange-50 dark:bg-stone-800"
          symbol="🔥"
          suffix="d"
        />
        <StatItem
          value={`${todayPoints}`}
          label="Today"
          color="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-900/20"
          symbol="⭐"
          suffix="pts"
        />
      </div>
    </div>
  )
}

function StatItem({
  value,
  label,
  color,
  bg,
  symbol,
  suffix,
}: {
  value: string
  label: string
  color: string
  bg: string
  symbol: string
  suffix?: string
}) {
  return (
    <div className={`flex flex-col items-center py-3 px-2 rounded-2xl ${bg}`}>
      <span className="text-lg mb-0.5">{symbol}</span>
      <div className="flex items-baseline gap-0.5">
        <span className={`text-2xl font-bold ${color} leading-none`}>{value}</span>
        {suffix && <span className={`text-xs font-semibold ${color} opacity-70`}>{suffix}</span>}
      </div>
      <span className="text-xs text-gray-500 dark:text-stone-400 font-medium mt-1">{label}</span>
    </div>
  )
}
