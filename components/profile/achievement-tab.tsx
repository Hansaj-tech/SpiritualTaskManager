'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_ACHIEVEMENT_STAGES } from '@/lib/constants'

export const BADGE_TIERS = [
  {
    name: 'Bronze',
    emoji: '🥉',
    gradient: 'from-amber-700 via-amber-500 to-yellow-600',
    border: 'border-amber-500 dark:border-amber-600',
    cardBg: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30',
    glowClass: 'shadow-amber-400/60',
    labelColor: 'text-amber-800 dark:text-amber-200',
    subColor: 'text-amber-600 dark:text-amber-400',
    accentHex: '#D97706',
  },
  {
    name: 'Silver',
    emoji: '🥈',
    gradient: 'from-slate-500 via-gray-400 to-slate-300',
    border: 'border-slate-400 dark:border-slate-500',
    cardBg: 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/40 dark:to-gray-950/30',
    glowClass: 'shadow-slate-400/60',
    labelColor: 'text-slate-800 dark:text-slate-200',
    subColor: 'text-slate-500 dark:text-slate-400',
    accentHex: '#94A3B8',
  },
  {
    name: 'Gold',
    emoji: '🥇',
    gradient: 'from-yellow-400 via-amber-300 to-yellow-500',
    border: 'border-yellow-400 dark:border-yellow-500',
    cardBg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/30',
    glowClass: 'shadow-yellow-400/60',
    labelColor: 'text-yellow-900 dark:text-yellow-200',
    subColor: 'text-yellow-600 dark:text-yellow-400',
    accentHex: '#EAB308',
  },
  {
    name: 'Diamond',
    emoji: '💎',
    gradient: 'from-cyan-300 via-sky-200 to-blue-400',
    border: 'border-cyan-400 dark:border-cyan-500',
    cardBg: 'bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/30',
    glowClass: 'shadow-cyan-400/60',
    labelColor: 'text-cyan-900 dark:text-cyan-200',
    subColor: 'text-cyan-600 dark:text-cyan-400',
    accentHex: '#06B6D4',
  },
  {
    name: 'Platinum',
    emoji: '👑',
    gradient: 'from-violet-400 via-purple-300 to-indigo-400',
    border: 'border-violet-400 dark:border-violet-500',
    cardBg: 'bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/30',
    glowClass: 'shadow-violet-400/60',
    labelColor: 'text-violet-900 dark:text-violet-200',
    subColor: 'text-violet-600 dark:text-violet-400',
    accentHex: '#8B5CF6',
  },
] as const

export type BadgeTier = typeof BADGE_TIERS[number]

export function getTier(index: number): BadgeTier {
  return BADGE_TIERS[Math.min(index, BADGE_TIERS.length - 1)]
}

interface AchievementTabProps {
  rajipo: number
  stages?: number[]
}

