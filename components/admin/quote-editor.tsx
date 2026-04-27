'use client'

import { useState } from 'react'
import { updateDailyQuote } from '@/lib/firestore-helpers'

interface QuoteEditorProps {
  initialQuote: string
}

export function QuoteEditor({ initialQuote }: QuoteEditorProps) {
  const [quote, setQuote] = useState(initialQuote)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await updateDailyQuote(quote.trim())
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-orange-100 p-4">
        <label className="text-sm font-medium text-orange-900 mb-2 block">Daily Quote</label>
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          rows={4}
          placeholder="Enter today's spiritual quote..."
          className="w-full px-3 py-2 rounded-xl border-2 border-orange-200 text-orange-900 text-sm resize-none focus:outline-none focus:border-orange-600"
        />
        <p className="text-xs text-orange-400 mt-1">
          This quote appears on the dashboard for all users.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-11 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
      >
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Update Quote'}
      </button>
    </div>
  )
}
