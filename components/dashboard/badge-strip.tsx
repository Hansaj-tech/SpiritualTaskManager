'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, ChevronRight } from 'lucide-react'
import { getTier, BADGE_TIERS } from '@/components/profile/achievement-tab'
import { DEFAULT_ACHIEVEMENT_STAGES } from '@/lib/constants'

interface BadgeStripProps {
  rajipo: number
  stages?: number[]
}

export function BadgeStrip({ rajipo, stages }: BadgeStripProps) {
  const router = useRouter()
  const milestones = (stages && stages.length > 0 ? [...stages] : [...DEFAULT_ACHIEVEMENT_STAGES]).sort((a, b) => a - b)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <>
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-orange-100 dark:border-stone-700 px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Your Badges</span>
          <button
            onClick={() => router.push('/achievements')}
            className="flex items-center gap-0.5 text-xs text-orange-400 hover:text-orange-600 transition-colors"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {milestones.map((m, i) => {
            const earned = rajipo >= m
            const tier = getTier(i)
            return (
              <button
                key={m}
                onClick={() => setSelectedIndex(i)}
                className="flex flex-col items-center gap-1 flex-1 min-w-0 group"
              >
                <div className={`relative w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-sm transition-transform group-active:scale-90 ${
                  earned
                    ? `bg-gradient-to-br ${tier.gradient} group-hover:shadow-md`
                    : 'bg-orange-100 dark:bg-stone-800 opacity-40'
                } ${earned && rajipo < (milestones[i + 1] ?? Infinity) && rajipo >= m ? 'ring-2 ring-orange-400 ring-offset-1 ring-offset-white dark:ring-offset-stone-900' : ''}`}
                >
                  <span className="drop-shadow-sm">{earned ? tier.emoji : '🔒'}</span>
                  {earned && <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 to-transparent" />}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wide truncate w-full text-center ${
                  earned ? tier.subColor : 'text-orange-300 dark:text-stone-600'
                }`}>
                  {tier.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Badge info modal */}
      {selectedIndex !== null && (
        <BadgeModal
          milestones={milestones}
          tierIndex={selectedIndex}
          rajipo={rajipo}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  )
}

// ─── Badge info modal ─────────────────────────────────────────────────────────

function BadgeModal({ milestones, tierIndex, rajipo, onClose }: {
  milestones: number[]
  tierIndex: number
  rajipo: number
  onClose: () => void
}) {
  const points = milestones[tierIndex]
  const tier = getTier(tierIndex)
  const earned = rajipo >= points

  const nextIndex = tierIndex + 1
  const nextPoints = milestones[nextIndex] ?? null
  const nextTier = nextPoints !== null ? getTier(nextIndex) : null

  const prevPoints = tierIndex > 0 ? milestones[tierIndex - 1] : 0
  const progress = prevPoints >= points
    ? 100
    : Math.min(100, Math.round(((rajipo - prevPoints) / (points - prevPoints)) * 100))

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden animate-celebration"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-orange-100 dark:bg-stone-700 flex items-center justify-center text-orange-500 hover:bg-orange-200 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge header band */}
        <div className={`bg-gradient-to-br ${tier.gradient} px-8 pt-8 pb-6 flex flex-col items-center gap-2`}>
          <div className={`w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl shadow-xl ${earned ? 'animate-badge-glow' : ''}`}>
            <span className="drop-shadow-md">{earned ? tier.emoji : '🔒'}</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 to-transparent" />
          </div>
          <span className="text-white font-extrabold text-lg tracking-wide drop-shadow">{tier.name}</span>
          <span className="text-white/80 text-xs font-semibold">{points.toLocaleString()} Rajipo milestone</span>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Status */}
          {earned ? (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 rounded-xl px-3 py-2.5 border border-green-200 dark:border-green-800/50">
              <span className="text-green-500 text-lg">✓</span>
              <div>
                <p className="text-sm font-bold text-green-800 dark:text-green-300">Achieved!</p>
                <p className="text-xs text-green-600 dark:text-green-400">You have surpassed {points.toLocaleString()} Rajipo 🎉</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between mb-1.5">
                <span className={`text-xs font-semibold ${tier.subColor}`}>Progress to {tier.name}</span>
                <span className={`text-xs font-bold ${tier.subColor}`}>{progress}%</span>
              </div>
              <div className="h-2.5 bg-orange-100 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${tier.gradient} rounded-full transition-all duration-700`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-orange-400 mt-1.5 text-right">
                {(points - rajipo).toLocaleString()} pts to go
              </p>
            </div>
          )}

          {/* Next badge */}
          {nextTier && nextPoints && (
            <div className={`rounded-xl border-2 px-4 py-3 flex items-center gap-3 ${nextTier.cardBg} ${nextTier.border}`}>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${nextTier.gradient} flex items-center justify-center text-xl opacity-70 flex-shrink-0`}>
                {nextTier.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold uppercase tracking-wide ${nextTier.subColor}`}>Next Badge</p>
                <p className={`text-sm font-bold ${nextTier.labelColor}`}>{nextTier.name}</p>
                <p className={`text-xs ${nextTier.subColor}`}>{nextPoints.toLocaleString()} Rajipo</p>
              </div>
              {earned && rajipo < nextPoints && (
                <span className={`text-xs font-bold ${nextTier.subColor} flex-shrink-0`}>
                  {(nextPoints - rajipo).toLocaleString()} to go
                </span>
              )}
            </div>
          )}

          {/* Top tier reached */}
          {!nextTier && earned && (
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/20 border border-violet-200 dark:border-violet-800/50 rounded-xl px-4 py-3 text-center">
              <p className="text-sm font-bold text-violet-900 dark:text-violet-100">🏆 Maximum tier reached!</p>
              <p className="text-xs text-violet-500 mt-0.5">Jai Swaminarayan! You are at Platinum.</p>
            </div>
          )}

          {/* All tiers preview */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {BADGE_TIERS.map((t, i) => (
              <div
                key={t.name}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  i === tierIndex
                    ? `bg-gradient-to-br ${t.gradient} ring-2 ring-offset-1 ring-offset-white dark:ring-offset-stone-900`
                    : milestones[i] && rajipo >= milestones[i]
                    ? `bg-gradient-to-br ${t.gradient} opacity-60`
                    : 'bg-orange-100 dark:bg-stone-700 opacity-40'
                }`}
              >
                {milestones[i] && rajipo >= milestones[i] ? t.emoji : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
