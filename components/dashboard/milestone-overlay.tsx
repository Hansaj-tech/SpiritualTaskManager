'use client'

import { useEffect, useState, useCallback } from 'react'
import { getTier } from '@/components/profile/achievement-tab'

// Pre-seeded confetti so values are stable across renders
const CONFETTI = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: (i * 37 + 7) % 95,
  delay: (i * 137) % 1400,
  color: ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#F97316', '#EC4899', '#FBBF24', '#14B8A6', '#F43F5E'][i % 10],
  size: 6 + (i % 3) * 3,
  duration: 1600 + (i * 113) % 900,
}))

interface MilestoneOverlayProps {
  points: number
  tierIndex: number
  onDismiss: () => void
}

const AUTO_DISMISS_MS = 5000

export function MilestoneOverlay({ points, tierIndex, onDismiss }: MilestoneOverlayProps) {
  const tier = getTier(tierIndex)
  const [progress, setProgress] = useState(100)

  const dismiss = useCallback(() => onDismiss(), [onDismiss])

  useEffect(() => {
    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100)
      setProgress(pct)
      if (pct <= 0) {
        clearInterval(tick)
        dismiss()
      }
    }, 40)
    return () => clearInterval(tick)
  }, [dismiss])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={dismiss}
    >
      {/* Confetti layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {CONFETTI.map(p => (
          <span
            key={p.id}
            className="absolute rounded-sm animate-confetti-fall"
            style={{
              left: `${p.left}%`,
              top: '-12px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${p.duration}ms`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="relative mx-5 w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden animate-celebration"
        onClick={e => e.stopPropagation()}
      >
        {/* Countdown progress bar */}
        <div className="h-1.5 bg-orange-100 dark:bg-stone-800">
          <div
            className={`h-full bg-gradient-to-r ${tier.gradient} transition-none`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-8 py-8 text-center">
          {/* Badge */}
          <div className="relative inline-flex items-center justify-center mb-5">
            {/* Outer glow ring */}
            <div
              className={`absolute w-32 h-32 rounded-full opacity-20 animate-pulse`}
              style={{ background: `radial-gradient(circle, ${tier.accentHex} 0%, transparent 70%)` }}
            />
            {/* Badge circle */}
            <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-2xl animate-badge-glow`}>
              <span className="text-5xl drop-shadow-lg select-none">{tier.emoji}</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
            </div>
            {/* Sparkle dots */}
            <span className="absolute top-0 right-0 w-4 h-4 rounded-full animate-sparkle" style={{ backgroundColor: tier.accentHex, opacity: 0.8 }} />
            <span className="absolute bottom-1 left-0 w-3 h-3 rounded-full animate-sparkle" style={{ backgroundColor: tier.accentHex, animationDelay: '350ms', opacity: 0.7 }} />
            <span className="absolute top-2 left-2 w-2 h-2 rounded-full animate-sparkle" style={{ backgroundColor: '#FBBF24', animationDelay: '150ms', opacity: 0.9 }} />
          </div>

          {/* Tier pill */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
            style={{ backgroundColor: tier.accentHex + '22', color: tier.accentHex }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: tier.accentHex }} />
            {tier.name} Badge
          </div>

          <h2 className="text-2xl font-extrabold text-orange-900 dark:text-orange-50 leading-tight">
            Congratulations! 🎉
          </h2>
          <p className="text-base text-orange-700 dark:text-orange-300 font-semibold mt-1">
            {points.toLocaleString()} Rajipo reached!
          </p>
          <p className="text-xs text-orange-400 dark:text-stone-400 mt-2 leading-relaxed max-w-[240px] mx-auto">
            Your devotion has earned you the <span className="font-bold" style={{ color: tier.accentHex }}>{tier.name}</span> badge. Jai Swaminarayan! 🙏
          </p>

          <button
            onClick={dismiss}
            className="mt-6 px-8 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Thank you!
          </button>
        </div>
      </div>
    </div>
  )
}
