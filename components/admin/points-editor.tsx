'use client'

import { useState } from 'react'
import { updateActivities } from '@/lib/firestore-helpers'
import { ACTIVITY_IDS, BONUS_ACTIVITY_IDS, DEFAULT_ACTIVITIES } from '@/lib/constants'
import type { ActivityDefinition, ActivityId } from '@/types'

interface PointsEditorProps {
  activityDefs: ActivityDefinition[]
}

export function PointsEditor({ activityDefs }: PointsEditorProps) {
  const [values, setValues] = useState<Record<string, { name: string; points: number }>>(() => {
    const init: Record<string, { name: string; points: number }> = {}
    for (const id of [...ACTIVITY_IDS, ...BONUS_ACTIVITY_IDS]) {
      const def = activityDefs.find((a) => a.id === id)
      init[id] = {
        name: def?.name ?? DEFAULT_ACTIVITIES[id as ActivityId].name,
        points: def?.points ?? DEFAULT_ACTIVITIES[id as ActivityId].points,
      }
    }
    return init
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await updateActivities(values)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function setName(id: string, name: string) {
    setValues(v => ({ ...v, [id]: { ...v[id], name } }))
  }

  function setPoints(id: string, points: number) {
    setValues(v => ({ ...v, [id]: { ...v[id], points } }))
  }

  function renderRow(id: string, editable: boolean, index: number, total: number) {
    return (
      <div
        key={id}
        className={`flex items-center gap-3 px-4 py-3 ${index < total - 1 ? 'border-b border-orange-50' : ''}`}
      >
        {editable ? (
          <input
            type="text"
            value={values[id]?.name ?? ''}
            onChange={(e) => setName(id, e.target.value)}
            className="flex-1 h-8 px-2 rounded-lg border-2 border-orange-200 text-sm text-orange-900 font-medium focus:outline-none focus:border-orange-600 bg-white"
          />
        ) : (
          <span className="text-sm text-orange-900 flex-1">{values[id]?.name}</span>
        )}
        <input
          type="number"
          min={0}
          max={100}
          value={values[id]?.points ?? 0}
          onChange={(e) => setPoints(id, Number(e.target.value))}
          className="w-16 h-8 px-2 rounded-lg border-2 border-orange-200 text-center text-sm text-orange-900 font-semibold focus:outline-none focus:border-orange-600 flex-shrink-0"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Column headers */}
      <div className="flex items-center gap-3 px-4">
        <span className="flex-1 text-xs font-semibold text-orange-400 uppercase tracking-wide">Activity Name</span>
        <span className="w-16 text-center text-xs font-semibold text-orange-400 uppercase tracking-wide">Pts</span>
      </div>

      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
        <div className="px-4 py-2.5 bg-orange-50 border-b border-orange-100">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Daily Activities</p>
        </div>
        {ACTIVITY_IDS.map((id, i) => renderRow(id, false, i, ACTIVITY_IDS.length))}
      </div>

      <div className="bg-white rounded-2xl border border-orange-200 overflow-hidden">
        <div className="px-4 py-2.5 bg-orange-50 border-b border-orange-100">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Bonus Rajipo — names editable</p>
        </div>
        {BONUS_ACTIVITY_IDS.map((id, i) => renderRow(id, true, i, BONUS_ACTIVITY_IDS.length))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-11 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
      >
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}
