'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { sendMessageAction } from './actions'
import type { Message } from '@/lib/types'

interface ThreadClientProps {
  meId: string
  partnerId: string
  initialMessages: Message[]
  listingId?: string
}

export function ThreadClient({
  meId,
  partnerId,
  initialMessages,
  listingId,
}: ThreadClientProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`thread:${meId}:${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${meId}`,
        },
        (payload) => {
          const m = payload.new as Message
          if (m.sender_id !== partnerId) return
          setMessages((prev) =>
            prev.some((x) => x.id === m.id) ? prev : [...prev, m],
          )
        },
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [meId, partnerId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length])

  function onSubmit(form: FormData) {
    const text = String(form.get('body') ?? '').trim()
    if (!text) return
    setError(null)
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      sender_id: meId,
      receiver_id: partnerId,
      listing_id: listingId ?? null,
      body: text,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    setBody('')
    startTransition(async () => {
      const result = await sendMessageAction(form)
      if (result?.error) {
        setError(result.error)
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            لا توجد رسائل بعد — ابدئي المحادثة
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === meId
            return (
              <div
                key={m.id}
                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                    mine
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  }`}
                >
                  {m.body}
                </div>
              </div>
            )
          })
        )}
      </div>

      <form action={onSubmit} className="border-t p-3 flex gap-2 items-end">
        <input type="hidden" name="receiver_id" value={partnerId} />
        {listingId && <input type="hidden" name="listing_id" value={listingId} />}
        <Textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="اكتبي رسالة…"
          rows={2}
          className="resize-none"
        />
        <Button type="submit" disabled={isPending || !body.trim()}>
          إرسال
        </Button>
      </form>
      {error && <p className="text-xs text-destructive px-3 pb-2">{error}</p>}
    </div>
  )
}
