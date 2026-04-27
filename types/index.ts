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
  rajipo: number
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

export interface AppConfig {
  dailyQuote: string
  guruImages: string[]
  updatedAt?: Date
  updatedBy?: string
}

export type Kshetra =
  | 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6'
  | 'K7' | 'K8' | 'K9' | 'K10' | 'K11' | 'K12'
