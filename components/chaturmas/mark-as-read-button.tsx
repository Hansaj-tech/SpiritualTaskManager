'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markChaturmasProgress } from '@/lib/chaturmas'
import { markChaturmasReading } from '@/lib/daily-log'
import type { ChaturmasStrings } from '@/lib/chaturmas-i18n'

interface MarkAsReadButtonProps {
  uid: string
  dateKey: string
  day: number
  textId: string
  taskListMatch: string | null
  isToday: boolean
  alreadySubmittedToday: boolean
  isRead: boolean
  strings: ChaturmasStrings
  onMarked?: () => void
}

export function MarkAsReadButton({
  uid,
  dateKey,
  day,
  textId,
  taskListMatch,
  isToday,
  alreadySubmittedToday,
  isRead,
  strings,
  onMarked,
}: MarkAsReadButtonProps) {
  const [saving, setSaving] = useState(false)

  const handleClick = async () => {
    if (isRead || saving) return
    setSaving(true)
    try {
      await markChaturmasProgress(uid, textId, day)
      if (isToday && taskListMatch) {
        await markChaturmasReading(uid, dateKey, textId, alreadySubmittedToday, taskListMatch)
      }
      onMarked?.()
    } catch (error) {
      console.error('Error marking Chaturmas reading as read:', error)
    } finally {
      setSaving(false)
    }
  }

  if (isRead) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        {strings.alreadyRead}
      </Button>
    )
  }

  return (
    <Button onClick={handleClick} disabled={saving} className="gap-2">
      {saving ? strings.savingRead : strings.markAsRead}
    </Button>
  )
}
