'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useRouter } from 'next/navigation'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { BapsLogo } from '@/components/baps-logo'

export function Navbar() {
  const { userProfile, logout } = useAuth()
  const router = useRouter()

  const initials = (userProfile?.displayName ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm border-b border-orange-100 dark:border-stone-700">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-stone-800 border border-orange-100 dark:border-stone-700 flex items-center justify-center shadow-sm p-0.5">
            <BapsLogo className="w-full h-full" />
          </div>
          <span className="font-bold text-orange-900 dark:text-orange-50 text-lg tracking-tight">Aahanik</span>
        </div>

        {/* Avatar menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1.5 rounded-xl px-1 py-1 hover:bg-orange-50 dark:hover:bg-stone-800 transition-colors outline-none group">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-stone-700 overflow-hidden flex items-center justify-center text-orange-800 dark:text-orange-200 font-bold text-sm ring-2 ring-orange-200 dark:ring-stone-600 group-hover:ring-orange-300 dark:group-hover:ring-stone-500 transition-all">
                {userProfile?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-orange-400 group-hover:text-orange-600 transition-colors" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-orange-100 dark:border-stone-700 p-1.5 z-50"
              sideOffset={8}
              align="end"
            >
              {/* User info */}
              <div className="px-3 py-3 border-b border-orange-50 dark:border-stone-800 mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-stone-700 overflow-hidden flex items-center justify-center text-orange-800 dark:text-orange-200 font-bold text-sm flex-shrink-0">
                    {userProfile?.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-50 truncate">
                      {userProfile?.displayName}
                    </p>
                    <p className="text-xs text-orange-400 truncate">{userProfile?.kshetra}</p>
                  </div>
                </div>
              </div>

              <DropdownMenu.Item
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-orange-800 dark:text-orange-200 rounded-xl hover:bg-orange-50 dark:hover:bg-stone-800 cursor-pointer outline-none transition-colors"
                onSelect={() => router.push('/profile')}
              >
                <User className="w-4 h-4 text-orange-500" />
                Edit Profile
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-orange-100 dark:bg-stone-700 my-1" />

              <DropdownMenu.Item
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 rounded-xl hover:bg-red-50 cursor-pointer outline-none transition-colors"
                onSelect={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
