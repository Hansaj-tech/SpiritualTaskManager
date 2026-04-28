'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

export function ProfileForm() {
  const { userProfile, updateProfile } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState(userProfile?.displayName ?? '')
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await updateProfile({
      displayName: displayName.trim() || undefined,
      photoURL: photoURL.trim() || null,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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

      {/* Email (read-only) */}
      <div>
        <label className="text-sm font-medium text-orange-900 mb-1.5 block">Email</label>
        <div className="h-11 px-4 rounded-xl border-2 border-orange-100 bg-orange-50 flex items-center text-sm text-orange-400">
          {userProfile?.email}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={cn(
          'w-full h-12 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2',
          saved
            ? 'bg-green-500'
            : 'bg-orange-600 hover:bg-orange-700 active:scale-95',
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
