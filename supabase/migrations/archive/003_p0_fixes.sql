-- P0 fixes migration
-- Required extensions
create extension if not exists btree_gist;

-- ===========================================================
-- #5 Booking overlap race: exclusion constraint via daterange
--    Prevents two pending/confirmed/paid/active bookings on the
--    same listing from overlapping. Cancelled/completed are excluded.
-- ===========================================================
alter table public.bookings drop constraint if exists bookings_no_overlap;
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    listing_id with =,
    daterange(from_date, to_date, '[]') with &&
  )
  where (status in ('pending','confirmed','paid','active'));

-- ===========================================================
-- #6 Webhook idempotency: a transaction with the same
--    reference_id + type can only exist once (per listing/order).
-- ===========================================================
alter table public.transactions drop constraint if exists transactions_unique_reference;
alter table public.transactions
  add constraint transactions_unique_reference
  unique (reference_id, type);

-- ===========================================================
-- #8 Messages UPDATE policy: receiver can mark read_at
-- ===========================================================
drop policy if exists "Users mark received messages read" on public.messages;
create policy "Users mark received messages read" on public.messages
  for update using (auth.uid() = receiver_id);

-- ===========================================================
-- #3 Listing status transition triggers
--    On INSERT into orders → does NOT change listing yet (only after paid)
--    On UPDATE orders.status -> 'paid' → set listing.status = 'sold'
--    On UPDATE bookings.status -> 'paid' or 'active' → set listing.status = 'rented'
--    On bookings.status -> 'completed' or 'cancelled' (and no other active book) → 'active'
-- ===========================================================
create or replace function public.handle_order_paid()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (tg_op = 'UPDATE' and new.status = 'paid' and old.status <> 'paid') then
    update public.listings
       set status = 'sold', updated_at = now()
     where id = new.listing_id
       and status = 'active';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_orders_paid_listing on public.orders;
create trigger trg_orders_paid_listing
  after update on public.orders
  for each row execute function public.handle_order_paid();

create or replace function public.handle_booking_state()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  has_active_books boolean;
begin
  if (tg_op = 'UPDATE') then
    -- Reserve listing while booking is active/paid
    if new.status in ('paid','active') and old.status not in ('paid','active') then
      update public.listings
         set status = 'rented', updated_at = now()
       where id = new.listing_id and status = 'active';
    end if;
    -- When a booking ends, release the listing if no others hold it
    if new.status in ('completed','cancelled') and old.status in ('paid','active','confirmed','pending') then
      select exists(
        select 1 from public.bookings
         where listing_id = new.listing_id
           and status in ('paid','active')
           and id <> new.id
      ) into has_active_books;
      if not has_active_books then
        update public.listings
           set status = 'active', updated_at = now()
         where id = new.listing_id and status = 'rented';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bookings_listing_state on public.bookings;
create trigger trg_bookings_listing_state
  after update on public.bookings
  for each row execute function public.handle_booking_state();
