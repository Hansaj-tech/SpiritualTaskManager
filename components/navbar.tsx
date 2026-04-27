'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useRouter } from 'next/navigation'
import { LogOut, User, MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

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
    <header className="sticky top-0 z-40 bg-white border-b border-orange-100 shadow-sm">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo + title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-orange-900 text-lg tracking-tight">Aahanik</span>
        </div>

        {/* Avatar menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center',
                'bg-orange-100 text-orange-800 font-semibold text-sm',
                'hover:bg-orange-200 transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-orange-500'
              )}
            >
              {userProfile?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[180px] bg-white rounded-xl shadow-lg border border-orange-100 p-1 z-50"
              sideOffset={8}
              align="end"
            >
              {/* User info header */}
              <div className="px-3 py-2 border-b border-orange-50 mb-1">
                <p className="text-sm font-medium text-orange-900 truncate">
                  {userProfile?.displayName}
                </p>
                <p className="text-xs text-orange-500 truncate">{userProfile?.kshetra}</p>
              </div>

              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-orange-800 rounded-lg hover:bg-orange-50 cursor-pointer outline-none"
                onSelect={() => router.push('/profile')}
              >
                <User className="w-4 h-4" />
                Edit Profile
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-orange-800 rounded-lg hover:bg-orange-50 cursor-pointer outline-none"
                onSelect={() => router.push('/onboarding')}
              >
                <MapPin className="w-4 h-4" />
                Change Kshetra
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-orange-100 my-1" />

              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 cursor-pointer outline-none"
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
