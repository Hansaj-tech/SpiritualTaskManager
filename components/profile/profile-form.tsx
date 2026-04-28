'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { KSHETRA_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function ProfileForm() {
  const { userProfile, updateProfile, updateKshetra } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState(userProfile?.displayName ?? '')
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL ?? '')
  const [kshetra, setKshetra] = useState<string>(userProfile?.kshetra ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setError(null)
    setSaving(true)
    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        photoURL: photoURL.trim() || null,
      })
      if (kshetra && kshetra !== userProfile?.kshetra) {
        await updateKshetra(kshetra)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error('Profile save error:', e)
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-5">
      {/* Avatar preview */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-orange-100 overflow-hidden flex items-center justify-center">
          {photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-orange-600">
              {(displayName || 'U')[0].toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Display name */}
      <div>
        <label className="text-sm font-medium text-orange-900 mb-1.5 block">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          className="w-full h-11 px-4 rounded-xl border-2 border-orange-200 text-orange-900 bg-white focus:outline-none focus:border-orange-600 text-sm"
        />
      </div>

      {/* Photo URL */}
      <div>
        <label className="text-sm font-medium text-orange-900 mb-1.5 block">
          Photo URL <span className="text-orange-400 font-normal">(optional)</span>
        </label>
        <input
          type="url"
          value={photoURL}
          onChange={(e) => setPhotoURL(e.target.value)}
          placeholder="https://example.com/photo.jpg"
          className="w-full h-11 px-4 rounded-xl border-2 border-orange-200 text-orange-900 bg-white focus:outline-none focus:border-orange-600 text-sm"
        />
      </div>

      {/* Kshetra */}
      <div>
        <label className="text-sm font-medium text-orange-900 mb-2 block">Kshetra</label>
        <div className="grid grid-cols-4 gap-2">
          {KSHETRA_OPTIONS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKshetra(k)}
              className={cn(
                'h-10 rounded-xl border-2 font-semibold text-sm transition-all',
                kshetra === k
                  ? 'border-orange-600 bg-orange-600 text-white shadow-md'
                  : 'border-orange-100 bg-orange-50 text-orange-700 hover:border-orange-300'
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="text-sm font-medium text-orange-900 mb-1.5 block">Email</label>
        <div className="h-11 px-4 rounded-xl border-2 border-orange-100 bg-orange-50 flex items-center text-sm text-orange-400">
          {userProfile?.email}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className={cn(
          'w-full h-12 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2',
          saved ? 'bg-green-500' : 'bg-orange-600 hover:bg-orange-700 active:scale-95',
          'disabled:opacity-60 disabled:active:scale-100'
        )}
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saved ? 'Saved!' : 'Save Changes'}
      </button>

      <button
        onClick={() => router.back()}
        className="text-sm text-orange-500 hover:text-orange-700 text-center"
      >
        Cancel
      </button>
    </div>
  )
}
