'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { updateGuruImages } from '@/lib/firestore-helpers'

interface ImagesEditorProps {
  initialImages: string[]
}

export function ImagesEditor({ initialImages }: ImagesEditorProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [newUrl, setNewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function addImage() {
    const url = newUrl.trim()
    if (!url || images.includes(url)) return
    setImages((prev) => [...prev, url])
    setNewUrl('')
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    await updateGuruImages(images)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Add new image */}
      <div className="bg-white rounded-2xl border border-orange-100 p-4">
        <label className="text-sm font-medium text-orange-900 mb-2 block">Add Guru Image URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addImage()}
            placeholder="https://example.com/image.jpg"
            className="flex-1 h-10 px-3 rounded-xl border-2 border-orange-200 text-sm text-orange-900 focus:outline-none focus:border-orange-600"
          />
          <button
            onClick={addImage}
            disabled={!newUrl.trim()}
            className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center hover:bg-orange-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image list */}
      {images.length > 0 && (
        <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
          {images.map((url, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 border-b border-orange-50 last:border-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Guru ${i + 1}`}
                className="w-10 h-10 rounded-lg object-cover bg-orange-100 flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <p className="flex-1 text-xs text-orange-600 truncate">{url}</p>
              <button
                onClick={() => removeImage(i)}
                className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-sm text-orange-400 text-center py-4">
          No images added yet. Add CDN-hosted image URLs above.
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-11 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
      >
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Images'}
      </button>
    </div>
  )
}
