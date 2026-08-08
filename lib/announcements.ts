'use client'

import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Announcement {
  id: string
  message: string
  kshetra: string | null
  createdAt: Timestamp | null
  createdBy: string
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Announcement, 'id'>) })))
        setLoading(false)
      },
      (error) => {
        console.error('Announcements listener error:', error)
        setLoading(false)
      },
    )
    return () => unsubscribe()
  }, [])

  return { announcements, loading }
}

export async function createAnnouncement(createdBy: string, message: string, kshetra: string | null) {
  await addDoc(collection(db, 'announcements'), {
    message,
    kshetra,
    createdAt: serverTimestamp(),
    createdBy,
  })
}

export async function deleteAnnouncement(id: string) {
  await deleteDoc(doc(db, 'announcements', id))
}

export function announcementsForUser(announcements: Announcement[], userKshetra: string | null | undefined) {
  return announcements.filter((a) => a.kshetra === null || a.kshetra === userKshetra)
}
