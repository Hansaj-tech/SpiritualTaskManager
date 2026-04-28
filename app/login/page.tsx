'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getAppConfig } from '@/lib/firestore-helpers'
import { BapsLogo } from '@/components/baps-logo'
import { Loader2 } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function getRotatingIndex(count: number): number {
  if (count === 0) return 0
  const intervalMs = 3 * 60 * 60 * 1000 // 3 hours
  return Math.floor(Date.now() / intervalMs) % count
}

export default function LoginPage() {
  const { user, loading, loginWithGoogle } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [loginImages, setLoginImages] = useState<string[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [prevIdx, setPrevIdx] = useState<number | null>(null)
  const [fading, setFading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    getAppConfig().then((cfg) => {
      const imgs = cfg.loginImages ?? []
      setLoginImages(imgs)
      setActiveIdx(getRotatingIndex(imgs.length))
    })
  }, [])

  // Check every minute if the 3-hour slot changed → crossfade
  useEffect(() => {
    if (loginImages.length <= 1) return
    intervalRef.current = setInterval(() => {
      const next = getRotatingIndex(loginImages.length)
      setActiveIdx((cur) => {
        if (next !== cur) {
          setPrevIdx(cur)
          setFading(true)
          setTimeout(() => {
            setPrevIdx(null)
            setFading(false)
          }, 800)
          return next
        }
        return cur
      })
    }, 60_000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [loginImages])

  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/dashboard'
    }
  }, [user, loading])

  async function handleLogin() {
    setSigningIn(true)
    try {
      await loginWithGoogle()
    } catch {
      setSigningIn(false)
    }
  }

  if (loading || (user && !loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-600">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  const currentImage = loginImages[activeIdx] ?? null
  const previousImage = prevIdx !== null ? loginImages[prevIdx] : null

  return (
    <div className="min-h-screen relative flex flex-col md:flex-row overflow-hidden">

      {/* ── Background image layer (mobile only) ── */}
      <div className="absolute inset-0 md:hidden">
        {currentImage ? (
          <>
            {/* Previous image fading out */}
            {previousImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previousImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.8s ease' }}
              />
            )}
            {/* Current image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt="Mahant Swami Maharaj"
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ opacity: 1 }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600" />
        )}
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />
      </div>

      {/* ── Left panel — saffron brand + login form ── */}
      <div className="relative z-10 flex flex-col md:bg-orange-600 md:w-[420px] md:min-h-screen md:flex-shrink-0">

        {/* Top brand section (mobile: floating over image; desktop: in saffron panel) */}
        <div className="flex flex-col items-center justify-center flex-1 px-8 pt-16 pb-4 md:pt-14 md:pb-8">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/15 flex items-center justify-center mb-5 shadow-2xl ring-4 ring-white/20 p-4">
            <BapsLogo className="w-full h-full" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2 drop-shadow-lg">Aahanik</h1>
          <p className="text-white/90 text-base text-center leading-relaxed drop-shadow">
            Daily Spiritual Practice Tracker
          </p>
          <p className="text-white/70 text-sm mt-1 drop-shadow">॥ Jai Swaminarayan ॥</p>

          {loginImages.length > 1 && (
            <div className="flex gap-1.5 mt-6">
              {loginImages.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full bg-white transition-all duration-500 ${
                    i === activeIdx ? 'w-5 h-2 opacity-100' : 'w-2 h-2 opacity-40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Login card — white rounded panel */}
        <div className="bg-white rounded-t-[2rem] md:rounded-none md:rounded-tr-[2rem] px-6 pt-8 pb-safe-10 pb-10 shadow-2xl">
          <p className="text-center text-orange-900 font-semibold text-lg mb-1">
            Begin Your Practice
          </p>
          <p className="text-center text-orange-400 text-sm mb-8">
            Track your 10 daily spiritual activities
          </p>

          <button
            onClick={handleLogin}
            disabled={signingIn}
            className="w-full h-14 flex items-center justify-center gap-3 bg-white border-2 border-orange-200 rounded-2xl text-orange-900 font-semibold text-base hover:bg-orange-50 hover:border-orange-400 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {signingIn ? (
              <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
            ) : (
              <GoogleIcon />
            )}
            {signingIn ? 'Signing in…' : 'Continue with Google'}
          </button>

          <p className="text-xs text-orange-300 text-center mt-5 leading-relaxed">
            By continuing, you agree to track your<br />daily spiritual activities with devotion
          </p>
        </div>
      </div>

      {/* ── Right panel — rotating image (desktop only) ── */}
      <div className="hidden md:block flex-1 relative overflow-hidden">
        {previousImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previousImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.8s ease' }}
          />
        )}
        {currentImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentImage}
            alt="Mahant Swami Maharaj"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 flex flex-col items-center justify-center gap-6">
            <BapsLogo className="w-40 h-40 opacity-30" />
            <p className="text-white/50 text-sm font-medium text-center px-8">
              Set login images from<br />Admin → Settings → Images
            </p>
          </div>
        )}
        {currentImage && (
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-transparent to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  )
}
