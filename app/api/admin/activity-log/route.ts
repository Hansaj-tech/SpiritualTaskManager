import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { ACTIVITY_IDS, DEFAULT_ACTIVITIES } from '@/lib/constants'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? ''
    const idToken = authHeader.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await adminAuth().verifyIdToken(idToken)
    const callerSnap = await adminDb().collection('users').doc(decoded.uid).get()
    if (!callerSnap.data()?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 })

    const now = new Date()
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

    const logsSnap = await adminDb()
      .collection('users')
      .doc(uid)
      .collection('activityLogs')
      .where('date', '>=', monthStart)
      .where('date', '<=', monthEnd)
      .get()

    const totalDays = logsSnap.size

    // Count done per activity
    const doneCounts: Record<string, number> = {}
    for (const id of ACTIVITY_IDS) doneCounts[id] = 0

    for (const doc of logsSnap.docs) {
      const activities = doc.data().activities as Record<string, { done: boolean }> | undefined
      if (!activities) continue
      for (const id of ACTIVITY_IDS) {
        if (activities[id]?.done) doneCounts[id]++
      }
    }

    const activityLog: Record<string, { done: number; total: number; name: string }> = {}
    for (const id of ACTIVITY_IDS) {
      activityLog[id] = {
        done: doneCounts[id],
        total: totalDays,
        name: DEFAULT_ACTIVITIES[id].name,
      }
    }

    return NextResponse.json({ activityLog, totalDays })
  } catch (err) {
    console.error('activity-log error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
