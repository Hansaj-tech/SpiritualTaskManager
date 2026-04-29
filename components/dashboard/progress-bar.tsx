interface ProgressBarProps {
  completed: number
  total: number
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const allDone = completed === total && total > 0

  return (
    <div className={`rounded-3xl px-5 py-4 transition-all ${allDone ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-white dark:bg-stone-900 border border-orange-100 dark:border-stone-700 shadow-sm'}`}>
      <div className="flex justify-between items-center mb-3">
        <span className={`text-sm font-semibold ${allDone ? 'text-white' : 'text-orange-900 dark:text-orange-50'}`}>
          {allDone ? '🎉 All Complete!' : "Today's Progress"}
        </span>
        <span className={`text-sm font-bold ${allDone ? 'text-white' : 'text-orange-600'}`}>
          {completed} / {total}
        </span>
      </div>
      <div className={`h-2.5 rounded-full overflow-hidden ${allDone ? 'bg-white/20' : 'bg-orange-100 dark:bg-stone-700'}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${allDone ? 'bg-white' : 'bg-gradient-to-r from-orange-500 to-amber-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {allDone && (
        <p className="text-xs text-white/80 font-medium mt-2.5 text-center">
          Jai Swaminarayan! Rajipo earned today 🙏
        </p>
      )}
    </div>
  )
}