export function AchievementTab({ rajipo, stages }: AchievementTabProps) {
  const milestones = (stages && stages.length > 0 ? [...stages] : [...DEFAULT_ACHIEVEMENT_STAGES]).sort((a, b) => a - b)
  const earnedMilestones = milestones.filter(m => rajipo >= m)
  const nextMilestone = milestones.find(m => rajipo < m) ?? null
  const latestEarned = earnedMilestones[earnedMilestones.length - 1] ?? null

  const [celebrateMilestone, setCelebrateMilestone] = useState<number | null>(null)
  const [animateBadges, setAnimateBadges] = useState(false)

  useEffect(() => {
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
          tierIndex={milestones.indexOf(celebrateMilestone)}
          onDismiss={() => setCelebrateMilestone(null)}
        />
      )}

      {/* Progress toward next milestone */}
      {nextMilestone !== null && (
        <NextMilestoneCard
          current={rajipo}
          next={nextMilestone}
          prev={earnedMilestones[earnedMilestones.length - 1] ?? 0}
          tierIndex={milestones.indexOf(nextMilestone)}
        />
      )}

      {/* Badge grid */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Your Badges</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {milestones.map((m, i) => (
            <BadgeCard
              key={m}
              points={m}
              tierIndex={i}
              earned={rajipo >= m}
              isLatest={m === latestEarned}
              animationDelay={i * 80}
              visible={animateBadges}
            />
          ))}
        </div>
      </div>

      {/* All unlocked message */}
      {nextMilestone === null && earnedMilestones.length > 0 && (
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/20 border border-violet-200 dark:border-violet-800/50 rounded-2xl px-4 py-4 text-center">
          <p className="text-2xl mb-1">👑</p>
          <p className="text-sm font-bold text-violet-900 dark:text-violet-100">All badges unlocked!</p>
          <p className="text-xs text-violet-500 mt-0.5">You have achieved Platinum status. Jai Swaminarayan!</p>
        </div>
      )}

      {/* Current points */}
      <div className="bg-orange-50 dark:bg-stone-900 rounded-2xl px-4 py-3 flex items-center justify-between border border-orange-100 dark:border-stone-700">
        <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">Total Rajipo</span>
        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{rajipo.toLocaleString()} pts</span>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function CelebrationBanner({ points, tierIndex, onDismiss }: { points: number; tierIndex: number; onDismiss: () => void }) {
  const tier = getTier(tierIndex)
  return (
    <div className={`relative overflow-hidden rounded-2xl px-5 py-5 text-center shadow-lg animate-celebration bg-gradient-to-br ${tier.gradient}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
      <p className="text-4xl mb-1 drop-shadow-md">{tier.emoji}</p>
      <p className="text-white font-extrabold text-lg leading-tight drop-shadow">Congratulations!</p>
      <p className="text-white/90 text-sm font-semibold mt-0.5">{tier.name} Badge Unlocked!</p>
      <p className="text-white/80 text-xs mt-1">You&apos;ve reached <span className="font-bold">{points.toLocaleString()} Rajipo</span></p>
      <button
        onClick={onDismiss}
        className="mt-3 px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-xl transition-colors border border-white/30"
      >
        Awesome!
      </button>
    </div>
  )
}

function BadgeCard({ points, tierIndex, earned, isLatest, animationDelay, visible }: {
  points: number
  tierIndex: number
  earned: boolean
  isLatest: boolean
  animationDelay: number
  visible: boolean
}) {
  const tier = getTier(tierIndex)

  return (
    <div
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${
        earned
          ? `${tier.cardBg} ${tier.border} ${isLatest ? `shadow-lg ${tier.glowClass}` : ''}`
          : 'bg-white dark:bg-stone-900 border-orange-100 dark:border-stone-700 opacity-50'
      }`}
      style={{ transitionDelay: `${animationDelay}ms` }}
    >
      {isLatest && (
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
          NEW
        </span>
      )}

      {/* Badge circle */}
      <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-md ${
        earned
          ? `bg-gradient-to-br ${tier.gradient} ${isLatest ? 'animate-badge-glow' : ''}`
          : 'bg-orange-100 dark:bg-stone-800'
      }`}>
        <span className="drop-shadow">{earned ? tier.emoji : '🔒'}</span>
        {earned && <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />}
      </div>

      <div className="text-center">
        <p className={`text-xs font-bold uppercase tracking-wide ${earned ? tier.labelColor : 'text-orange-300 dark:text-stone-600'}`}>
          {earned ? tier.name : tier.name}
        </p>
        <p className={`text-[11px] mt-0.5 ${earned ? tier.subColor : 'text-orange-300 dark:text-stone-600'}`}>
          {earned ? `${points.toLocaleString()} pts` : `${points.toLocaleString()} pts`}
        </p>
        {earned && <p className={`text-[10px] font-semibold mt-0.5 ${tier.subColor}`}>Achieved</p>}
      </div>
    </div>
  )
}

function NextMilestoneCard({ current, next, prev, tierIndex }: { current: number; next: number; prev: number; tierIndex: number }) {
  const tier = getTier(tierIndex)
  const progress = prev >= next ? 100 : Math.min(100, Math.round(((current - prev) / (next - prev)) * 100))
  const remaining = next - current

  return (
    <div className={`rounded-2xl border-2 p-4 ${tier.cardBg} ${tier.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Next Achievement</p>
          <p className={`text-base font-bold mt-0.5 ${tier.labelColor}`}>{tier.name} — {next.toLocaleString()} pts</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br ${tier.gradient} opacity-40`}>
          {tier.emoji}
        </div>
      </div>
      <div className="h-2.5 bg-white/60 dark:bg-stone-800/60 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${tier.gradient} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className={`text-xs ${tier.subColor}`}>{current.toLocaleString()} pts</span>
        <span className={`text-xs ${tier.subColor}`}>{remaining.toLocaleString()} to go</span>
      </div>
    </div>
  )
}
