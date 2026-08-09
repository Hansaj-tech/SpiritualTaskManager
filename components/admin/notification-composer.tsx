'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { KSHETRA_OPTIONS } from '@/lib/constants'

export function NotificationComposer() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetKshetra, setTargetKshetra] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSend = async () => {
    if (!user || !title.trim() || !body.trim()) return
    setSending(true)
    setResult(null)
    try {
      const idToken = await user.getIdToken()
      const res = await fetch('/api/fcm/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          targetKshetra: targetKshetra || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to send')
      setResult(`Sent to ${data.sent} device${data.sent === 1 ? '' : 's'}.`)
      setTitle('')
      setBody('')
    } catch (error) {
      console.error('Error sending notification:', error)
      setResult('Something went wrong — please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-orange-400">
        Sends a push notification to everyone who has enabled reminders, or just one Kshetra.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-orange-900">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder="e.g. Sabha tonight at 7pm"
            className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-white text-sm text-orange-900 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-orange-900">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="Keep it short — this shows as a phone notification"
            className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-white text-sm text-orange-900 placeholder-orange-300 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-orange-900">Send to</label>
          <select
            value={targetKshetra}
            onChange={(e) => setTargetKshetra(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-white text-sm text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="">Everyone</option>
            {KSHETRA_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {k} only
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={sending || !title.trim() || !body.trim()}
        className="self-start flex items-center gap-2 h-11 px-5 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        {sending ? 'Sending…' : 'Send Notification'}
      </button>

      {result && <p className="text-sm text-orange-500">{result}</p>}
    </div>
  )
}
