'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { KSHETRA_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Loader2, Check } from 'lucide-react'

export function KshetraGrid() {
  const { userProfile, updateKshetra } = useAuth()
  const isChanging = !!userProfile?.kshetra
  const [selected, setSelected] = useState<string | null>(userProfile?.kshetra ?? null)
  const [saving, setSaving] = useState(false)

  async function handleContinue() {
    if (!selected) return
    setSaving(true)
    await updateKshetra(selected)
    window.location.href = '/dashboard'
  }

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-orange-900">Select Your Kshetra</h2>
        <p className="text-sm text-orange-500 mt-1">Choose your regional chapter</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3">
        {KSHETRA_OPTIONS.map((k) => (
          <button
            key={k}
            onClick={() => setSelected(k)}
            className={cn(
              'relative h-16 rounded-2xl border-2 font-bold text-base transition-all duration-200',
              'flex items-center justify-center',
              selected === k
                ? 'border-orange-600 bg-orange-600 text-white shadow-lg scale-[1.03]'
                : 'border-orange-100 bg-orange-50 text-orange-800 hover:border-orange-300 hover:bg-orange-100 active:scale-95'
            )}
          >
            {selected === k && (
              <span className="absolute top-1.5 right-1.5">
                <Check className="w-3 h-3 text-white/70" strokeWidth={3} />
              </span>
            )}
            {k}
          </button>
        ))}
      </div>

      {selected && (
        <p className="text-center text-sm text-orange-500">
          Selected: <span className="font-semibold text-orange-700">{selected}</span>
        </p>
      )}

      <button
        onClick={handleContinue}
        disabled={!selected || saving}
        className={cn(
          'w-full h-14 rounded-2xl font-bold text-base text-white transition-all',
          'bg-orange-600 hover:bg-orange-700 active:scale-[0.98]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
          'flex items-center justify-center gap-2 shadow-md'
        )}
      >
        {saving && <Loader2 className="w-5 h-5 animate-spin" />}
        {saving ? 'Saving…' : isChanging ? 'Save Kshetra' : 'Begin Journey'}
      </button>
    </div>
  )
}
