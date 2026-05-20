'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { signInWithCustomToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { BapsLogo } from '@/components/baps-logo'

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

export default function LoginPage() {
  const { user, loading, loginWithGoogle } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [santoMode, setSantoMode] = useState(false)
  const [santoUsername, setSantoUsername] = useState('')
  const [santoPassword, setSantoPassword] = useState('')
  const [santoShowPassword, setSantoShowPassword] = useState(false)
  const [santoError, setSantoError] = useState('')
  const [santoLoading, setSantoLoading] = useState(false)
  // Ref tracks whether the ongoing sign-in is a santo login so we redirect to /admin
  const santoLoginRef = useRef(false)

  useEffect(() => {
    if (!loading && user) {
      window.location.href = santoLoginRef.current ? '/admin' : '/dashboard'
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

  async function handleSantoLogin(e: React.FormEvent) {
    e.preventDefault()
    setSantoLoading(true)
    setSantoError('')
    try {
      const res = await fetch('/api/auth/santo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: santoUsername, password: santoPassword }),
      })
      if (!res.ok) {
        setSantoError('Invalid credentials. Please try again.')
        setSantoLoading(false)
        return
      }
      const { token } = await res.json()
      santoLoginRef.current = true
      await signInWithCustomToken(auth, token)
    } catch {
      setSantoError('Login failed. Please try again.')
      setSantoLoading(false)
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
        {/* BAPS logo */}
        <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center mb-6 shadow-2xl ring-4 ring-white/20">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white flex items-center justify-center">
            <BapsLogo className="w-full h-full object-cover" />
          </div>
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

        {/* Santo's Login */}
        <div className="mt-6 pt-5 border-t border-orange-100">
          {!santoMode ? (
            <button
              onClick={() => setSantoMode(true)}
              className="w-full text-xs text-orange-300 hover:text-orange-500 transition-colors py-1"
            >
              Santo&apos;s Login
            </button>
          ) : (
            <form onSubmit={handleSantoLogin} className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-orange-700 text-center mb-1">Admin Login</p>
              <input
                type="text"
                placeholder="Username"
                value={santoUsername}
                onChange={e => setSantoUsername(e.target.value)}
                autoComplete="username"
                className="w-full h-11 px-4 rounded-xl border border-orange-200 text-sm text-orange-900 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50"
              />
              <div className="relative">
                <input
                  type={santoShowPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={santoPassword}
                  onChange={e => setSantoPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-orange-200 text-sm text-orange-900 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50"
                />
                <button
                  type="button"
                  onClick={() => setSantoShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600"
                >
                  {santoShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {santoError && (
                <p className="text-xs text-red-500 text-center">{santoError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setSantoMode(false); setSantoError('') }}
                  className="flex-1 h-10 rounded-xl border border-orange-200 text-sm text-orange-500 hover:bg-orange-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={santoLoading || !santoUsername || !santoPassword}
                  className="flex-1 h-10 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {santoLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {santoLoading ? 'Signing in…' : 'Sign In'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
