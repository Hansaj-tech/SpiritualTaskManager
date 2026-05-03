'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useActivities } from '@/hooks/use-activities'
import { useReminders } from '@/hooks/use-reminders'
import { useFcm } from '@/contexts/fcm-context'
import { Navbar } from '@/components/navbar'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ProgressBar } from '@/components/dashboard/progress-bar'
import { DailyQuote } from '@/components/dashboard/daily-quote'
import { ActivityRow } from '@/components/dashboard/activity-row'
import { ReminderModal } from '@/components/reminders/reminder-modal'
import { LeaderboardCard } from '@/components/leaderboard/leaderboard-card'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { Loader2, Bell, X, CalendarDays, Star } from 'lucide-react'
import { ACTIVITY_IDS, BONUS_ACTIVITY_IDS } from '@/lib/constants'

export default function DashboardPage() {
  const { userProfile } = useAuth()
  const { requestPermission } = useFcm()
  const {
    activityDefs,
    todayLog,
    activityStreaks,
    appConfig,
    weeklyTaskCount,
    loading,
    toggleActivity,
  } = useActivities()

  const doneIds = Object.entries(todayLog.activities)
    .filter(([, e]) => e.done)
    .map(([id]) => id)

  const activityNames = Object.fromEntries(activityDefs.map((a) => [a.id, a.name]))
  const { reminders, setReminder } = useReminders(doneIds, activityNames)
  const { data: leaderboardData } = useLeaderboard()
  const [openReminderId, setOpenReminderId] = useState<string | null>(null)
  const [notifDismissed, setNotifDismissed] = useState(false)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default')
  const [weeklyBannerDismissed, setWeeklyBannerDismissed] = useState(false)

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotifPermission(Notification.permission)
    }
  }, [])

  const showNotifBanner = notifPermission === 'default' && !notifDismissed

  async function handleEnableNotifs() {
    await requestPermission()
    setNotifPermission(
      typeof Notification !== 'undefined' ? Notification.permission : 'default'
    )
    setNotifDismissed(true)
  }

  const completedCount = ACTIVITY_IDS.filter((id) => todayLog.activities[id]?.done).length
  const mainActivityDefs = activityDefs.filter((a) => ACTIVITY_IDS.includes(a.id as typeof ACTIVITY_IDS[number]))
  const bonusActivityDefs = activityDefs.filter((a) => BONUS_ACTIVITY_IDS.includes(a.id as typeof BONUS_ACTIVITY_IDS[number]))
  const bonusCompletedCount = BONUS_ACTIVITY_IDS.filter((id) => todayLog.activities[id]?.done).length
  const openActivity = activityDefs.find((a) => a.id === openReminderId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50/70 dark:bg-stone-950">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-3 pb-10">
        {/* Greeting */}
        <div className="px-1 pt-1">
          <p className="text-xs text-orange-400 font-medium uppercase tracking-wider">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-xl font-bold text-orange-900 dark:text-orange-50 mt-0.5">
            {getGreeting()}, {userProfile?.displayName?.split(' ')[0] ?? 'Devotee'} 🙏
          </h1>
        </div>

        {/* Notification permission banner */}
        {showNotifBanner && (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-orange-100 dark:border-stone-700 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-50">Enable Reminders</p>
              <p className="text-xs text-orange-400">Get notified for your daily activities</p>
            </div>
            <button
              onClick={handleEnableNotifs}
              className="px-3 py-1.5 bg-orange-600 text-white text-xs font-semibold rounded-xl hover:bg-orange-700 transition-colors flex-shrink-0"
            >
              Enable
            </button>
            <button
              onClick={() => setNotifDismissed(true)}
              className="w-6 h-6 rounded-full hover:bg-orange-50 flex items-center justify-center text-orange-300 flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sunday weekly progress banner */}
        {weeklyTaskCount !== null && !weeklyBannerDismissed && (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-orange-100 dark:border-stone-700 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-50">Weekly Summary</p>
              <p className="text-xs text-orange-600">
                You have completed {weeklyTaskCount} / 70 tasks this week 🙏
              </p>
            </div>
            <button
              onClick={() => setWeeklyBannerDismissed(true)}
              className="w-6 h-6 rounded-full hover:bg-orange-50 flex items-center justify-center text-orange-300 flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Stats card */}
        <StatsCard
          rajipo={userProfile?.rajipo ?? 0}
          streak={userProfile?.streak ?? 0}
          todayPoints={todayLog.totalPoints}
          guruImages={appConfig.guruImages}
        />

        {/* Progress bar */}
        <ProgressBar completed={completedCount} total={mainActivityDefs.length} />

        {/* Daily quote */}
        {appConfig.dailyQuote && (
          <DailyQuote quote={appConfig.dailyQuote} />
        )}

        {/* Activity list */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-orange-100 dark:border-stone-700 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-orange-50 dark:border-stone-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-orange-900 dark:text-orange-50">Today&apos;s Aahanik</h2>
            <span className="text-xs text-orange-400 font-medium">
              {completedCount}/{mainActivityDefs.length} done
            </span>
          </div>
          <div className="divide-y divide-orange-50 dark:divide-stone-800">
            {mainActivityDefs.map((activity) => (
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

        {/* Bonus Activities */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-orange-100 dark:border-stone-700 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-orange-50 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-orange-500 flex items-center justify-center flex-shrink-0">
                <Star className="w-3 h-3 text-white fill-white" />
              </div>
              <h2 className="text-sm font-bold text-orange-900 dark:text-orange-50">Bonus Activities</h2>
            </div>
            <span className="text-xs text-orange-400 font-medium">
              {bonusCompletedCount}/{bonusActivityDefs.length} done
            </span>
          </div>
          <div className="divide-y divide-orange-50 dark:divide-stone-800">
            {bonusActivityDefs.map((activity) => (
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

        {/* Leaderboard */}
        {leaderboardData && <LeaderboardCard data={leaderboardData} />}
      </main>

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

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
