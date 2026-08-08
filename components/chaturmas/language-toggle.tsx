'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { Lang } from '@/lib/chaturmas'

interface LanguageToggleProps {
  value: Lang
  onChange: (lang: Lang) => void
}

export function LanguageToggle({ value, onChange }: LanguageToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as Lang)}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="en">EN</ToggleGroupItem>
      <ToggleGroupItem value="gu">ગુ</ToggleGroupItem>
    </ToggleGroup>
  )
}
