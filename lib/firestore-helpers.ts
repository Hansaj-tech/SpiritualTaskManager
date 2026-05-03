import {
  doc, getDoc, setDoc, updateDoc, writeBatch,
  collection, query, orderBy, limit, getDocs,
  increment, serverTimestamp, arrayUnion, Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { computeActivityStreak, todayKey } from '@/lib/date-utils'
import { DEFAULT_ACTIVITIES, ACTIVITY_IDS, BONUS_ACTIVITY_IDS } from '@/lib/constants'
import type { UserProfile, DayLog, AppConfig, ActivityDefinition, ActivityId, ReminderPref } from '@/types'

function toDate(val: unknown): Date | null {
  if (!val) return null
  if (val instanceof Timestamp) return val.toDate()
  if (val instanceof Date) return val
  return null
}

export function docToUserProfile(uid: string, data: DocumentData): UserProfile {
  return {
    uid,
    displayName: data.displayName ?? '',
    email: data.email ?? '',
    photoURL: data.photoURL ?? null,
    kshetra: data.kshetra ?? null,
    isAdmin: data.isAdmin ?? false,
    rajipo: data.rajipo ?? 0,
    monthlyRajipo: data.monthlyRajipo ?? 0,
    monthlyRajipoMonth: data.monthlyRajipoMonth ?? '',
    streak: data.streak ?? 0,
    longestStreak: data.longestStreak ?? 0,
    lastCompletedDate: data.lastCompletedDate ?? null,
    fcmTokens: data.fcmTokens ?? [],
    createdAt: toDate(data.createdAt) ?? undefined,
    updatedAt: toDate(data.updatedAt) ?? undefined,
  }
}

export function docToDayLog(data: DocumentData): DayLog {
  const activities: DayLog['activities'] = {}
  const raw = data.activities as Record<string, DocumentData> | undefined
  if (raw) {
    for (const [id, entry] of Object.entries(raw)) {
      activities[id] = {
        done: entry.done ?? false,
        pointsEarned: entry.pointsEarned ?? 0,
        completedAt: toDate(entry.completedAt),
      }
    }
  }
  return {
    date: data.date ?? todayKey(),
    activities,
    totalPoints: data.totalPoints ?? 0,
    allCompleted: data.allCompleted ?? false,
    completedAt: toDate(data.completedAt) ?? undefined,
  }
}

export async function getOrCreateUserProfile(
  uid: string,
  defaults: { displayName: string; email: string; photoURL: string | null }
): Promise<UserProfile> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return docToUserProfile(uid, snap.data())

  const newProfile = {
    displayName: defaults.displayName,
    email: defaults.email,
    photoURL: defaults.photoURL,
    kshetra: null,
    isAdmin: false,
    rajipo: 0,
    monthlyRajipo: 0,
    monthlyRajipoMonth: '',
    streak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    fcmTokens: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  await setDoc(ref, newProfile)
  return { uid, ...newProfile, createdAt: new Date(), updatedAt: new Date() }
}

export async function saveActivityToggle(
  uid: string,
  activityId: string,
  done: boolean,
  pointsEarned: number,
  currentLog: DayLog,
  userProfile: UserProfile,
  activityDefs: ActivityDefinition[]
): Promise<void> {
  const dateKey = todayKey()

  const updatedActivities: Record<string, { done: boolean; pointsEarned: number; completedAt: unknown }> = {}
  for (const [id, entry] of Object.entries(currentLog.activities)) {
    updatedActivities[id] = {
      done: entry.done,
      pointsEarned: entry.pointsEarned,
      completedAt: entry.completedAt ?? null,
    }
  }
  updatedActivities[activityId] = {
    done,
    pointsEarned: done ? pointsEarned : 0,
    completedAt: done ? serverTimestamp() : null,
  }

  const newTotal = activityDefs.reduce((sum, a) => {
    const entry = updatedActivities[a.id]
    return sum + (entry?.done ? (entry.pointsEarned || a.points) : 0)
  }, 0)

  const allCompleted = ACTIVITY_IDS.every(id => updatedActivities[id]?.done)
  const rajipoelta = newTotal - (currentLog.totalPoints ?? 0)

  // Compute main streak
  let streak: number
  let lastCompletedDate: string | null = userProfile.lastCompletedDate

  if (!allCompleted) {
    // Main activities not all done — preserve existing streak unchanged
    streak = userProfile.streak
  } else if (userProfile.lastCompletedDate === dateKey) {
    // Already recorded a completion for today — no change
    streak = userProfile.streak
  } else {
    // All 10 main activities completed for the first time today.
    // Recalculate from activityLogs (source of truth) so any previously
    // corrupted userProfile.streak value doesn't carry forward.
    const logsRef2 = collection(db, 'users', uid, 'activityLogs')
    const recentSnap = await getDocs(query(logsRef2, orderBy('date', 'desc'), limit(60)))
    const histCompleted = recentSnap.docs
      .filter(d => d.data().allCompleted === true && d.data().date !== dateKey)
      .map(d => d.data().date as string)
    streak = computeActivityStreak([dateKey, ...histCompleted], dateKey)
    lastCompletedDate = dateKey
  }

  const newLongest = Math.max(streak, userProfile.longestStreak)

  const currentMonth = dateKey.slice(0, 7) // YYYY-MM
  const isNewMonth = (userProfile.monthlyRajipoMonth ?? '') !== currentMonth

  const batch = writeBatch(db)

  const logRef = doc(db, 'users', uid, 'activityLogs', dateKey)
  batch.set(logRef, {
    date: dateKey,
    activities: updatedActivities,
    totalPoints: newTotal,
    allCompleted,
    completedAt: serverTimestamp(),
  }, { merge: true })

  const userRef = doc(db, 'users', uid)
  batch.update(userRef, {
    rajipo: increment(rajipoelta),
    monthlyRajipo: isNewMonth ? Math.max(0, rajipoelta) : increment(rajipoelta),
    monthlyRajipoMonth: currentMonth,
    streak,
    longestStreak: newLongest,
    lastCompletedDate,
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
}

export async function getActivityDefs(): Promise<ActivityDefinition[]> {
  const ref = doc(db, 'config', 'activities')
  const snap = await getDoc(ref)
  const stored = snap.exists()
    ? (snap.data().activities as Record<string, ActivityDefinition> | undefined)
    : undefined

  const allIds = [...ACTIVITY_IDS, ...BONUS_ACTIVITY_IDS]
  return allIds
    .map((id) => stored?.[id] ?? { id: id as ActivityId, ...DEFAULT_ACTIVITIES[id] })
    .sort((a, b) => a.order - b.order)
}

export async function getAppConfig(): Promise<AppConfig> {
  const ref = doc(db, 'config', 'app')
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    return { dailyQuote: 'May your seva bring peace and Rajipo.', guruImages: [] }
  }
  const data = snap.data()
  return {
    dailyQuote: data.dailyQuote ?? '',
    guruImages: data.guruImages ?? [],
    updatedAt: toDate(data.updatedAt) ?? undefined,
    updatedBy: data.updatedBy,
  }
}

export async function saveReminder(uid: string, pref: ReminderPref): Promise<void> {
  const ref = doc(db, 'users', uid, 'reminders', pref.activityId)
  await setDoc(ref, pref)
}

export async function updateUserKshetra(uid: string, kshetra: string): Promise<void> {
  const ref = doc(db, 'users', uid)
  await setDoc(ref, { kshetra, updatedAt: serverTimestamp() }, { merge: true })
}

export async function updateUserProfileData(
  uid: string,
  data: { displayName?: string; photoURL?: string | null }
): Promise<void> {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

export async function saveFcmToken(uid: string, token: string): Promise<void> {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, { fcmTokens: arrayUnion(token) })
}

export async function getRecentActivityLogs(
  uid: string,
  count = 30
): Promise<Array<{ date: string; activities: Record<string, { done: boolean }> }>> {
  const logsRef = collection(db, 'users', uid, 'activityLogs')
  const q = query(logsRef, orderBy('date', 'desc'), limit(count))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({
    date: d.data().date as string,
    activities: d.data().activities as Record<string, { done: boolean }>,
  }))
}

export async function updateActivityPoints(
  activityUpdates: Record<string, number>
): Promise<void> {
  const ref = doc(db, 'config', 'activities')
  const snap = await getDoc(ref)
  const existing: Record<string, ActivityDefinition> = snap.exists()
    ? (snap.data().activities as Record<string, ActivityDefinition>) ?? {}
    : {}

  // Ensure all activities exist (including bonus) so they're visible in Firestore
  for (const id of [...ACTIVITY_IDS, ...BONUS_ACTIVITY_IDS]) {
    if (!existing[id]) {
      existing[id] = { id: id as ActivityId, ...DEFAULT_ACTIVITIES[id] }
    }
  }

  for (const [id, points] of Object.entries(activityUpdates)) {
    if (existing[id]) {
      existing[id].points = points
    } else if (DEFAULT_ACTIVITIES[id as ActivityId]) {
      existing[id] = { id: id as ActivityId, ...DEFAULT_ACTIVITIES[id as ActivityId], points }
    }
  }
  await setDoc(ref, { activities: existing }, { merge: true })
}

export async function updateActivities(
  updates: Record<string, { name?: string; points?: number }>
): Promise<void> {
  const ref = doc(db, 'config', 'activities')
  const snap = await getDoc(ref)
  const existing: Record<string, ActivityDefinition> = snap.exists()
    ? (snap.data().activities as Record<string, ActivityDefinition>) ?? {}
    : {}

  // Ensure all activities exist so they're always visible in Firestore
  for (const id of [...ACTIVITY_IDS, ...BONUS_ACTIVITY_IDS]) {
    if (!existing[id]) {
      existing[id] = { id: id as ActivityId, ...DEFAULT_ACTIVITIES[id] }
    }
  }

  for (const [id, update] of Object.entries(updates)) {
    if (existing[id]) {
      if (update.name !== undefined) existing[id].name = update.name
      if (update.points !== undefined) existing[id].points = update.points
    }
  }
  await setDoc(ref, { activities: existing }, { merge: true })
}

export async function updateDailyQuote(quote: string): Promise<void> {
  const ref = doc(db, 'config', 'app')
  await setDoc(ref, { dailyQuote: quote, updatedAt: serverTimestamp() }, { merge: true })
}

export async function updateGuruImages(images: string[]): Promise<void> {
  const ref = doc(db, 'config', 'app')
  await setDoc(ref, { guruImages: images, updatedAt: serverTimestamp() }, { merge: true })
}
