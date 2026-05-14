-- Migration 016: track listing views for sellers
-- views_count already exists in 001. Add increment RPC for atomic counting.

create or replace function public.increment_listing_views(p_listing_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.listings
     set views_count = coalesce(views_count, 0) + 1
   where id = p_listing_id;
$$;

grant execute on function public.increment_listing_views(uuid) to anon, authenticated;
