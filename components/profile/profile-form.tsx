'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { KSHETRA_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function ProfileForm() {
  const { userProfile, updateProfile, updateKshetra } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const router = useRouter()
  const [displayName, setDisplayName] = useState(userProfile?.displayName ?? '')
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL ?? '')
  const [selectedKshetra, setSelectedKshetra] = useState<string | null>(userProfile?.kshetra ?? null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await updateProfile({
      displayName: displayName.trim() || undefined,
      photoURL: photoURL.trim() || null,
    })
    if (selectedKshetra && selectedKshetra !== userProfile?.kshetra) {
      await updateKshetra(selectedKshetra)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-5">
      {/* Avatar preview */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-stone-700 overflow-hidden flex items-center justify-center">
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
        <label className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1.5 block">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          className="w-full h-11 px-4 rounded-xl border-2 border-orange-200 dark:border-stone-600 text-orange-900 dark:text-orange-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-orange-600 text-sm placeholder:text-orange-300 dark:placeholder:text-stone-500"
        />
      </div>

      {/* Photo URL */}
      <div>
        <label className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1.5 block">
          Photo URL <span className="text-orange-400 font-normal">(optional)</span>
        </label>
        <input
          type="url"
          value={photoURL}
          onChange={(e) => setPhotoURL(e.target.value)}
          placeholder="https://example.com/photo.jpg"
          className="w-full h-11 px-4 rounded-xl border-2 border-orange-200 dark:border-stone-600 text-orange-900 dark:text-orange-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-orange-600 text-sm placeholder:text-orange-300 dark:placeholder:text-stone-500"
        />
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1.5 block">Email</label>
        <div className="h-11 px-4 rounded-xl border-2 border-orange-100 dark:border-stone-700 bg-orange-50 dark:bg-stone-800 flex items-center text-sm text-orange-400 dark:text-stone-500">
          {userProfile?.email}
        </div>
      </div>

      {/* Kshetra */}
      <div>
        <label className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2 block">Kshetra</label>
        <div className="grid grid-cols-4 gap-2">
          {KSHETRA_OPTIONS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setSelectedKshetra(k)}
              className={cn(
                'relative h-11 rounded-xl border-2 font-semibold text-sm transition-all',
                'flex items-center justify-center',
                selectedKshetra === k
                  ? 'border-orange-600 bg-orange-600 text-white shadow-md'
                  : 'border-orange-100 dark:border-stone-600 bg-orange-50 dark:bg-stone-800 text-orange-800 dark:text-orange-200 hover:border-orange-300 dark:hover:border-stone-500'
              )}
            >
              {selectedKshetra === k && (
                <span className="absolute top-1 right-1">
                  <Check className="w-2.5 h-2.5 text-white/70" strokeWidth={3} />
                </span>
              )}
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Dark mode toggle */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2.5">
          {isDark
            ? <Moon className="w-4 h-4 text-orange-400" />
            : <Sun className="w-4 h-4 text-orange-400" />}
          <div>
            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Dark Mode</p>
            <p className="text-xs text-orange-400">{isDark ? 'On' : 'Off'}</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          onClick={toggleTheme}
          className={cn(
            'relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none',
            isDark ? 'bg-orange-600' : 'bg-orange-200'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
              isDark && 'translate-x-5'
            )}
          />
        </button>
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
