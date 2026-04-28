'use client'

import { useState } from 'react'
import { Plus, Trash2, ImageIcon, Monitor } from 'lucide-react'
import { updateGuruImages, updateLoginImages } from '@/lib/firestore-helpers'

interface ImagesEditorProps {
  initialImages: string[]
  initialLoginImage?: string   // backward compat - single string
  initialLoginImages?: string[]
}

export function ImagesEditor({ initialImages, initialLoginImage, initialLoginImages }: ImagesEditorProps) {
  // Carousel (dashboard)
  const [carouselImages, setCarouselImages] = useState<string[]>(initialImages)
  const [newCarouselUrl, setNewCarouselUrl] = useState('')
  const [savingCarousel, setSavingCarousel] = useState(false)
  const [savedCarousel, setSavedCarousel] = useState(false)

  // Login rotating images
  const initLogin = initialLoginImages?.length
    ? initialLoginImages
    : initialLoginImage
    ? [initialLoginImage]
    : []
  const [loginImages, setLoginImages] = useState<string[]>(initLogin)
  const [newLoginUrl, setNewLoginUrl] = useState('')
  const [savingLogin, setSavingLogin] = useState(false)
  const [savedLogin, setSavedLogin] = useState(false)

  function addCarousel() {
    const url = newCarouselUrl.trim()
    if (!url || carouselImages.includes(url)) return
    setCarouselImages((p) => [...p, url])
    setNewCarouselUrl('')
  }

  function addLogin() {
    const url = newLoginUrl.trim()
    if (!url || loginImages.includes(url)) return
    setLoginImages((p) => [...p, url])
    setNewLoginUrl('')
  }

  async function handleSaveCarousel() {
    setSavingCarousel(true)
    await updateGuruImages(carouselImages)
    setSavingCarousel(false)
    setSavedCarousel(true)
    setTimeout(() => setSavedCarousel(false), 2000)
  }

  async function handleSaveLogin() {
    setSavingLogin(true)
    await updateLoginImages(loginImages)
    setSavingLogin(false)
    setSavedLogin(true)
    setTimeout(() => setSavedLogin(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Login Page Rotating Images ── */}
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-orange-50 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-orange-500" />
          <div>
            <h3 className="text-sm font-semibold text-orange-900">Login Page Images</h3>
            <p className="text-xs text-orange-400">Rotates every 3 hours — add multiple images of Mahant Swami Maharaj</p>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {/* Add URL */}
          <div className="flex gap-2">
            <input
              type="url"
              value={newLoginUrl}
              onChange={(e) => setNewLoginUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLogin()}
              placeholder="https://example.com/swami-maharaj.jpg"
              className="flex-1 h-10 px-3 rounded-xl border-2 border-orange-200 text-sm text-orange-900 focus:outline-none focus:border-orange-600"
            />
            <button
              onClick={addLogin}
              disabled={!newLoginUrl.trim()}
              className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center hover:bg-orange-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Image list with preview */}
          {loginImages.length > 0 ? (
            <div className="flex flex-col gap-2">
              {loginImages.map((url, i) => (
                <div key={i} className="flex items-center gap-3 bg-orange-50 rounded-xl p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Login ${i + 1}`}
                    className="w-16 h-12 rounded-lg object-cover bg-orange-100 flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-orange-600 truncate">{url}</p>
                    <p className="text-xs text-orange-400 mt-0.5">Image {i + 1} of {loginImages.length}</p>
                  </div>
                  <button
                    onClick={() => setLoginImages((p) => p.filter((_, j) => j !== i))}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-orange-400 text-center py-2">
              No images added — add image URLs above.
            </p>
          )}

          <button
            onClick={handleSaveLogin}
            disabled={savingLogin || loginImages.length === 0}
            className="h-10 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm"
          >
            {savedLogin ? '✓ Saved!' : savingLogin ? 'Saving…' : `Save Login Images (${loginImages.length})`}
          </button>
        </div>
      </div>

      {/* ── Dashboard Carousel Images ── */}
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-orange-50 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-orange-500" />
          <div>
            <h3 className="text-sm font-semibold text-orange-900">Dashboard Carousel Images</h3>
            <p className="text-xs text-orange-400">Rotating carousel shown at the top of the dashboard</p>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={newCarouselUrl}
              onChange={(e) => setNewCarouselUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCarousel()}
              placeholder="https://example.com/image.jpg"
              className="flex-1 h-10 px-3 rounded-xl border-2 border-orange-200 text-sm text-orange-900 focus:outline-none focus:border-orange-600"
            />
            <button
              onClick={addCarousel}
              disabled={!newCarouselUrl.trim()}
              className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center hover:bg-orange-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {carouselImages.length > 0 ? (
            <div className="rounded-xl border border-orange-100 overflow-hidden">
              {carouselImages.map((url, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 border-b border-orange-50 last:border-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover bg-orange-100 flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <p className="flex-1 text-xs text-orange-600 truncate">{url}</p>
                  <button onClick={() => setCarouselImages((p) => p.filter((_, j) => j !== i))}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-orange-400 text-center py-2">No images added yet.</p>
          )}

          <button onClick={handleSaveCarousel} disabled={savingCarousel}
            className="h-10 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60 text-sm">
            {savedCarousel ? '✓ Saved!' : savingCarousel ? 'Saving…' : 'Save Carousel Images'}
          </button>
        </div>
      </div>
    </div>
  )
}
