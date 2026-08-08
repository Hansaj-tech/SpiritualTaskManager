'use client'

import { useState } from 'react'
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { toast } from 'sonner'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { dayKey } from '@/lib/chaturmas'
import { chaturmasSeed } from '@/data/chaturmas-seed'

export function SeedButton() {
  const [seeding, setSeeding] = useState(false)

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const batch = writeBatch(db)

      batch.set(
        doc(db, 'chaturmasConfig', 'current'),
        { ...chaturmasSeed.config, updatedAt: serverTimestamp() },
        { merge: true },
      )

      for (const text of chaturmasSeed.texts) {
        const { readings, ...textDoc } = text
        batch.set(doc(db, 'chaturmasTexts', text.id), textDoc, { merge: true })
        for (const reading of readings) {
          batch.set(
            doc(db, 'chaturmasTexts', text.id, 'readings', dayKey(reading.day)),
            { ...reading, updatedAt: serverTimestamp() },
            { merge: true },
          )
        }
      }

      await batch.commit()
      toast.success('Sample data loaded')
    } catch (error) {
      console.error('Error seeding Chaturmas data:', error)
      toast.error('Failed to load sample data')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <Button onClick={handleSeed} disabled={seeding} variant="outline">
      {seeding ? 'Loading sample data...' : 'Load Sample Data'}
    </Button>
  )
}
