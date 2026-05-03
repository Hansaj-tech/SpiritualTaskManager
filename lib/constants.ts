import type { ActivityId } from '@/types'

export const ACTIVITY_IDS: ActivityId[] = [
  'morning-aarti',
  'evening-aarti',
  'mansi-1',
  'mansi-2',
  'mansi-3',
  'vachnamrut-vanchan',
  'swamini-vato-vanchan',
  'nitya-prerna-shravan',
  'chesta',
  'pooja',
]

export const BONUS_ACTIVITY_IDS: ActivityId[] = [
  'bhajan',
  'dhyan',
  'seva',
  'satsang-sabha',
]

export const DEFAULT_ACTIVITIES: Record<ActivityId, { name: string; order: number; points: number }> = {
  'morning-aarti':         { name: 'Morning Aarti',           order: 1,  points: 10 },
  'evening-aarti':         { name: 'Evening Aarti',           order: 2,  points: 10 },
  'mansi-1':               { name: '1st Mansi',               order: 3,  points: 10 },
  'mansi-2':               { name: '2nd Mansi',               order: 4,  points: 10 },
  'mansi-3':               { name: '3rd Mansi',               order: 5,  points: 10 },
  'vachnamrut-vanchan':    { name: 'Vachnamrut Vanchan',      order: 6,  points: 10 },
  'swamini-vato-vanchan':  { name: 'Swamini Vato Nu Vanchan', order: 7,  points: 10 },
  'nitya-prerna-shravan':  { name: 'Nitya Prerna Shravan',    order: 8,  points: 10 },
  'chesta':                { name: 'Chesta',                  order: 9,  points: 10 },
  'pooja':                 { name: 'Pooja',                   order: 10, points: 10 },
  'bhajan':                { name: 'Bhajan',                  order: 11, points: 10 },
  'dhyan':                 { name: 'Dhyan',                   order: 12, points: 10 },
  'seva':                  { name: 'Seva',                    order: 13, points: 10 },
  'satsang-sabha':         { name: 'Satsang Sabha',           order: 14, points: 10 },
}

export const KSHETRA_OPTIONS = [
  'K1', 'K2', 'K3', 'K4', 'K5', 'K6',
  'K7', 'K8', 'K9', 'K10', 'K11', 'K12',
] as const
