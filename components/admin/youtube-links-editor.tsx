'use client'

import { useState } from 'react'
import { updateActivityYoutubeLinks } from '@/lib/firestore-helpers'
import type { ActivityDefinition } from '@/types'

const EXCLUDED_IDS = new Set(['vachnamrut-vanchan', 'swamini-vato-vanchan'])

interface YouTubeLinksEditorProps {
  activityDefs: ActivityDefinition[]
  initialLinks?: Record<string, string>
}

export function YouTubeLinksEditor({ activityDefs, initialLinks }: YouTubeLinksEditorProps) {
  const eligibleDefs = activityDefs.filter((a) => !EXCLUDED_IDS.has(a.id))
  const [links, setLinks] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const a of eligibleDefs) {
      init[a.id] = initialLinks?.[a.id] ?? ''
    }
    return init
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    const cleaned: Record<string, string> = {}
    for (const [id, url] of Object.entries(links)) {
      if (url.trim()) cleaned[id] = url.trim()
    }
    await updateActivityYoutubeLinks(cleaned)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-orange-100 p-4 flex flex-col gap-4">
        <p className="text-xs text-orange-400">
          Add a YouTube link for each activity. A play button will appear next to the activity on the dashboard. Leave blank to hide the play button.
        </p>
        {eligibleDefs.map((a) => (
          <div key={a.id}>
            <label className="text-sm font-medium text-orange-900 mb-1.5 block">{a.name}</label>
            <input
              type="url"
              value={links[a.id] ?? ''}
              onChange={(e) => setLinks((prev) => ({ ...prev, [a.id]: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full h-10 px-3 rounded-xl border-2 border-orange-200 text-orange-900 text-sm bg-white focus:outline-none focus:border-orange-600 placeholder:text-orange-300"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-11 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
      >
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save YouTube Links'}
      </button>
    </div>
  )
}
