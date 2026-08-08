'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StoryCardCarousel } from './story-card-carousel'
import { pick, type ChaturmasReading, type Lang } from '@/lib/chaturmas'
import type { ChaturmasStrings } from '@/lib/chaturmas-i18n'

interface ReadingViewProps {
  reading: ChaturmasReading
  lang: Lang
  strings: ChaturmasStrings
}

export function ReadingView({ reading, lang, strings }: ReadingViewProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border bg-muted/50">
        <CardTitle className="text-lg">{pick(reading.unitLabel, lang)}</CardTitle>
        <CardDescription>Day {reading.day}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="original">
          <TabsList className="mb-4 h-auto w-full flex-wrap">
            <TabsTrigger value="original" className="flex-1">
              {strings.viewOriginal}
            </TabsTrigger>
            <TabsTrigger value="story" className="flex-1">
              {strings.viewStoryCards}
            </TabsTrigger>
            <TabsTrigger value="teaching" className="flex-1">
              {strings.viewKeyTeaching}
            </TabsTrigger>
            <TabsTrigger value="memorable" className="flex-1">
              {strings.viewMemorable}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="original">
            <p className="whitespace-pre-line leading-relaxed text-foreground">{pick(reading.original, lang)}</p>
          </TabsContent>

          <TabsContent value="story">
            <StoryCardCarousel reading={reading} lang={lang} strings={strings} />
          </TabsContent>

          <TabsContent value="teaching">
            <p className="whitespace-pre-line leading-relaxed text-foreground">{pick(reading.keyTeaching, lang)}</p>
          </TabsContent>

          <TabsContent value="memorable">
            <blockquote className="border-l-4 border-primary pl-4 italic text-foreground">
              {pick(reading.memorablePassage, lang)}
            </blockquote>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
