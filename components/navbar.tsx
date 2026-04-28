'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { BapsLogo } from '@/components/baps-logo'

const itemCls = 'flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl cursor-pointer outline-none transition-colors'

export function Navbar() {
  const { userProfile, logout } = useAuth()

  const initials = (userProfile?.displayName ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  async function handleLogout() {
    await logout()
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-orange-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-orange-100 flex items-center justify-center shadow-sm p-0.5">
            <BapsLogo className="w-full h-full" />
          </div>
          <span className="font-bold text-orange-900 text-lg tracking-tight">Aahanik</span>
        </div>

        {/* Avatar menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1.5 rounded-xl px-1 py-1 hover:bg-orange-50 transition-colors outline-none group">
              <div className="w-8 h-8 rounded-lg bg-orange-100 overflow-hidden flex items-center justify-center text-orange-800 font-bold text-sm ring-2 ring-orange-200 group-hover:ring-orange-300 transition-all">
                {userProfile?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userProfile.photoURL} alt={userProfile.displayName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-orange-400 group-hover:text-orange-600 transition-colors" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] bg-white rounded-2xl shadow-xl border border-orange-100 p-1.5 z-50"
              sideOffset={8}
              align="end"
            >
              {/* User info */}
              <div className="px-3 py-3 border-b border-orange-50 mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 overflow-hidden flex items-center justify-center text-orange-800 font-bold text-sm flex-shrink-0">
                    {userProfile?.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-orange-900 truncate">{userProfile?.displayName}</p>
                    <p className="text-xs text-orange-400 truncate">{userProfile?.kshetra}</p>
                  </div>
                </div>
              </div>

              {/* Edit Profile — native anchor so Radix can't block navigation */}
              <DropdownMenu.Item asChild>
                <a href="/profile" className={`${itemCls} text-orange-800 hover:bg-orange-50`}>
                  <User className="w-4 h-4 text-orange-500" />
                  Edit Profile
                </a>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-orange-100 my-1" />

              <DropdownMenu.Item
                className={`${itemCls} text-red-500 hover:bg-red-50`}
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
