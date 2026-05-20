'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Loader2, Bell, X, CalendarDays, Star, Clock, Trophy } from 'lucide-react'
import { ACTIVITY_IDS, BONUS_ACTIVITY_IDS, DEFAULT_ACHIEVEMENT_STAGES } from '@/lib/constants'
import { getActiveDate, isFillingYesterday } from '@/lib/date-utils'
import { useRouter } from 'next/navigation'
import { MilestoneOverlay } from '@/components/dashboard/milestone-overlay'
import { BadgeStrip } from '@/components/dashboard/badge-strip'

const ACHIEVEMENT_NOTIF_KEY = 'aahanik-achievement-intro-seen'

export default function DashboardPage() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const { requestPermission } = useFcm()
  const {
    activityDefs,
    todayLog,
    activityStreaks,
    mainStreak,
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
  const [achievementBannerDismissed, setAchievementBannerDismissed] = useState(true)
  const [milestoneOverlay, setMilestoneOverlay] = useState<{ points: number; tierIndex: number } | null>(null)
  const prevRajipoRef = useRef<number | null>(null)
  const initCheckRef = useRef(false)
  const fillingYesterday = isFillingYesterday()
  const activeDateLabel = new Date(getActiveDate() + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotifPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      if (!localStorage.getItem(ACHIEVEMENT_NOTIF_KEY)) {
        setAchievementBannerDismissed(false)
      }
    }
  }, [])

  // On first userProfile load: show animation for earned milestones not yet celebrated
  useEffect(() => {
    if (!userProfile || initCheckRef.current) return
    initCheckRef.current = true
    prevRajipoRef.current = userProfile.rajipo

    const stages = [...(appConfig.achievementStages ?? DEFAULT_ACHIEVEMENT_STAGES)].sort((a, b) => a - b)
    // Show the highest unseen milestone (so they see the best badge they've earned)
    for (let i = stages.length - 1; i >= 0; i--) {
      const m = stages[i]
      if (userProfile.rajipo >= m && !localStorage.getItem(`aahanik-milestone-seen-${m}`)) {
        setMilestoneOverlay({ points: m, tierIndex: i })
        localStorage.setItem(`aahanik-milestone-seen-${m}`, '1')
        break
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile])

  // Real-time detection when rajipo increases past a milestone
  useEffect(() => {
    if (!userProfile || !initCheckRef.current) return
    const curr = userProfile.rajipo
    const prev = prevRajipoRef.current ?? curr
    prevRajipoRef.current = curr

    if (curr <= prev) return

    const stages = [...(appConfig.achievementStages ?? DEFAULT_ACHIEVEMENT_STAGES)].sort((a, b) => a - b)
    for (let i = 0; i < stages.length; i++) {
      const m = stages[i]
      if (prev < m && curr >= m && !localStorage.getItem(`aahanik-milestone-seen-${m}`)) {
        setMilestoneOverlay({ points: m, tierIndex: i })
        localStorage.setItem(`aahanik-milestone-seen-${m}`, '1')
        break
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.rajipo])

  const showNotifBanner = notifPermission === 'default' && !notifDismissed

  async function handleEnableNotifs() {
    await requestPermission()
    setNotifPermission(
      typeof Notification !== 'undefined' ? Notification.permission : 'default'
    )
    setNotifDismissed(true)
  }

  const bonusIdSet = new Set<string>(BONUS_ACTIVITY_IDS)
  const mainActivityDefs = activityDefs.filter(a => !bonusIdSet.has(a.id))
  const bonusActivityDefs = activityDefs.filter(a => bonusIdSet.has(a.id))
  const completedCount = mainActivityDefs.filter(a => todayLog.activities[a.id]?.done).length
  const bonusCompletedCount = bonusActivityDefs.filter(a => todayLog.activities[a.id]?.done).length
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
            {activeDateLabel}
          </p>
          <h1 className="text-xl font-bold text-orange-900 dark:text-orange-50 mt-0.5">
            {getGreeting()}, {userProfile?.displayName?.split(' ')[0] ?? 'Devotee'} 🙏
          </h1>
        </div>

        {/* Yesterday's aahanik banner — shown before 6am */}
        {fillingYesterday && (
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/50 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Filling Yesterday&apos;s Aahanik</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">It&apos;s before 6 AM — activities saved for {activeDateLabel}</p>
            </div>
          </div>
        )}

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

        {/* Achievement discovery banner — shown once to all users */}
        {!achievementBannerDismissed && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-2xl border border-amber-200 dark:border-amber-800/50 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">Achievements Unlocked!</p>
              <p className="text-xs text-orange-500 dark:text-orange-400">Earn badges as you grow your Rajipo 🏅</p>
            </div>
            <button
              onClick={() => {
                localStorage.setItem(ACHIEVEMENT_NOTIF_KEY, '1')
                setAchievementBannerDismissed(true)
                router.push('/achievements')
              }}
              className="px-3 py-1.5 bg-orange-600 text-white text-xs font-semibold rounded-xl hover:bg-orange-700 transition-colors flex-shrink-0"
            >
              View
            </button>
            <button
              onClick={() => {
                localStorage.setItem(ACHIEVEMENT_NOTIF_KEY, '1')
                setAchievementBannerDismissed(true)
              }}
              className="w-6 h-6 rounded-full hover:bg-orange-100 flex items-center justify-center text-orange-300 flex-shrink-0"
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
          streak={mainStreak}
          todayPoints={todayLog.totalPoints}
          guruImages={appConfig.guruImages}
        />

        {/* Badge strip */}
        <BadgeStrip
          rajipo={userProfile?.rajipo ?? 0}
          stages={appConfig.achievementStages}
        />

        {/* Progress bar */}
        <ProgressBar completed={completedCount} total={mainActivityDefs.length} />

        {/* Daily quote / rotating motivation */}
        {(appConfig.dailyQuote || (appConfig.motivations && appConfig.motivations.length > 0)) && (
          <DailyQuote
            quote={appConfig.dailyQuote}
            motivations={appConfig.motivations}
            motivationDurationHours={appConfig.motivationDurationHours}
          />
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
                vanchanText={
                  activity.id === 'vachnamrut-vanchan'
                    ? appConfig.thisWeeksVanchan?.vachnamrut
                    : activity.id === 'swamini-vato-vanchan'
                    ? appConfig.thisWeeksVanchan?.swaminiVato
                    : undefined
                }
                vanchanLink={
                  activity.id === 'vachnamrut-vanchan'
                    ? appConfig.thisWeeksVanchan?.vachnamrutLink
                    : activity.id === 'swamini-vato-vanchan'
                    ? appConfig.thisWeeksVanchan?.swaminiVatoLink
                    : undefined
                }
                youtubeLink={
                  activity.id !== 'vachnamrut-vanchan' && activity.id !== 'swamini-vato-vanchan'
                    ? appConfig.activityYoutubeLinks?.[activity.id]
                    : undefined
                }
              />
            ))}
          </div>
        </div>

        {/* Bonus Rajipo */}
        <div className="bg-orange-50 dark:bg-orange-950/30 rounded-3xl shadow-sm border border-orange-200 dark:border-orange-800/50 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-orange-200 dark:border-orange-800/50 bg-orange-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-white fill-white flex-shrink-0" />
              <h2 className="text-sm font-bold text-white">Bonus Rajipo</h2>
            </div>
            <span className="text-xs text-orange-100 font-medium">
              {bonusCompletedCount}/{bonusActivityDefs.length} done
            </span>
          </div>
          <div className="divide-y divide-orange-100 dark:divide-orange-900/40">
            {bonusActivityDefs.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                logEntry={todayLog.activities[activity.id]}
                activityStreak={activityStreaks[activity.id] ?? 0}
                reminder={reminders[activity.id]}
                onToggle={(done) => toggleActivity(activity.id, done)}
                onReminderOpen={() => setOpenReminderId(activity.id)}
                youtubeLink={appConfig.activityYoutubeLinks?.[activity.id]}
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

      {/* Milestone celebration overlay */}
      {milestoneOverlay && (
        <MilestoneOverlay
          points={milestoneOverlay.points}
          tierIndex={milestoneOverlay.tierIndex}
          onDismiss={() => setMilestoneOverlay(null)}
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
