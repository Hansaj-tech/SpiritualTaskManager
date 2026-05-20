import { format, differenceInCalendarDays, parseISO, subDays } from 'date-fns'

export function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

// Returns yesterday's date before 6am, otherwise today's date.
// Users can fill the previous day's aahanik until 6am the next morning.
export function getActiveDate(): string {
  const now = new Date()
  if (now.getHours() < 6) {
    return format(subDays(now, 1), 'yyyy-MM-dd')
  }
  return format(now, 'yyyy-MM-dd')
}

export function isFillingYesterday(): boolean {
  return new Date().getHours() < 6
}

export function computeStreak(
  allCompleted: boolean,
  currentStreak: number,
  lastCompletedDate: string | null,
  today: string
): { streak: number; lastCompletedDate: string | null } {
  if (!allCompleted) return { streak: currentStreak, lastCompletedDate }
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
  if (sorted.length === 0) return 0
  // Show streak if most recent is today or yesterday (streak alive going into today)
  const diffFromToday = differenceInCalendarDays(parseISO(today), parseISO(sorted[0]))
  if (diffFromToday > 1) return 0
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(parseISO(sorted[i - 1]), parseISO(sorted[i]))
    if (diff === 1) streak++
    else break
  }
  return streak
}
