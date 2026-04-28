'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
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

function OmSymbol() {
  return (
    <svg viewBox="0 0 120 120" className="w-20 h-20 text-white opacity-90" fill="currentColor">
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="80" fontFamily="serif">ॐ</text>
    </svg>
  )
}

export default function LoginPage() {
  const { user, loading, loginWithGoogle } = useAuth()
  const [signingIn, setSigningIn] = useState(false)

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

  return (
    <div className="min-h-screen flex flex-col bg-orange-600">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Om symbol in circle */}
        <div className="w-28 h-28 rounded-full bg-white/15 flex items-center justify-center mb-6 shadow-2xl ring-4 ring-white/20">
          <OmSymbol />
        </div>

        {/* App name */}
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Aahanik</h1>
        <p className="text-orange-100 text-base text-center leading-relaxed">
          Daily Spiritual Practice Tracker
        </p>
        <p className="text-orange-200 text-sm mt-1">॥ Jai Swaminarayan ॥</p>

        {/* Decorative dots */}
        <div className="flex gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`rounded-full bg-white ${i === 1 ? 'w-6 h-2' : 'w-2 h-2 opacity-50'}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom card */}
      <div className="bg-white rounded-t-[2rem] px-6 pt-8 pb-10 shadow-2xl">
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
  )
}
