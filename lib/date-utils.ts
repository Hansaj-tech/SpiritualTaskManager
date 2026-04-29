import { format, differenceInCalendarDays, parseISO, subDays } from 'date-fns'

export function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function computeStreak(
  allCompleted: boolean,
  currentStreak: number,
  lastCompletedDate: string | null,
  today: string
): { streak: number; lastCompletedDate: string | null } {
  if (!allCompleted) return { streak: 0, lastCompletedDate }
  if (lastCompletedDate === today) return { streak: currentStreak, lastCompletedDate }
  if (!lastCompletedDate) return { streak: 1, lastCompletedDate: today }
  const diff = differenceInCalendarDays(parseISO(today), parseISO(lastCompletedDate))
  if (diff === 1) return { streak: currentStreak + 1, lastCompletedDate: today }
  return { streak: 1, lastCompletedDate: today }
}

export function getWeekDates(sunday: string): string[] {
  const sun = parseISO(sunday)
  return Array.from({ length: 7 }, (_, i) => format(subDays(sun, 6 - i), 'yyyy-MM-dd'))
}

export function computeActivityStreak(doneDates: string[], today: string): number {
  const sorted = [...doneDates].sort((a, b) => b.localeCompare(a))
  if (!sorted.includes(today)) return 0
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(parseISO(sorted[i - 1]), parseISO(sorted[i]))
    if (diff === 1) streak++
    else break
  }
  return streak
}
