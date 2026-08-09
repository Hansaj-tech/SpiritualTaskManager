'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, UploadCloud } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import {
  updateVanchanPortionText,
  useVanchanBook,
  useVanchanPortion,
  type VanchanActivityId,
} from '@/lib/vanchan'

const TEXTS: Array<{ id: VanchanActivityId; label: string }> = [
  { id: 'vachnamrut-vanchan', label: 'Vachanamrut' },
  { id: 'swamini-vato-vanchan', label: 'Swamini Vato' },
]

export function VanchanUploadForm() {
  const [activityId, setActivityId] = useState<VanchanActivityId>('vachnamrut-vanchan')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {TEXTS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActivityId(t.id)}
            className={
              t.id === activityId
                ? 'flex-1 h-10 rounded-xl text-sm font-semibold bg-orange-600 text-white transition-colors'
                : 'flex-1 h-10 rounded-xl text-sm font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors'
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <UploadPanel activityId={activityId} />
      <PortionBrowser activityId={activityId} />
    </div>
  )
}

function UploadPanel({ activityId }: { activityId: VanchanActivityId }) {
  const { user } = useAuth()
  const { book, loading } = useVanchanBook(activityId)
  const [title, setTitle] = useState('')
  const [wordsPerPortion, setWordsPerPortion] = useState(900)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!user || !file || !title.trim()) return
    setUploading(true)
    setStatus(null)
    try {
      const idToken = await user.getIdToken()
      const form = new FormData()
      form.set('activityId', activityId)
      form.set('title', title.trim())
      form.set('wordsPerPortion', String(wordsPerPortion))
      form.set('file', file)

      const res = await fetch('/api/admin/vanchan-upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')

      setStatus(`Split into ${data.totalPortions} daily portions.`)
      setTitle('')
      setFile(null)
    } catch (error) {
      console.error('Error uploading vanchan book:', error)
      setStatus('Something went wrong — please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-5 flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-orange-900">Current book</p>
        {loading ? (
          <p className="text-sm text-orange-300 mt-1">Loading…</p>
        ) : book ? (
          <p className="text-sm text-orange-500 mt-1">
            {book.title} · {book.totalPortions} portions · from {book.sourceFileName}
          </p>
        ) : (
          <p className="text-sm text-orange-300 mt-1">Nothing uploaded yet.</p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-orange-900">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Vachanamrut — full edition"
            className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-white text-sm text-orange-900 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-orange-900">Words per daily portion</label>
          <input
            type="number"
            min={100}
            value={wordsPerPortion}
            onChange={(e) => setWordsPerPortion(Number(e.target.value) || 900)}
            className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-white text-sm text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <p className="text-xs text-orange-400">A rough length target — the split snaps to the nearest sentence end.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-orange-900">PDF file</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-orange-700 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-orange-100 file:text-orange-700 file:text-sm file:font-medium hover:file:bg-orange-200"
          />
        </div>
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading || !file || !title.trim()}
        className="self-start flex items-center gap-2 h-11 px-5 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
      >
        <UploadCloud className="w-4 h-4" />
        {uploading ? 'Uploading…' : 'Upload & Split'}
      </button>

      {status && <p className="text-sm text-orange-500">{status}</p>}
      <p className="text-xs text-orange-300">Uploading a new file replaces this text's existing daily portions.</p>
    </div>
  )
}

function PortionBrowser({ activityId }: { activityId: VanchanActivityId }) {
  const { book } = useVanchanBook(activityId)
  const [index, setIndex] = useState(0)
  const { text, loading } = useVanchanPortion(activityId, book ? index : null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  if (!book) return null

  const startEditing = () => {
    setDraft(text ?? '')
    setDirty(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateVanchanPortionText(activityId, index, draft)
      setDirty(false)
    } catch (error) {
      console.error('Error saving portion:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-orange-900">Review & edit portions</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index <= 0}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-orange-500 hover:bg-orange-50 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-orange-400 tabular-nums">
            {index + 1} / {book.totalPortions}
          </span>
          <button
            onClick={() => setIndex((i) => Math.min(book.totalPortions - 1, i + 1))}
            disabled={index >= book.totalPortions - 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-orange-500 hover:bg-orange-50 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-orange-300">Loading…</p>
      ) : (
        <textarea
          value={draft || text || ''}
          onFocus={startEditing}
          onChange={(e) => {
            setDraft(e.target.value)
            setDirty(true)
          }}
          rows={8}
          className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-orange-50/40 text-sm text-orange-900 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      )}

      {dirty && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="self-start h-9 px-4 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save this portion'}
        </button>
      )}
    </div>
  )
}
