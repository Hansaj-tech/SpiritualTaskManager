'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { dayKey, useChaturmasTexts, useReading } from '@/lib/chaturmas'

const emptyForm = {
  unitLabelEn: '',
  unitLabelGu: '',
  originalEn: '',
  originalGu: '',
  keyTeachingEn: '',
  keyTeachingGu: '',
  memorablePassageEn: '',
  memorablePassageGu: '',
  storyTitleEn: '',
  storyTitleGu: '',
  storySummaryEn: '',
  storySummaryGu: '',
  storyImageUrl: '/placeholder.svg',
}

type FormState = typeof emptyForm

export function ContentEditor() {
  const { user } = useAuth()
  const { texts } = useChaturmasTexts()
  const [textId, setTextId] = useState('')
  const [day, setDay] = useState(1)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const { reading } = useReading(textId || null, day || null)

  useEffect(() => {
    if (!textId && texts.length > 0) setTextId(texts[0].id)
  }, [texts, textId])

  useEffect(() => {
    if (reading) {
      setForm({
        unitLabelEn: reading.unitLabel.en,
        unitLabelGu: reading.unitLabel.gu,
        originalEn: reading.original.en,
        originalGu: reading.original.gu,
        keyTeachingEn: reading.keyTeaching.en,
        keyTeachingGu: reading.keyTeaching.gu,
        memorablePassageEn: reading.memorablePassage.en,
        memorablePassageGu: reading.memorablePassage.gu,
        storyTitleEn: reading.storyCard.title.en,
        storyTitleGu: reading.storyCard.title.gu,
        storySummaryEn: reading.storyCard.summary.en,
        storySummaryGu: reading.storyCard.summary.gu,
        storyImageUrl: reading.storyCard.imageUrl,
      })
    } else {
      setForm(emptyForm)
    }
  }, [reading])

  const update = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSave = async () => {
    if (!textId || !day || !user?.email) return
    setSaving(true)
    try {
      const ref = doc(db, 'chaturmasTexts', textId, 'readings', dayKey(day))
      await setDoc(
        ref,
        {
          day,
          textId,
          unitLabel: { en: form.unitLabelEn, gu: form.unitLabelGu },
          original: { en: form.originalEn, gu: form.originalGu },
          keyTeaching: { en: form.keyTeachingEn, gu: form.keyTeachingGu },
          memorablePassage: { en: form.memorablePassageEn, gu: form.memorablePassageGu },
          storyCard: {
            title: { en: form.storyTitleEn, gu: form.storyTitleGu },
            summary: { en: form.storySummaryEn, gu: form.storySummaryGu },
            imageUrl: form.storyImageUrl || '/placeholder.svg',
          },
          updatedAt: serverTimestamp(),
          updatedBy: user.email,
        },
        { merge: true },
      )
      toast.success('Saved')
    } catch (error) {
      console.error('Error saving Chaturmas reading:', error)
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Daily Reading</CardTitle>
        <CardDescription>Choose a text and day, then fill in English and Gujarati content.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <Label>Text</Label>
            <Select value={textId} onValueChange={setTextId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {texts.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-32 flex-col gap-2">
            <Label>Day</Label>
            <Input type="number" min={1} value={day} onChange={(e) => setDay(Number(e.target.value) || 1)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input placeholder="Unit label (EN)" value={form.unitLabelEn} onChange={update('unitLabelEn')} />
          <Input placeholder="Unit label (GU)" value={form.unitLabelGu} onChange={update('unitLabelGu')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea placeholder="Original text (EN)" value={form.originalEn} onChange={update('originalEn')} rows={6} />
          <Textarea placeholder="Original text (GU)" value={form.originalGu} onChange={update('originalGu')} rows={6} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea placeholder="Key teaching (EN)" value={form.keyTeachingEn} onChange={update('keyTeachingEn')} rows={3} />
          <Textarea placeholder="Key teaching (GU)" value={form.keyTeachingGu} onChange={update('keyTeachingGu')} rows={3} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea
            placeholder="Memorable passage (EN)"
            value={form.memorablePassageEn}
            onChange={update('memorablePassageEn')}
            rows={2}
          />
          <Textarea
            placeholder="Memorable passage (GU)"
            value={form.memorablePassageGu}
            onChange={update('memorablePassageGu')}
            rows={2}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input placeholder="Story title (EN)" value={form.storyTitleEn} onChange={update('storyTitleEn')} />
          <Input placeholder="Story title (GU)" value={form.storyTitleGu} onChange={update('storyTitleGu')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea placeholder="Story summary (EN)" value={form.storySummaryEn} onChange={update('storySummaryEn')} rows={3} />
          <Textarea placeholder="Story summary (GU)" value={form.storySummaryGu} onChange={update('storySummaryGu')} rows={3} />
        </div>
        <Input placeholder="Story image URL" value={form.storyImageUrl} onChange={update('storyImageUrl')} />

        <Button onClick={handleSave} disabled={saving || !textId} className="self-end">
          {saving ? 'Saving...' : 'Save Reading'}
        </Button>
      </CardContent>
    </Card>
  )
}
