'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export default function LoginPage() {
  const { user, loading, loginWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-6">
      {/* Logo area */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 rounded-3xl bg-orange-600 flex items-center justify-center shadow-xl mb-5">
          <span className="text-5xl font-bold text-white">A</span>
        </div>
        <h1 className="text-3xl font-bold text-orange-900 tracking-tight">Aahanik</h1>
        <p className="text-orange-500 mt-1 text-center text-sm leading-relaxed">
          Your daily spiritual companion
          <br />
          <span className="text-orange-400">Jai Swaminarayan 🙏</span>
        </p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-center text-base font-semibold text-orange-900 mb-6">
          Sign in to continue
        </h2>

        <button
          onClick={loginWithGoogle}
          className="w-full h-12 flex items-center justify-center gap-3 bg-white border-2 border-orange-200 rounded-xl text-orange-900 font-medium hover:bg-orange-50 hover:border-orange-400 transition-all active:scale-95"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="text-xs text-orange-400 text-center mt-4 leading-relaxed">
          By continuing, you agree to track your daily spiritual activities
        </p>
      </div>
    </div>
  )
}
