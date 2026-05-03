'use client'

import { useState } from 'react'
import { updateActivityPoints } from '@/lib/firestore-helpers'
import { ACTIVITY_IDS, BONUS_ACTIVITY_IDS, DEFAULT_ACTIVITIES } from '@/lib/constants'
import type { ActivityDefinition } from '@/types'

interface PointsEditorProps {
  activityDefs: ActivityDefinition[]
}

export function PointsEditor({ activityDefs }: PointsEditorProps) {
  const [points, setPoints] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const id of [...ACTIVITY_IDS, ...BONUS_ACTIVITY_IDS]) {
      const def = activityDefs.find((a) => a.id === id)
      init[id] = def?.points ?? DEFAULT_ACTIVITIES[id].points
    }
    return init
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await updateActivityPoints(points)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function renderRow(id: string, index: number, total: number) {
    const def = activityDefs.find((a) => a.id === id)
    const name = def?.name ?? DEFAULT_ACTIVITIES[id as keyof typeof DEFAULT_ACTIVITIES]?.name ?? id
    return (
      <div
        key={id}
        className={`flex items-center justify-between px-4 py-3 ${
          index < total - 1 ? 'border-b border-orange-50' : ''
        }`}
      >
        <span className="text-sm text-orange-900 flex-1">{name}</span>
        <input
          type="number"
          min={0}
          max={100}
          value={points[id]}
          onChange={(e) => setPoints((p) => ({ ...p, [id]: Number(e.target.value) }))}
          className="w-16 h-8 px-2 rounded-lg border-2 border-orange-200 text-center text-sm text-orange-900 font-semibold focus:outline-none focus:border-orange-600"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
        <div className="px-4 py-2.5 bg-orange-50 border-b border-orange-100">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Daily Activities</p>
        </div>
        {ACTIVITY_IDS.map((id, i) => renderRow(id, i, ACTIVITY_IDS.length))}
      </div>

      <div className="bg-white rounded-2xl border border-orange-200 overflow-hidden">
        <div className="px-4 py-2.5 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Bonus Activities</p>
        </div>
        {BONUS_ACTIVITY_IDS.map((id, i) => renderRow(id, i, BONUS_ACTIVITY_IDS.length))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-11 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
      >
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Points'}
      </button>
    </div>
  )
}
