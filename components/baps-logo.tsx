'use client'

import { useState } from 'react'

interface BapsLogoProps {
  className?: string
}

export function BapsLogo({ className = 'w-12 h-12' }: BapsLogoProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={`flex items-center justify-center font-black text-orange-600 ${className}`}>
        BAPS
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/baps-logo.png"
      alt="BAPS"
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  )
}
