'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DayPickerProps {
  selectedDay: number
  maxDay: number
  onSelectDay: (day: number) => void
}

export function DayPicker({ selectedDay, maxDay, onSelectDay }: DayPickerProps) {
  const days = Array.from({ length: maxDay }, (_, i) => i + 1)

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        disabled={selectedDay <= 1}
        onClick={() => onSelectDay(selectedDay - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Select value={String(selectedDay)} onValueChange={(v) => onSelectDay(Number(v))}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={String(d)}>
              Day {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon-sm"
        disabled={selectedDay >= maxDay}
        onClick={() => onSelectDay(selectedDay + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
