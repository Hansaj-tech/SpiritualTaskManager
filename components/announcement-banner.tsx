'use client'

import { useEffect, useState } from 'react'
import { X, Megaphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAnnouncements, announcementsForUser } from '@/lib/announcements'

const DISMISSED_KEY = 'dismissed-announcements'

function getDismissed(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(DISMISSED_KEY) ?? '[]')
  } catch {
    return []
  }
}

interface AnnouncementBannerProps {
  userKshetra: string | null | undefined
}

export function AnnouncementBanner({ userKshetra }: AnnouncementBannerProps) {
  const { announcements } = useAnnouncements()
  const [dismissed, setDismissed] = useState<string[]>([])

  useEffect(() => {
    setDismissed(getDismissed())
  }, [])

  const visible = announcementsForUser(announcements, userKshetra).filter((a) => !dismissed.includes(a.id))

  const dismiss = (id: string) => {
    const next = [...dismissed, id]
    setDismissed(next)
    window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(next))
  }

  if (visible.length === 0) return null

  return (
    <div className="mb-8 flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {visible.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert className="relative pr-10">
              <Megaphone />
              <AlertDescription>{a.message}</AlertDescription>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-2 top-2"
                onClick={() => dismiss(a.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
