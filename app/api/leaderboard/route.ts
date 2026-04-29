import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import type { LeaderboardEntry } from '@/types'

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

    if (isAdmin) {
      const usersSnap = await adminDb().collection('users').limit(500).get()

      const groups: Record<string, LeaderboardEntry[]> = {}
      usersSnap.docs.forEach((doc) => {
        const data = doc.data()
        const kshetra = (data.kshetra as string) ?? 'Other'
        if (!groups[kshetra]) groups[kshetra] = []
        groups[kshetra].push({
          uid: doc.id,
          displayName: data.displayName ?? 'Unknown',
          photoURL: data.photoURL ?? null,
          rajipo: data.rajipo ?? 0,
          tasksCompleted: Math.round((data.rajipo ?? 0) / 10),
          streak: data.streak ?? 0,
          rank: 0,
          isCurrentUser: doc.id === decoded.uid,
        })
      })

      for (const k of Object.keys(groups)) {
        groups[k]
          .sort((a, b) => b.rajipo - a.rajipo)
          .forEach((e, i) => { e.rank = i + 1 })
      }

      return NextResponse.json({ isAdmin: true, groups })
    } else {
      const kshetra = callerData.kshetra as string | null
      if (!kshetra) return NextResponse.json({ isAdmin: false, entries: [], userRank: null, kshetra: null })

      const usersSnap = await adminDb().collection('users').where('kshetra', '==', kshetra).get()

      const all = usersSnap.docs
        .map((doc) => {
          const data = doc.data()
          return {
            uid: doc.id,
            displayName: data.displayName ?? 'Unknown',
            photoURL: data.photoURL ?? null,
            rajipo: data.rajipo ?? 0,
            tasksCompleted: Math.round((data.rajipo ?? 0) / 10),
            streak: data.streak ?? 0,
            rank: 0,
            isCurrentUser: doc.id === decoded.uid,
          }
        })
        .sort((a, b) => b.rajipo - a.rajipo)

      all.forEach((e, i) => { e.rank = i + 1 })

      const top5 = all.slice(0, 5)
      const userEntry = all.find((e) => e.uid === decoded.uid)

      return NextResponse.json({
        isAdmin: false,
        entries: top5,
        userRank: userEntry?.rank ?? null,
        userEntry: userEntry && (userEntry.rank ?? 0) > 5 ? userEntry : null,
        kshetra,
      })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('leaderboard error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
