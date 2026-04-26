'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Pencil } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const KSHETRA_OPTIONS = [
  'K1', 'K2', 'K3', 'K4', 'K5', 'K6',
  'K7', 'K8', 'K9', 'K10', 'K11', 'K12',
]

export function Navbar() {
  const { user, userData, logout, updateUserProfile } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState('')
  const [kshetra, setKshetra] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const displayName = userData?.displayName || user?.displayName?.split(' ')[0] || 'Devotee'
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleEditOpen = () => {
    setName(userData?.displayName || '')
    setKshetra(userData?.kshetra || '')
    setEditOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim() || !kshetra) return
    setIsSaving(true)
    try {
      await updateUserProfile(name.trim(), kshetra)
      setEditOpen(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/baps-logo.png"
              alt="BAPS Swaminarayan Logo"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="text-xl font-bold text-foreground">Aahanik</span>
          </div>

          {/* User avatar dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={user.photoURL || ''} alt={displayName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold leading-none">{displayName}</p>
                    {userData?.kshetra && (
                      <p className="text-xs text-muted-foreground">Kshetra: {userData.kshetra}</p>
                    )}
                    {user.email && (
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    )}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleEditOpen}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </motion.header>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-kshetra">Kshetra</Label>
              <Select value={kshetra} onValueChange={setKshetra}>
                <SelectTrigger id="edit-kshetra">
                  <SelectValue placeholder="Select Kshetra" />
                </SelectTrigger>
                <SelectContent>
                  {KSHETRA_OPTIONS.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={!name.trim() || !kshetra || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
