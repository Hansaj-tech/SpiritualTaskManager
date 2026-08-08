'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { toast } from 'sonner'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { todayKey } from '@/lib/daily-log'
import type { ChaturmasStrings } from '@/lib/chaturmas-i18n'

const feedbackSchema = z.object({
  note: z.string().trim().min(1, 'Say a little more').max(280, 'Keep it under 280 characters'),
})

type FeedbackValues = z.infer<typeof feedbackSchema>

interface FeedbackFormProps {
  uid?: string
  day: number | null
  strings: ChaturmasStrings
}

export function FeedbackForm({ uid, day, strings }: FeedbackFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { note: '' },
  })

  const onSubmit = async (values: FeedbackValues) => {
    if (!uid || !day) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'chaturmasFeedback'), {
        uid,
        day,
        date: todayKey(),
        note: values.note,
        createdAt: serverTimestamp(),
      })
      form.reset()
      toast.success(strings.feedbackThanks)
    } catch (error) {
      console.error('Error submitting Chaturmas feedback:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{strings.feedbackPrompt}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder={strings.feedbackPrompt} maxLength={280} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={submitting || !uid} className="self-end">
              {submitting ? '...' : strings.feedbackSubmit}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
