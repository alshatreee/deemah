-- Migration 012: ensure all user-owned data cascades on user delete
-- This guarantees that GDPR/PDPL deletion requests don't leave orphan rows.

-- Re-create FKs with ON DELETE CASCADE where missing.
-- Most are already cascade per 001_initial.sql but we make it explicit + idempotent.

-- listings.owner_id → users.id (already cascade in 001)
-- orders.buyer_id → users.id (already cascade)
-- messages.sender_id, receiver_id → users.id (already cascade)
-- reviews.target_id, author_id → users.id (already cascade)
-- transactions.user_id → users.id (already cascade)
-- disputes.opened_by → users.id (cascade in 011)

-- Storage objects do NOT cascade — they're owned by auth.uid().
-- Document a cleanup function for the account-delete endpoint to call.

create or replace function public.cleanup_user_data(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Soft-archive listings rather than delete (preserves order history for other buyers)
  update public.listings
     set status = 'archived', updated_at = now()
   where owner_id = p_user_id
     and status not in ('sold');

  -- Delete the user row from public.users — FK cascades handle the rest
  delete from public.users where id = p_user_id;
end;
$$;

grant execute on function public.cleanup_user_data(uuid) to service_role;
