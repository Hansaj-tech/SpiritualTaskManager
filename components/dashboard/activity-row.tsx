'use client'

import * as Checkbox from '@radix-ui/react-checkbox'
import { Check, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivityDefinition, ActivityLogEntry, ReminderPref } from '@/types'

interface ActivityRowProps {
  activity: ActivityDefinition
  logEntry?: ActivityLogEntry
  activityStreak: number
  reminder?: ReminderPref
  onToggle: (done: boolean) => void
  onReminderOpen: () => void
}

export function ActivityRow({
  activity,
  logEntry,
  activityStreak,
  reminder,
  onToggle,
  onReminderOpen,
}: ActivityRowProps) {
  const done = logEntry?.done ?? false

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
        done ? 'bg-orange-50' : 'bg-white'
      )}
    >
      {/* Checkbox */}
      <Checkbox.Root
        checked={done}
        onCheckedChange={(val) => onToggle(val === true)}
        className={cn(
          'w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all outline-none',
          done
            ? 'border-orange-600 bg-orange-600'
            : 'border-orange-300 bg-white hover:border-orange-500'
        )}
      >
        <Checkbox.Indicator>
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </Checkbox.Indicator>
      </Checkbox.Root>

      {/* Activity name */}
      <span
        className={cn(
          'flex-1 text-sm font-medium truncate',
          done ? 'text-orange-400 line-through' : 'text-orange-900'
        )}
      >
        {activity.name}
      </span>

      {/* Streak badge */}
      {activityStreak > 0 && (
        <span className="text-xs text-orange-600 font-semibold whitespace-nowrap">
          🔥{activityStreak}d
        </span>
      )}

      {/* Reminder button */}
      <button
        onClick={onReminderOpen}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors',
          reminder?.enabled
            ? 'bg-orange-100 text-orange-700'
            : 'text-orange-300 hover:text-orange-500'
        )}
        title="Set reminder"
      >
        <Bell className="w-3 h-3" />
        {reminder?.time && <span>{reminder.time}</span>}
      </button>

      {/* Points */}
      <span className="text-xs font-semibold text-orange-400 w-10 text-right flex-shrink-0">
        {activity.points}pts
      </span>
    </div>
  )
}
