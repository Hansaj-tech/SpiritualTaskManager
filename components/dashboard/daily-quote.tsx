interface DailyQuoteProps {
  quote: string
}

export function DailyQuote({ quote }: DailyQuoteProps) {
  if (!quote) return null
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4">
      <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1">
        Daily Inspiration
      </p>
      <p className="text-sm text-orange-900 leading-relaxed italic">&ldquo;{quote}&rdquo;</p>
    </div>
  )
}
