'use client'

import { useState } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { Check, Bell, BellOff, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivityDefinition, ActivityLogEntry, ReminderPref } from '@/types'

interface ActivityRowProps {
  activity: ActivityDefinition
  logEntry?: ActivityLogEntry
  activityStreak: number
  reminder?: ReminderPref
  onToggle: (done: boolean) => void
  onReminderOpen: () => void
  disabled?: boolean
  vanchanText?: string
}

export function ActivityRow({
  activity,
  logEntry,
  activityStreak,
  reminder,
  onToggle,
  onReminderOpen,
  disabled = false,
  vanchanText,
}: ActivityRowProps) {
  const done = logEntry?.done ?? false
  const [expanded, setExpanded] = useState(false)
  const hasVanchan = !!vanchanText

  return (
    <div className={cn(done && 'bg-orange-50/60 dark:bg-stone-800/60', disabled && 'opacity-50 cursor-not-allowed')}>
      <div className="flex items-center gap-3 px-4 py-3.5 transition-all duration-200">
        {/* Checkbox */}
        <Checkbox.Root
          checked={done}
          disabled={disabled}
          onCheckedChange={(val) => { if (!disabled) onToggle(val === true) }}
          className={cn(
            'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 outline-none',
            done
              ? 'border-orange-500 bg-orange-500 shadow-sm'
              : 'border-orange-200 dark:border-stone-600 bg-white dark:bg-stone-800 hover:border-orange-400 active:scale-95',
            disabled && 'pointer-events-none'
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

        {/* This Week's Vanchan toggle — only shown when text is available */}
        {hasVanchan && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium transition-all flex-shrink-0',
              expanded
                ? 'bg-orange-500 text-white'
                : 'bg-orange-100 dark:bg-stone-700 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-stone-600'
            )}
            title="This Week's Vanchan"
          >
            <BookOpen className="w-3 h-3" />
            <span className="hidden xs:inline">Vanchan</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}

        {/* Reminder button */}
        <button
          onClick={onReminderOpen}
          className={cn(
            'flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium transition-all',
            reminder?.enabled
              ? 'bg-orange-100 dark:bg-stone-700 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-stone-600'
              : 'text-orange-400 dark:text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-stone-800'
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

      {/* Expandable vanchan panel */}
      {hasVanchan && expanded && (
        <div className="px-4 pb-4">
          <div className="bg-orange-50 dark:bg-stone-800 rounded-2xl p-3.5 border border-orange-100 dark:border-stone-700">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                This Week&apos;s Vanchan
              </span>
            </div>
            <p className="text-sm text-orange-900 dark:text-orange-100 leading-relaxed whitespace-pre-wrap">
              {vanchanText}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
