'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useActivities } from '@/hooks/use-activities'
import { useReminders } from '@/hooks/use-reminders'
import { Navbar } from '@/components/navbar'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ProgressBar } from '@/components/dashboard/progress-bar'
import { DailyQuote } from '@/components/dashboard/daily-quote'
import { ActivityRow } from '@/components/dashboard/activity-row'
import { ReminderModal } from '@/components/reminders/reminder-modal'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { userProfile } = useAuth()
  const {
    activityDefs,
    todayLog,
    activityStreaks,
    appConfig,
    loading,
    toggleActivity,
  } = useActivities()

  const doneIds = Object.entries(todayLog.activities)
    .filter(([, e]) => e.done)
    .map(([id]) => id)

  const { reminders, setReminder } = useReminders(doneIds)
  const [openReminderId, setOpenReminderId] = useState<string | null>(null)

  const completedCount = Object.values(todayLog.activities).filter((e) => e.done).length
  const openActivity = activityDefs.find((a) => a.id === openReminderId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4 pb-8">
        {/* Stats card: guru images + rajipo + streak + today */}
        <StatsCard
          rajipo={userProfile?.rajipo ?? 0}
          streak={userProfile?.streak ?? 0}
          todayPoints={todayLog.totalPoints}
          guruImages={appConfig.guruImages}
        />

        {/* Progress bar */}
        <ProgressBar completed={completedCount} total={activityDefs.length} />

        {/* Daily quote */}
        {appConfig.dailyQuote && (
          <DailyQuote quote={appConfig.dailyQuote} />
        )}

        {/* Activity list */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-orange-50">
            <h2 className="text-sm font-semibold text-orange-900">
              Today&apos;s Activities
            </h2>
          </div>
          <div className="flex flex-col divide-y divide-orange-50">
            {activityDefs.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                logEntry={todayLog.activities[activity.id]}
                activityStreak={activityStreaks[activity.id] ?? 0}
                reminder={reminders[activity.id]}
                onToggle={(done) => toggleActivity(activity.id, done)}
                onReminderOpen={() => setOpenReminderId(activity.id)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Reminder modal */}
      {openActivity && (
        <ReminderModal
          open={!!openReminderId}
          activityId={openActivity.id}
          activityName={openActivity.name}
          reminder={reminders[openActivity.id]}
          onSave={setReminder}
          onClose={() => setOpenReminderId(null)}
        />
      )}
    </div>
  )
}
