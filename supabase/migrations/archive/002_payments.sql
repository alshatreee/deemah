-- Phase 2 migration: bookings/orders extras + payments support

-- =========================================================
-- BOOKINGS extras
-- =========================================================
alter table public.bookings
  add column if not exists payment_id text,
  add column if not exists updated_at timestamptz default now();

-- Booking status now includes 'paid'
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check
  check (status in ('pending','confirmed','paid','active','completed','cancelled'));

create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_payment_id on public.bookings(payment_id);

-- Owner can SEE bookings against their listings (already in v1 select)
-- Owner can UPDATE bookings against their listings (confirm/cancel)
drop policy if exists "Owners update bookings on their listings" on public.bookings;
create policy "Owners update bookings on their listings" on public.bookings
  for update using (
    auth.uid() in (select owner_id from public.listings where id = listing_id)
    or auth.uid() = renter_id
  );

-- =========================================================
-- ORDERS extras
-- =========================================================
alter table public.orders
  add column if not exists shipping_address jsonb,
  add column if not exists updated_at timestamptz default now();

-- Sellers can update orders (mark shipped/delivered)
drop policy if exists "Sellers update orders on their listings" on public.orders;
create policy "Sellers update orders on their listings" on public.orders
  for update using (
    auth.uid() in (select owner_id from public.listings where id = listing_id)
    or auth.uid() = buyer_id
  );

create index if not exists idx_orders_payment_id on public.orders(payment_id);
create index if not exists idx_orders_status on public.orders(status);

-- =========================================================
-- TRANSACTIONS extras (allow service-role insert via webhook)
-- =========================================================
alter table public.transactions
  add column if not exists description text;

-- Insert policy not needed: webhook uses service_role which bypasses RLS.
-- =========================================================
-- Realtime: bookings + orders for instant dashboard refresh
-- =========================================================
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.bookings';
  exception when duplicate_object then null; end;
  begin
    execute 'alter publication supabase_realtime add table public.orders';
  exception when duplicate_object then null; end;
end$$;
