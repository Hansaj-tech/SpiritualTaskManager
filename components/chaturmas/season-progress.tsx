'use client'

import { Progress } from '@/components/ui/progress'

interface SeasonProgressProps {
  currentDay: number | null
  totalDays: number
  label: string
}

export function SeasonProgress({ currentDay, totalDays, label }: SeasonProgressProps) {
  const pct = currentDay && totalDays > 0 ? Math.min(100, Math.round((currentDay / totalDays) * 100)) : 0

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {currentDay ? `Day ${currentDay} / ${totalDays}` : 'Not active'}
        </span>
      </div>
      <Progress value={pct} />
    </div>
  )
}
