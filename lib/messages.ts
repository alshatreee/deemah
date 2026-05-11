import { createClient } from '@/lib/supabase/server'
import type { ConversationSummary, Message, UserProfile } from '@/lib/types'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

const PARTNER_SELECT = 'id, username, full_name, avatar_url'

export async function fetchConversations(userId: string): Promise<ConversationSummary[]> {
  const supabase = await createClient()
  const { data: msgs, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('[fetchConversations] error:', error.message)
    return []
  }

  const messages = (msgs ?? []) as Message[]
  const byPartner = new Map<string, ConversationSummary>()

  for (const m of messages) {
    const partnerId = m.sender_id === userId ? m.receiver_id : m.sender_id
    const existing = byPartner.get(partnerId)
    const isUnreadForMe = m.receiver_id === userId && !m.read_at
    if (!existing) {
      byPartner.set(partnerId, {
        partner_id: partnerId,
        partner: null,
        last_message: m,
        unread_count: isUnreadForMe ? 1 : 0,
      })
    } else if (isUnreadForMe) {
      existing.unread_count += 1
    }
  }

  const partnerIds = Array.from(byPartner.keys())
  if (partnerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('users')
      .select(PARTNER_SELECT)
      .in('id', partnerIds)
    const profMap = new Map<
      string,
      Pick<UserProfile, 'id' | 'username' | 'full_name' | 'avatar_url'>
    >()
    for (const p of (profiles ?? []) as Pick<
      UserProfile,
      'id' | 'username' | 'full_name' | 'avatar_url'
    >[]) {
      profMap.set(p.id, p)
    }
    for (const conv of byPartner.values()) {
      conv.partner = profMap.get(conv.partner_id) ?? null
    }
  }

  return Array.from(byPartner.values()).sort((a, b) =>
    b.last_message.created_at.localeCompare(a.last_message.created_at),
  )
}

export async function fetchThread(
  userId: string,
  partnerId: string,
): Promise<{
  messages: Message[]
  partner: Pick<UserProfile, 'id' | 'username' | 'full_name' | 'avatar_url'> | null
}> {
  const supabase = await createClient()
  const safePartnerId = uuidSchema.parse(partnerId)
  const safeUserId = uuidSchema.parse(userId)
  const { data: msgs, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${safeUserId},receiver_id.eq.${safePartnerId}),and(sender_id.eq.${safePartnerId},receiver_id.eq.${safeUserId})`,
    )
    .order('created_at', { ascending: true })
    .limit(500)

  if (error) {
    console.error('[fetchThread] error:', error.message)
  }

  const { data: partner } = await supabase
    .from('users')
    .select(PARTNER_SELECT)
    .eq('id', partnerId)
    .maybeSingle()

  // Mark inbound messages as read — only if there's actually unread inbound work.
  // Avoids a write round-trip on every thread view.
  const inboundUnread = (msgs ?? []).some(
    (m) => m.sender_id === partnerId && m.receiver_id === userId && !m.read_at,
  )
  if (inboundUnread) {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', partnerId)
      .eq('receiver_id', userId)
      .is('read_at', null)
  }

  return {
    messages: (msgs ?? []) as Message[],
    partner:
      (partner as Pick<UserProfile, 'id' | 'username' | 'full_name' | 'avatar_url'>) ?? null,
  }
}
