interface DailyQuoteProps {
  quote: string
}

export function DailyQuote({ quote }: DailyQuoteProps) {
  if (!quote) return null
  return (
    <div className="relative bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl px-5 py-5 overflow-hidden">
      {/* Decorative quotation mark */}
      <div className="absolute -top-2 -left-1 text-8xl text-white/10 font-serif leading-none select-none">&ldquo;</div>
      <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">
        Daily Inspiration
      </p>
      <p className="text-sm text-white leading-relaxed relative z-10 font-medium">
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  )
}
