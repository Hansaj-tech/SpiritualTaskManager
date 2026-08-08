'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAnnouncements, createAnnouncement, deleteAnnouncement } from '@/lib/announcements'

const KSHETRA_OPTIONS = [
  'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'K10', 'K11', 'K12'
]

const ALL_USERS = 'all'

export function NotificationComposer() {
  const { user } = useAuth()
  const { announcements, loading } = useAnnouncements()
  const [message, setMessage] = useState('')
  const [kshetra, setKshetra] = useState(ALL_USERS)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!message.trim() || !user?.email) return
    setSending(true)
    try {
      await createAnnouncement(user.email, message.trim(), kshetra === ALL_USERS ? null : kshetra)
      toast.success('Notification sent')
      setMessage('')
      setKshetra(ALL_USERS)
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id)
      toast.success('Notification removed')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to remove notification')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Notification</CardTitle>
        <CardDescription>Broadcast a message to all users, or target a single Kshetra.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Message</Label>
          <Textarea
            placeholder="Write an announcement..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-2 sm:w-64">
          <Label>Audience</Label>
          <Select value={kshetra} onValueChange={setKshetra}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_USERS}>All users</SelectItem>
              {KSHETRA_OPTIONS.map((k) => (
                <SelectItem key={k} value={k}>{k} only</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSend} disabled={sending || !message.trim()} className="self-end">
          {sending ? 'Sending...' : 'Send Notification'}
        </Button>

        <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
          <Label className="text-muted-foreground">Sent Notifications</Label>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications sent yet.</p>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
                <div>
                  <p className="text-sm text-foreground">{a.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.kshetra ? `Targeted: ${a.kshetra}` : 'All users'}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
