'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { updateMotivations } from '@/lib/firestore-helpers'

interface MotivationsEditorProps {
  initialMotivations?: string[]
  initialDurationHours?: number
}

export function MotivationsEditor({ initialMotivations = [], initialDurationHours = 4 }: MotivationsEditorProps) {
  const [motivations, setMotivations] = useState<string[]>(
    initialMotivations.length > 0 ? initialMotivations : ['']
  )
  const [durationHours, setDurationHours] = useState(initialDurationHours)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function updateItem(index: number, value: string) {
    setMotivations((prev) => prev.map((m, i) => (i === index ? value : m)))
  }

  function addItem() {
    setMotivations((prev) => [...prev, ''])
  }

  function removeItem(index: number) {
    setMotivations((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    const filtered = motivations.map((m) => m.trim()).filter(Boolean)
    if (filtered.length === 0) return
    setSaving(true)
    await updateMotivations(filtered, durationHours)
    setMotivations(filtered)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-orange-100 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-orange-900">Motivations List</label>
          <span className="text-xs text-orange-400">{motivations.filter(Boolean).length} entries</span>
        </div>

        <div className="flex flex-col gap-2">
          {motivations.map((m, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-xs text-orange-400 pt-2.5 w-5 text-right flex-shrink-0">{i + 1}</span>
              <textarea
                value={m}
                onChange={(e) => updateItem(i, e.target.value)}
                rows={2}
                placeholder={`Motivation ${i + 1}…`}
                className="flex-1 px-3 py-2 rounded-xl border-2 border-orange-200 text-orange-900 text-sm resize-none focus:outline-none focus:border-orange-600"
              />
              <button
                onClick={() => removeItem(i)}
                disabled={motivations.length === 1}
                className="mt-1.5 p-1.5 rounded-lg text-orange-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:pointer-events-none flex-shrink-0"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-dashed border-orange-200 text-orange-500 text-sm font-medium hover:border-orange-400 hover:bg-orange-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add motivation
        </button>

        <p className="text-xs text-orange-400">
          Motivations rotate automatically — each one displays for the set duration, then the next appears.
        </p>
      </div>

      {/* Duration setting */}
      <div className="bg-white rounded-2xl border border-orange-100 p-4">
        <label className="text-sm font-medium text-orange-900 mb-3 block">
          Rotation Duration
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={24}
            value={durationHours}
            onChange={(e) => setDurationHours(Math.max(1, Math.min(24, Number(e.target.value))))}
            className="w-20 px-3 py-2 rounded-xl border-2 border-orange-200 text-orange-900 text-sm focus:outline-none focus:border-orange-600"
          />
          <span className="text-sm text-orange-700">hours per motivation</span>
        </div>
        <p className="text-xs text-orange-400 mt-1">
          Each motivation shows for this many hours before switching to the next one.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || motivations.filter(Boolean).length === 0}
        className="w-full h-11 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
      >
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Motivations'}
      </button>
    </div>
  )
}
