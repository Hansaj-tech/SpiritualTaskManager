'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useEffect, useState } from 'react'
import { BapsLogo } from '@/components/baps-logo'

interface GuruCarouselProps {
  images: string[]
}

const PLACEHOLDER_GRADIENT = [
  'from-orange-400 to-orange-600',
  'from-amber-400 to-orange-500',
  'from-orange-500 to-red-500',
]

export function GuruCarousel({ images }: GuruCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  const items = images.length > 0 ? images : ['placeholder']

  return (
    <div className="relative w-full">
      <div ref={emblaRef} className="overflow-hidden rounded-2xl">
        <div className="flex">
          {items.map((src, i) => (
            <div
              key={i}
              className="relative flex-[0_0_100%] h-36"
            >
              {src === 'placeholder' ? (
                <div
                  className={`w-full h-full bg-gradient-to-br ${PLACEHOLDER_GRADIENT[i % 3]} flex items-center justify-center`}
                >
                  <div className="text-center text-white flex flex-col items-center gap-2">
                    <BapsLogo className="w-16 h-16" />
                    <p className="text-xs opacity-90 font-semibold tracking-wide">Jai Swaminarayan</p>
                  </div>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={`Guru image ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {items.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === selectedIndex ? 'w-4 bg-orange-600' : 'w-1.5 bg-orange-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
