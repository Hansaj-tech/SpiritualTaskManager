'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { KSHETRA_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export function KshetraGrid() {
  const { updateKshetra } = useAuth()
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleContinue() {
    if (!selected) return
    setSaving(true)
    await updateKshetra(selected)
    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-900">Select Your Kshetra</h2>
        <p className="text-sm text-orange-500 mt-1">Choose your regional chapter</p>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-3 gap-3">
        {KSHETRA_OPTIONS.map((k) => (
          <button
            key={k}
            onClick={() => setSelected(k)}
            className={cn(
              'h-14 rounded-xl border-2 font-semibold text-base transition-all',
              selected === k
                ? 'border-orange-600 bg-orange-600 text-white shadow-md'
                : 'border-orange-200 bg-white text-orange-800 hover:border-orange-400 hover:bg-orange-50'
            )}
          >
            {k}
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected || saving}
        className={cn(
          'w-full h-12 rounded-xl font-semibold text-white transition-all',
          'bg-orange-600 hover:bg-orange-700 active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          'flex items-center justify-center gap-2'
        )}
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        Continue
      </button>
    </div>
  )
}
