'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { pick, type ChaturmasText, type Lang } from '@/lib/chaturmas'

interface TextTabsProps {
  texts: ChaturmasText[]
  value: string
  onChange: (id: string) => void
  lang: Lang
}

export function TextTabs({ texts, value, onChange, lang }: TextTabsProps) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList className="h-auto w-full flex-wrap">
        {texts.map((text) => (
          <TabsTrigger key={text.id} value={text.id} className="flex-1">
            {pick({ en: text.name, gu: text.nameGu }, lang)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
