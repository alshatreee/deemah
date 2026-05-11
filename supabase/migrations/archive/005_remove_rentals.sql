-- Remove rentals entirely.
-- BACKUP NOTE: take a manual dump of public.bookings before running this in prod.

-- Drop triggers + exclusion constraint first
drop trigger if exists trg_bookings_listing_state on public.bookings;
drop function if exists public.handle_booking_state();

alter table if exists public.bookings drop constraint if exists bookings_no_overlap;

-- Drop bookings table cascade (also removes RLS policies + indexes)
drop table if exists public.bookings cascade;

-- Remove from realtime publication if present
do $$
begin
  begin execute 'alter publication supabase_realtime drop table public.bookings'; exception when others then null; end;
end$$;

-- Remove rental columns + flags from listings
alter table public.listings drop column if exists price_rent_per_day;
alter table public.listings drop column if exists is_for_rent;
alter table public.listings drop column if exists is_for_sale;

-- Tighten status enum: drop 'rented' from listing status
alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings
  add constraint listings_status_check
  check (status in ('draft','active','sold','archived'));

-- Any prior listing with status='rented' should be moved back to active
update public.listings set status='active' where status='rented';

-- Drop any leftover rental-style transactions
delete from public.transactions where description ilike '%تأجير%' or description ilike '%rental%';
