'use client'

import * as Dialog from '@radix-ui/react-dialog'
import * as Switch from '@radix-ui/react-switch'
import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sendNotification } from '@/hooks/use-reminders'
import type { ReminderPref } from '@/types'

interface ReminderModalProps {
  open: boolean
  activityId: string
  activityName: string
  reminder?: ReminderPref
  onSave: (pref: ReminderPref) => Promise<void>
  onClose: () => void
}

export function ReminderModal({
  open,
  activityId,
  activityName,
  reminder,
  onSave,
  onClose,
}: ReminderModalProps) {
  const [enabled, setEnabled] = useState(reminder?.enabled ?? false)
  const [time, setTime] = useState(reminder?.time ?? '06:00')
  const [saving, setSaving] = useState(false)

  // Sync when reminder prop changes
  useEffect(() => {
    setEnabled(reminder?.enabled ?? false)
    setTime(reminder?.time ?? '06:00')
  }, [reminder, open])

  async function handleSave() {
    setSaving(true)
    // Request permission immediately in the button click handler (user gesture)
    // before any async work, so browsers don't block the permission dialog
    if (enabled && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
    await onSave({ activityId, enabled, time })
    setSaving(false)
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Dialog.Content
          className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-2xl max-w-lg mx-auto outline-none"
        >
          {/* Handle bar */}
          <div className="w-10 h-1 rounded-full bg-orange-200 mx-auto mb-5" />

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-base font-semibold text-orange-900">
                Set Reminder
              </Dialog.Title>
              <p className="text-sm text-orange-500">{activityName}</p>
            </div>
            <Dialog.Close asChild>
              <button className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-400 hover:bg-orange-100">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between mb-6 p-4 bg-orange-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">Daily Reminder</p>
                <p className="text-xs text-orange-500">
                  {enabled ? 'Notifications on' : 'Notifications off'}
                </p>
              </div>
            </div>
            <Switch.Root
              checked={enabled}
              onCheckedChange={setEnabled}
              className={cn(
                'w-11 h-6 rounded-full transition-colors outline-none',
                enabled ? 'bg-orange-600' : 'bg-orange-200'
              )}
            >
              <Switch.Thumb
                className="block w-5 h-5 bg-white rounded-full shadow transition-transform data-[state=checked]:translate-x-5 translate-x-0.5"
              />
            </Switch.Root>
          </div>

          {/* Time picker */}
          {enabled && (
            <div className="mb-6">
              <label className="text-sm font-medium text-orange-900 mb-2 block">
                Reminder Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-orange-200 text-orange-900 font-medium bg-white focus:outline-none focus:border-orange-600 text-base"
              />
            </div>
          )}

          <div className="flex gap-2">
            {/* Test button — fire a notification immediately to verify it works */}
            {enabled && (
              <button
                type="button"
                onClick={() => sendNotification('Aahanik — Test', `${activityName} reminder works! 🙏`, 'test')}
                className="h-12 px-4 rounded-xl border-2 border-orange-200 text-orange-700 font-semibold text-sm hover:bg-orange-50 transition-colors"
              >
                Test
              </button>
            )}
            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-12 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Reminder'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
