'use client'

import Image from 'next/image'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'
import { pick, type ChaturmasReading, type Lang } from '@/lib/chaturmas'
import type { ChaturmasStrings } from '@/lib/chaturmas-i18n'

interface StoryCardCarouselProps {
  reading: ChaturmasReading
  lang: Lang
  strings: ChaturmasStrings
}

export function StoryCardCarousel({ reading, lang, strings }: StoryCardCarouselProps) {
  const slides = [
    {
      title: pick(reading.storyCard.title, lang),
      body: pick(reading.storyCard.summary, lang),
      image: reading.storyCard.imageUrl || '/placeholder.svg',
    },
    {
      title: strings.reflection,
      body: pick(reading.keyTeaching, lang),
      image: '/placeholder.svg',
    },
  ]

  return (
    <div className="px-10">
      <Carousel>
        <CarouselContent>
          {slides.map((slide, i) => (
            <CarouselItem key={i}>
              <Card className="overflow-hidden">
                <div className="relative h-48 w-full bg-muted">
                  <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                </div>
                <CardContent className="pt-4">
                  <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">{slide.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{slide.body}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
