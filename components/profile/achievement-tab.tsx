'use client'

import { useEffect, useState } from 'react'

const DEFAULT_STAGES = [1000, 2500, 5000, 7500, 10000]

interface AchievementTabProps {
  rajipo: number
  stages?: number[]
}

export function AchievementTab({ rajipo, stages }: AchievementTabProps) {
  const milestones = (stages && stages.length > 0 ? stages : DEFAULT_STAGES).slice().sort((a, b) => a - b)
  const earnedMilestones = milestones.filter(m => rajipo >= m)
  const nextMilestone = milestones.find(m => rajipo < m) ?? null
  const latestEarned = earnedMilestones[earnedMilestones.length - 1] ?? null

  const [celebrateMilestone, setCelebrateMilestone] = useState<number | null>(null)
  const [animateBadges, setAnimateBadges] = useState(false)

  useEffect(() => {
    // Trigger entrance animations on mount
    const t = setTimeout(() => setAnimateBadges(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (latestEarned !== null) {
      const key = `aahanik-achievement-celebrated-${latestEarned}`
      if (!localStorage.getItem(key)) {
        setCelebrateMilestone(latestEarned)
        localStorage.setItem(key, '1')
      }
    }
  }, [latestEarned])

  return (
    <div className="flex flex-col gap-5 pt-2">
      {/* Congratulations burst for newly earned milestone */}
      {celebrateMilestone !== null && (
        <CelebrationBanner
          points={celebrateMilestone}
          onDismiss={() => setCelebrateMilestone(null)}
        />
      )}

      {/* Progress toward next milestone */}
      {nextMilestone !== null && (
        <NextMilestoneCard
          current={rajipo}
          next={nextMilestone}
          prev={earnedMilestones[earnedMilestones.length - 1] ?? 0}
        />
      )}

      {/* Badge grid */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Your Badges</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {milestones.map((m, i) => {
            const earned = rajipo >= m
            const isLatest = m === latestEarned
            return (
              <BadgeCard
                key={m}
                points={m}
                earned={earned}
                isLatest={isLatest}
                animationDelay={i * 80}
                visible={animateBadges}
              />
            )
          })}
        </div>
      </div>

      {/* All unlocked message */}
      {nextMilestone === null && earnedMilestones.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800/50 rounded-2xl px-4 py-4 text-center">
          <p className="text-2xl mb-1">🏆</p>
          <p className="text-sm font-bold text-orange-900 dark:text-orange-100">All badges unlocked!</p>
          <p className="text-xs text-orange-500 mt-0.5">You have achieved all milestones. Jai Swaminarayan!</p>
        </div>
      )}

      {/* Current points reminder */}
      <div className="bg-orange-50 dark:bg-stone-900 rounded-2xl px-4 py-3 flex items-center justify-between border border-orange-100 dark:border-stone-700">
        <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">Total Rajipo</span>
        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{rajipo.toLocaleString()} pts</span>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CelebrationBanner({ points, onDismiss }: { points: number; onDismiss: () => void }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600 rounded-2xl px-5 py-5 text-center shadow-lg animate-celebration">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

      {/* Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['top-2 left-6', 'top-4 right-8', 'top-1 left-1/2', 'bottom-3 left-10', 'bottom-2 right-6'].map((pos, i) => (
          <span
            key={i}
            className={`absolute text-white/70 text-lg animate-sparkle`}
            style={{ animationDelay: `${i * 200}ms`, top: pos.split(' ')[0].replace('top-', '') + 'px' }}
          >
            ✦
          </span>
        ))}
      </div>

      <p className="text-3xl mb-1">🎖️</p>
      <p className="text-white font-extrabold text-lg leading-tight">Congratulations!</p>
      <p className="text-white/90 text-sm mt-1">
        You&apos;ve reached <span className="font-bold">{points.toLocaleString()} Rajipo</span>
      </p>
      <p className="text-white/75 text-xs mt-0.5">A new badge has been unlocked for your devotion 🙏</p>
      <button
        onClick={onDismiss}
        className="mt-3 px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-xl transition-colors border border-white/30"
      >
        Awesome!
      </button>
    </div>
  )
}

function BadgeCard({
  points,
  earned,
  isLatest,
  animationDelay,
  visible,
}: {
  points: number
  earned: boolean
  isLatest: boolean
  animationDelay: number
  visible: boolean
}) {
  const label = formatPoints(points)

  return (
    <div
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${
        earned
          ? isLatest
            ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-950/40 dark:via-orange-950/30 dark:to-amber-950/30 border-orange-400 shadow-md shadow-orange-200/50 dark:shadow-orange-900/30'
            : 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-orange-300 dark:border-orange-700'
          : 'bg-white dark:bg-stone-900 border-orange-100 dark:border-stone-700 opacity-50'
      }`}
      style={{ transitionDelay: `${animationDelay}ms` }}
    >
      {isLatest && (
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
          NEW
        </span>
      )}

      {/* Badge icon */}
      <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
        earned
          ? 'bg-gradient-to-br from-yellow-300 via-orange-400 to-amber-500 shadow-lg'
          : 'bg-orange-100 dark:bg-stone-800'
      } ${isLatest ? 'animate-badge-glow' : ''}`}>
        {earned ? badgeEmoji(points) : '🔒'}
        {earned && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
        )}
      </div>

      <div className="text-center">
        <p className={`text-sm font-bold ${earned ? 'text-orange-900 dark:text-orange-100' : 'text-orange-300 dark:text-stone-600'}`}>
          {label}
        </p>
        <p className={`text-[11px] mt-0.5 ${earned ? 'text-orange-500' : 'text-orange-300 dark:text-stone-600'}`}>
          {earned ? 'Achieved' : `${points.toLocaleString()} pts`}
        </p>
      </div>
    </div>
  )
}

function NextMilestoneCard({ current, next, prev }: { current: number; next: number; prev: number }) {
  const progress = prev >= next ? 100 : Math.min(100, Math.round(((current - prev) / (next - prev)) * 100))
  const remaining = next - current

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-orange-200 dark:border-stone-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Next Achievement</p>
          <p className="text-base font-bold text-orange-900 dark:text-orange-100 mt-0.5">
            {formatPoints(next)} Rajipo
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-stone-800 flex items-center justify-center text-2xl opacity-60">
          {badgeEmoji(next)}
        </div>
      </div>
      <div className="h-2.5 bg-orange-100 dark:bg-stone-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-orange-400">{current.toLocaleString()} pts</span>
        <span className="text-xs text-orange-400">{remaining.toLocaleString()} pts to go</span>
      </div>
    </div>
  )
}

function badgeEmoji(points: number): string {
  if (points >= 10000) return '👑'
  if (points >= 7500) return '💎'
  if (points >= 5000) return '🥇'
  if (points >= 2500) return '🌟'
  return '🎖️'
}

function formatPoints(points: number): string {
  if (points >= 1000) return `${(points / 1000).toFixed(points % 1000 === 0 ? 0 : 1)}K`
  return points.toString()
}
