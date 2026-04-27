interface ProgressBarProps {
  completed: number
  total: number
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 px-5 py-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-orange-900">Today&apos;s Progress</span>
        <span className="text-sm font-semibold text-orange-600">
          {completed} / {total}
        </span>
      </div>
      <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-600 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {completed === total && total > 0 && (
        <p className="text-xs text-orange-600 font-medium mt-2 text-center">
          All activities complete! Jai Swaminarayan 🙏
        </p>
      )}
    </div>
  )
}
