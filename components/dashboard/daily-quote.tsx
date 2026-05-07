'use client'

import { useState, useEffect } from 'react'

interface DailyQuoteProps {
  quote: string
  motivations?: string[]
  motivationDurationHours?: number
}

function pickMotivation(motivations: string[], durationHours: number): string {
  if (motivations.length === 0) return ''
  const slot = Math.floor(Date.now() / (durationHours * 3_600_000))
  return motivations[slot % motivations.length]
}

export function DailyQuote({ quote, motivations, motivationDurationHours = 4 }: DailyQuoteProps) {
  const hasMotivations = motivations && motivations.length > 0
  const [displayed, setDisplayed] = useState(() =>
    hasMotivations ? pickMotivation(motivations!, motivationDurationHours) : quote
  )

  // Re-pick whenever the slot flips (check every minute)
  useEffect(() => {
    if (!hasMotivations) {
      setDisplayed(quote)
      return
    }
    setDisplayed(pickMotivation(motivations!, motivationDurationHours))
    const id = setInterval(() => {
      setDisplayed(pickMotivation(motivations!, motivationDurationHours))
    }, 60_000)
    return () => clearInterval(id)
  }, [motivations, motivationDurationHours, quote, hasMotivations])

  if (!displayed) return null

  return (
    <div className="relative bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl px-5 py-5 overflow-hidden">
      {/* Decorative quotation mark */}
      <div className="absolute -top-2 -left-1 text-8xl text-white/10 font-serif leading-none select-none">&ldquo;</div>
      <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">
        Daily Inspiration
      </p>
      <p className="text-sm text-white leading-relaxed relative z-10 font-medium">
        &ldquo;{displayed}&rdquo;
      </p>
    </div>
  )
}
