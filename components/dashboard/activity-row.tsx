'use client'

import * as Checkbox from '@radix-ui/react-checkbox'
import { Check, Bell, BellOff } from 'lucide-react'
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
        'flex items-center gap-3 px-4 py-3.5 transition-all duration-200',
        done && 'bg-orange-50/60 dark:bg-stone-800/60'
      )}
    >
      {/* Checkbox */}
      <Checkbox.Root
        checked={done}
        onCheckedChange={(val) => onToggle(val === true)}
        className={cn(
          'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 outline-none',
          done
            ? 'border-orange-500 bg-orange-500 shadow-sm'
            : 'border-orange-200 dark:border-stone-600 bg-white dark:bg-stone-800 hover:border-orange-400 active:scale-95'
        )}
      >
        <Checkbox.Indicator>
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </Checkbox.Indicator>
      </Checkbox.Root>

      {/* Name + streak */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-sm font-medium block truncate',
            done ? 'text-orange-300 line-through' : 'text-orange-900 dark:text-orange-50'
          )}
        >
          {activity.name}
        </span>
        {activityStreak > 0 && (
          <span className="text-xs text-orange-500 font-medium">
            🔥 {activityStreak} day streak
          </span>
        )}
      </div>

      {/* Reminder button */}
      <button
        onClick={onReminderOpen}
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium transition-all',
          reminder?.enabled
            ? 'bg-orange-100 dark:bg-stone-700 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-stone-600'
            : 'text-orange-200 dark:text-stone-600 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-stone-800'
        )}
        title="Set reminder"
      >
        {reminder?.enabled ? (
          <>
            <Bell className="w-3 h-3 fill-orange-500 text-orange-500" />
            <span>{reminder.time}</span>
          </>
        ) : (
          <BellOff className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Points badge */}
      <span className={cn(
        'text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0',
        done ? 'text-orange-400 bg-orange-100 dark:bg-stone-700' : 'text-orange-500 bg-orange-50 dark:bg-stone-800'
      )}>
        +{activity.points}
      </span>
    </div>
  )
}
