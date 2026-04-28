'use client'

import { useState, useEffect } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { PointsEditor } from '@/components/admin/points-editor'
import { QuoteEditor } from '@/components/admin/quote-editor'
import { ImagesEditor } from '@/components/admin/images-editor'
import { getActivityDefs, getAppConfig } from '@/lib/firestore-helpers'
import type { ActivityDefinition, AppConfig } from '@/types'

export default function AdminSettingsPage() {
  const [activityDefs, setActivityDefs] = useState<ActivityDefinition[]>([])
  const [appConfig, setAppConfig] = useState<AppConfig>({ dailyQuote: '', guruImages: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getActivityDefs(), getAppConfig()]).then(([defs, config]) => {
      setActivityDefs(defs)
      setAppConfig(config)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-orange-900">Settings</h1>

      <Tabs.Root defaultValue="points">
        <Tabs.List className="flex gap-1 bg-orange-100 rounded-xl p-1 mb-4">
          {(['points', 'quote', 'images'] as const).map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              className="flex-1 h-8 rounded-lg text-sm font-medium text-orange-700 capitalize transition-all data-[state=active]:bg-white data-[state=active]:text-orange-900 data-[state=active]:shadow-sm"
            >
              {tab === 'points' ? 'Points' : tab === 'quote' ? 'Quote' : 'Images'}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="points">
          <PointsEditor activityDefs={activityDefs} />
        </Tabs.Content>

        <Tabs.Content value="quote">
          <QuoteEditor initialQuote={appConfig.dailyQuote} />
        </Tabs.Content>

        <Tabs.Content value="images">
          <ImagesEditor
            initialImages={appConfig.guruImages}
            initialLoginImage={appConfig.loginImage}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
