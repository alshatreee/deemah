import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  // Use service role to delete the auth user (cascades to public.users via FK)
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // Cleanup user data first (archives listings, deletes public.users row → cascades)
  const { error: cleanupError } = await admin.rpc('cleanup_user_data', { p_user_id: user.id })
  if (cleanupError) {
    return NextResponse.json(
      { error: 'تعذر تنظيف البيانات: ' + cleanupError.message },
      { status: 500 },
    )
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
  if (deleteError) {
    return NextResponse.json(
      { error: 'تعذر حذف الحساب: ' + deleteError.message },
      { status: 500 },
    )
  }

  // Sign out current session
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
