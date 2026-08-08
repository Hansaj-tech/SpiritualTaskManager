'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/sonner'
import { Navbar } from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { useDailyLog, todayKey } from '@/lib/daily-log'
import {
  useSeasonConfig,
  useChaturmasTexts,
  useReading,
  useChaturmasProgress,
  getChaturmasDayNumber,
  type Lang,
} from '@/lib/chaturmas'
import { chaturmasStrings } from '@/lib/chaturmas-i18n'
import { TextTabs } from './text-tabs'
import { ReadingView } from './reading-view'
import { LanguageToggle } from './language-toggle'
import { SeasonProgress } from './season-progress'
import { DayPicker } from './day-picker'
import { MarkAsReadButton } from './mark-as-read-button'
import { FeedbackForm } from './feedback-form'

const LANG_STORAGE_KEY = 'chaturmas-lang'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-20 w-20 animate-pulse items-center justify-center">
          <Image src="/baps-logo.png" alt="BAPS Swaminarayan Logo" width={80} height={80} className="object-contain" />
        </div>
        <p className="text-sm text-muted-foreground">Loading Chaturmas...</p>
      </div>
    </div>
  )
}

export function ChaturmasApp() {
  const { user } = useAuth()
  const { config, loading: configLoading } = useSeasonConfig()
  const { texts, loading: textsLoading } = useChaturmasTexts()
  const [lang, setLang] = useState<Lang>('en')
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const dateKey = todayKey()
  const { log } = useDailyLog(user?.uid, dateKey)
  const currentDay = config ? getChaturmasDayNumber(new Date(), config) : null

  useEffect(() => {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY)
    if (stored === 'en' || stored === 'gu') setLang(stored)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang)
  }, [lang])

  useEffect(() => {
    if (!selectedTextId && texts.length > 0) setSelectedTextId(texts[0].id)
  }, [texts, selectedTextId])

  useEffect(() => {
    if (selectedDay === null && currentDay) setSelectedDay(currentDay)
  }, [currentDay, selectedDay])

  const selectedText = texts.find((t) => t.id === selectedTextId) ?? null
  const { reading, loading: readingLoading } = useReading(selectedTextId, selectedDay)
  const { completedDays } = useChaturmasProgress(user?.uid, selectedTextId ?? '')

  const t = chaturmasStrings[lang]

  if (configLoading || textsLoading) {
    return <LoadingScreen />
  }

  if (!config || texts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-12 text-center">
          <p className="text-muted-foreground">{t.comingSoon}</p>
        </main>
      </div>
    )
  }

  const seasonHasNotStarted = new Date() < config.startDate

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Toaster />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t.title} 🙏</h1>
            <p className="mt-1 text-muted-foreground">{t.subtitle}</p>
          </div>
          <LanguageToggle value={lang} onChange={setLang} />
        </motion.div>

        <Card className="mb-6">
          <CardContent className="py-4">
            <SeasonProgress currentDay={currentDay} totalDays={config.totalDays} label={t.seasonProgress} />
          </CardContent>
        </Card>

        {!currentDay ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {seasonHasNotStarted ? t.notStarted : t.seasonOver}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <TextTabs texts={texts} value={selectedTextId ?? ''} onChange={setSelectedTextId} lang={lang} />
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <DayPicker selectedDay={selectedDay ?? currentDay} maxDay={currentDay} onSelectDay={setSelectedDay} />
              {user && selectedText && selectedDay && (
                <MarkAsReadButton
                  uid={user.uid}
                  dateKey={dateKey}
                  day={selectedDay}
                  textId={selectedText.id}
                  taskListMatch={selectedText.taskListMatch}
                  isToday={selectedDay === currentDay}
                  alreadySubmittedToday={log?.submitted ?? false}
                  isRead={completedDays.includes(selectedDay)}
                  strings={t}
                />
              )}
            </div>

            {readingLoading ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent>
              </Card>
            ) : reading ? (
              <ReadingView reading={reading} lang={lang} strings={t} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">{t.comingSoon}</CardContent>
              </Card>
            )}

            <div className="mt-6">
              <FeedbackForm uid={user?.uid} day={selectedDay} strings={t} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
