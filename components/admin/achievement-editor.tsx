'use client'

import { useState } from 'react'
import { Plus, Trash2, Loader2, Check } from 'lucide-react'
import { updateAchievementStages } from '@/lib/firestore-helpers'

const DEFAULT_STAGES = [1000, 2500, 5000, 7500, 10000]

interface AchievementEditorProps {
  initialStages?: number[]
}

export function AchievementEditor({ initialStages }: AchievementEditorProps) {
  const [stages, setStages] = useState<number[]>(
    (initialStages && initialStages.length > 0 ? initialStages : DEFAULT_STAGES).slice().sort((a, b) => a - b)
  )
  const [newValue, setNewValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleAdd() {
    const n = parseInt(newValue.trim(), 10)
    if (isNaN(n) || n <= 0) { setError('Enter a positive number'); return }
    if (stages.includes(n)) { setError('That milestone already exists'); return }
    setStages(prev => [...prev, n].sort((a, b) => a - b))
    setNewValue('')
    setError('')
  }

  function handleRemove(stage: number) {
    setStages(prev => prev.filter(s => s !== stage))
  }

  async function handleSave() {
    if (stages.length === 0) { setError('Add at least one milestone'); return }
    setSaving(true)
    await updateAchievementStages(stages)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-orange-500">
        These are the Rajipo milestones that unlock achievement badges in user profiles.
      </p>

      {/* Stage list */}
      <div className="flex flex-col gap-2">
        {stages.map((s) => (
          <div
            key={s}
            className="flex items-center justify-between bg-orange-50 dark:bg-stone-800 rounded-xl px-3 py-2 border border-orange-100 dark:border-stone-700"
          >
            <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">
              {s.toLocaleString()} pts
            </span>
            <button
              onClick={() => handleRemove(s)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {stages.length === 0 && (
          <p className="text-sm text-orange-300 text-center py-3">No milestones set</p>
        )}
      </div>

      {/* Add new stage */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="number"
            value={newValue}
            onChange={e => { setNewValue(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. 15000"
            min={1}
            className="w-full h-10 px-3 rounded-xl border border-orange-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm text-orange-900 dark:text-orange-100 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <button
          onClick={handleAdd}
          className="h-10 px-3 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl transition-colors flex items-center gap-1 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className={`h-11 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
          saved ? 'bg-green-500' : 'bg-orange-600 hover:bg-orange-700'
        } disabled:opacity-60`}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Milestones'}
      </button>
    </div>
  )
}
