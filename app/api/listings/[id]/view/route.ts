import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Best-effort; ignore errors
  await supabase.rpc('increment_listing_views', { p_listing_id: id }).then(() => null, () => null)
  return NextResponse.json({ ok: true })
}
