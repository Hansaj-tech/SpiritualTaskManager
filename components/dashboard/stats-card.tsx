'use client'

import { GuruCarousel } from './guru-carousel'

interface StatsCardProps {
  rajipo: number
  streak: number
  todayPoints: number
  guruImages: string[]
}

function StatBadge({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg">{emoji}</span>
      <span className="text-xl font-bold text-orange-900 leading-tight">{value}</span>
      <span className="text-xs text-orange-500 font-medium">{label}</span>
    </div>
  )
}

export function StatsCard({ rajipo, streak, todayPoints, guruImages }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
      <GuruCarousel images={guruImages} />

      <div className="grid grid-cols-3 divide-x divide-orange-100 py-4 px-2">
        <StatBadge label="Rajipo" value={rajipo} emoji="✨" />
        <StatBadge label="Streak" value={`${streak}d`} emoji="🔥" />
        <StatBadge label="Today" value={`${todayPoints}pts`} emoji="⭐" />
      </div>
    </div>
  )
}
