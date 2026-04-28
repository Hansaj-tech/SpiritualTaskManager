'use client'

import { useState } from 'react'
import { Plus, Trash2, ImageIcon } from 'lucide-react'
import { updateGuruImages, updateLoginImage } from '@/lib/firestore-helpers'

interface ImagesEditorProps {
  initialImages: string[]
  initialLoginImage?: string
}

export function ImagesEditor({ initialImages, initialLoginImage = '' }: ImagesEditorProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [newUrl, setNewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [loginImageUrl, setLoginImageUrl] = useState(initialLoginImage)
  const [savingLogin, setSavingLogin] = useState(false)
  const [savedLogin, setSavedLogin] = useState(false)

  function addImage() {
    const url = newUrl.trim()
    if (!url || images.includes(url)) return
    setImages((prev) => [...prev, url])
    setNewUrl('')
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSaveGuruImages() {
    setSaving(true)
    await updateGuruImages(images)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSaveLoginImage() {
    setSavingLogin(true)
    await updateLoginImage(loginImageUrl.trim())
    setSavingLogin(false)
    setSavedLogin(true)
    setTimeout(() => setSavedLogin(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Login Page Background Image ── */}
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-orange-50 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-orange-900">Login Page Image</h3>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <p className="text-xs text-orange-400">
            This image appears on the right side of the login screen (desktop). Paste a direct image URL of Mahant Swami Maharaj.
          </p>

          {/* Preview */}
          {loginImageUrl && (
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-orange-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={loginImageUrl}
                alt="Login preview"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
              />
              <div className="absolute bottom-1 right-1 text-xs bg-black/40 text-white px-2 py-0.5 rounded-full">
                Preview
              </div>
            </div>
          )}

          <input
            type="url"
            value={loginImageUrl}
            onChange={(e) => setLoginImageUrl(e.target.value)}
            placeholder="https://example.com/swami-maharaj.jpg"
            className="w-full h-10 px-3 rounded-xl border-2 border-orange-200 text-sm text-orange-900 focus:outline-none focus:border-orange-600"
          />

          <button
            onClick={handleSaveLoginImage}
            disabled={savingLogin || !loginImageUrl.trim()}
            className="h-10 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm"
          >
            {savedLogin ? '✓ Saved!' : savingLogin ? 'Saving…' : 'Save Login Image'}
          </button>
        </div>
      </div>

      {/* ── Dashboard Guru Carousel Images ── */}
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-orange-50">
          <h3 className="text-sm font-semibold text-orange-900">Dashboard Carousel Images</h3>
          <p className="text-xs text-orange-400 mt-0.5">Shown in the rotating carousel on the dashboard</p>
        </div>
        <div className="p-4 flex flex-col gap-3">
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

          {images.length > 0 ? (
            <div className="rounded-xl border border-orange-100 overflow-hidden">
              {images.map((url, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 border-b border-orange-50 last:border-0"
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
          ) : (
            <p className="text-sm text-orange-400 text-center py-3">
              No images added yet.
            </p>
          )}

          <button
            onClick={handleSaveGuruImages}
            disabled={saving}
            className="h-10 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60 text-sm"
          >
            {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save Carousel Images'}
          </button>
        </div>
      </div>

    </div>
  )
}
