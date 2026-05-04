import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import type { LeaderboardEntry } from '@/types'

function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7)
}

function buildEntry(id: string, data: FirebaseFirestore.DocumentData, callerUid: string): Omit<LeaderboardEntry, 'rank'> {
  const month = currentMonthKey()
  const storedMonth = (data.monthlyRajipoMonth as string) ?? ''
  const monthlyRajipo = storedMonth === month ? ((data.monthlyRajipo as number) ?? 0) : 0
  return {
    uid: id,
    displayName: data.displayName ?? 'Unknown',
    photoURL: data.photoURL ?? null,
    rajipo: data.rajipo ?? 0,
    monthlyRajipo,
    tasksCompleted: Math.round((data.rajipo ?? 0) / 10),
    streak: data.streak ?? 0,
    isCurrentUser: id === callerUid,
  }
}

function ranked(entries: Omit<LeaderboardEntry, 'rank'>[], key: 'rajipo' | 'monthlyRajipo'): LeaderboardEntry[] {
  return [...entries]
    .sort((a, b) => b[key] - a[key])
    .map((e, i) => ({ ...e, rank: i + 1 }))
}

export async function GET(request: NextRequest) {
  if (
    !process.env.FIREBASE_ADMIN_PROJECT_ID ||
    !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    !process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    console.error('Missing Firebase Admin env vars')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    const idToken = (request.headers.get('authorization') ?? '').replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await adminAuth().verifyIdToken(idToken)
    const callerSnap = await adminDb().collection('users').doc(decoded.uid).get()
    const callerData = callerSnap.data()
    if (!callerData) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const isAdmin = callerData.isAdmin === true
    const isKshetraAdmin = callerData.isKshetraAdmin === true

    if (isAdmin) {
      const usersSnap = await adminDb().collection('users').limit(500).get()

      const byKshetra: Record<string, Omit<LeaderboardEntry, 'rank'>[]> = {}
      usersSnap.docs.forEach((doc) => {
        const data = doc.data()
        const kshetra = (data.kshetra as string) ?? 'Other'
        if (!byKshetra[kshetra]) byKshetra[kshetra] = []
        byKshetra[kshetra].push(buildEntry(doc.id, data, decoded.uid))
      })

      const monthly: Record<string, LeaderboardEntry[]> = {}
      const lifetime: Record<string, LeaderboardEntry[]> = {}
      for (const k of Object.keys(byKshetra)) {
        monthly[k] = ranked(byKshetra[k], 'monthlyRajipo')
        lifetime[k] = ranked(byKshetra[k], 'rajipo')
      }

      return NextResponse.json({ isAdmin: true, monthly, lifetime })
    } else if (isKshetraAdmin && callerData.kshetra) {
      const kshetra = callerData.kshetra as string
      const usersSnap = await adminDb().collection('users').where('kshetra', '==', kshetra).get()
      const entries = usersSnap.docs.map((doc) => buildEntry(doc.id, doc.data(), decoded.uid))
      return NextResponse.json({
        isAdmin: true,
        monthly: { [kshetra]: ranked(entries, 'monthlyRajipo') },
        lifetime: { [kshetra]: ranked(entries, 'rajipo') },
      })
    } else {
      const kshetra = callerData.kshetra as string | null
      if (!kshetra) {
        const empty = { entries: [], userRank: null, userEntry: null }
        return NextResponse.json({ isAdmin: false, monthly: empty, lifetime: empty, kshetra: null })
      }

      const usersSnap = await adminDb().collection('users').where('kshetra', '==', kshetra).get()
      const entries = usersSnap.docs.map((doc) => buildEntry(doc.id, doc.data(), decoded.uid))

      function buildView(key: 'rajipo' | 'monthlyRajipo') {
        const sorted = ranked(entries, key)
        const top5 = sorted.slice(0, 5)
        const userEntry = sorted.find((e) => e.uid === decoded.uid)
        return {
          entries: top5,
          userRank: userEntry?.rank ?? null,
          userEntry: userEntry && (userEntry.rank ?? 0) > 5 ? userEntry : null,
        }
      }

      return NextResponse.json({
        isAdmin: false,
        monthly: buildView('monthlyRajipo'),
        lifetime: buildView('rajipo'),
        kshetra,
      })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('leaderboard error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
