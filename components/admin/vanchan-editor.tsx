'use client'

import { useState } from 'react'
import { updateThisWeeksVanchan } from '@/lib/firestore-helpers'
import type { ThisWeeksVanchan } from '@/types'

interface VanchanEditorProps {
  initialVanchan?: ThisWeeksVanchan
}

export function VanchanEditor({ initialVanchan }: VanchanEditorProps) {
  const [vachnamrut, setVachnamrut] = useState(initialVanchan?.vachnamrut ?? '')
  const [vachnamrutLink, setVachnamrutLink] = useState(initialVanchan?.vachnamrutLink ?? '')
  const [swaminiVato, setSwaminiVato] = useState(initialVanchan?.swaminiVato ?? '')
  const [swaminiVatoLink, setSwaminiVatoLink] = useState(initialVanchan?.swaminiVatoLink ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await updateThisWeeksVanchan({ vachnamrut: vachnamrut.trim(), swaminiVato: swaminiVato.trim(), vachnamrutLink: vachnamrutLink.trim(), swaminiVatoLink: swaminiVatoLink.trim() })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-orange-100 p-4 flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-orange-900 mb-2 block">
            Vachanamrut Vanchan
          </label>
          <textarea
            value={vachnamrut}
            onChange={(e) => setVachnamrut(e.target.value)}
            rows={5}
            placeholder="Enter this week's Vachanamrut passage..."
            className="w-full px-3 py-2 rounded-xl border-2 border-orange-200 text-orange-900 text-sm resize-none focus:outline-none focus:border-orange-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-orange-900 mb-2 block">
            Vachanamrut Vanchan Link
          </label>
          <input
            type="url"
            value={vachnamrutLink}
            onChange={(e) => setVachnamrutLink(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-xl border-2 border-orange-200 text-orange-900 text-sm focus:outline-none focus:border-orange-600"
          />
          <p className="text-xs text-orange-400 mt-1">Optional — users will see a &quot;Read&quot; button that opens this link.</p>
        </div>

        <div>
          <label className="text-sm font-medium text-orange-900 mb-2 block">
            Swamini Vato Nu Vanchan
          </label>
          <textarea
            value={swaminiVato}
            onChange={(e) => setSwaminiVato(e.target.value)}
            rows={5}
            placeholder="Enter this week's Swamini Vato passage..."
            className="w-full px-3 py-2 rounded-xl border-2 border-orange-200 text-orange-900 text-sm resize-none focus:outline-none focus:border-orange-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-orange-900 mb-2 block">
            Swamini Vato Nu Vanchan Link
          </label>
          <input
            type="url"
            value={swaminiVatoLink}
            onChange={(e) => setSwaminiVatoLink(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-xl border-2 border-orange-200 text-orange-900 text-sm focus:outline-none focus:border-orange-600"
          />
          <p className="text-xs text-orange-400 mt-1">Optional — users will see a &quot;Read&quot; button that opens this link.</p>
        </div>

        <p className="text-xs text-orange-400">
          These passages are shown as expandable dropdowns on the dashboard for each activity.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-11 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
      >
        {saved ? 'Saved!' : saving ? 'Saving…' : "Update This Week's Vanchan"}
      </button>
    </div>
  )
}
