export type ActivityId =
  | 'morning-aarti'
  | 'evening-aarti'
  | 'mansi-1'
  | 'mansi-2'
  | 'mansi-3'
  | 'vachnamrut-vanchan'
  | 'swamini-vato-vanchan'
  | 'nitya-prerna-shravan'
  | 'chesta'
  | 'pooja'
  | 'bhajan'
  | 'dhyan'
  | 'seva'
  | 'satsang-sabha'
  | 'niyam'

export interface ActivityDefinition {
  id: ActivityId
  name: string
  points: number
  order: number
}

export interface ActivityLogEntry {
  done: boolean
  pointsEarned: number
  completedAt: Date | null
}

export interface DayLog {
  date: string
  activities: Record<string, ActivityLogEntry>
  totalPoints: number
  allCompleted: boolean
  completedAt?: Date
}

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  photoURL: string | null
  kshetra: string | null
  isAdmin: boolean
  isKshetraAdmin: boolean
  rajipo: number
  monthlyRajipo: number
  monthlyRajipoMonth: string
  streak: number
  longestStreak: number
  lastCompletedDate: string | null
  fcmTokens: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface ReminderPref {
  activityId: string
  enabled: boolean
  time: string
}

export interface TodaysVanchan {
  vachnamrut: string
  swaminiVato: string
}

export interface AppConfig {
  dailyQuote: string
  guruImages: string[]
  todaysVanchan?: TodaysVanchan
  motivations?: string[]
  motivationDurationHours?: number
  updatedAt?: Date
  updatedBy?: string
}

export type Kshetra =
  | 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6'
  | 'K7' | 'K8' | 'K9' | 'K10' | 'K11' | 'K12'
  | 'K13' | 'K14' | 'K15' | 'K16' | 'K17'

export interface LeaderboardEntry {
  uid: string
  displayName: string
  photoURL: string | null
  rajipo: number
  monthlyRajipo: number
  tasksCompleted: number
  streak: number
  rank: number
  isCurrentUser: boolean
}
