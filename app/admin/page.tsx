'use client'

import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { LoginScreen } from '@/components/login-screen'
import { Navbar } from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { isAppAdmin } from '@/lib/admin'
import { NotificationComposer } from '@/components/admin/notification-composer'

export default function AdminPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 animate-pulse items-center justify-center">
            <Image src="/baps-logo.png" alt="BAPS Swaminarayan Logo" width={80} height={80} className="object-contain" />
          </div>
          <p className="text-sm text-muted-foreground">Loading Aahanik...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  if (!isAppAdmin(user.email)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-xl px-4 py-16">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Not authorized to view this page.
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin</h1>
          <p className="mt-1 text-muted-foreground">App-wide administrative controls.</p>
        </div>
        <NotificationComposer />
      </main>
    </div>
  )
}
