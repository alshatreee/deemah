-- 001_initial.sql
-- Baseline migration covering the fully-synced post-007 schema state.
-- Use this as the single source of truth on a fresh database. Migrations 002-006
-- have been archived under ./archive/ (kept for history). 007_orders_indexes.sql
-- remains active but is idempotent (CREATE INDEX IF NOT EXISTS).

-- Deemah Database Schema
-- Run in Supabase SQL Editor
-- Reflects migrations 001 (base) through 007 (orders indexes) as a fresh baseline.
-- Includes: auth integration, RLS, indexes, kids filters, orders RLS with WITH CHECK.

-- ============================================
-- EXTENSIONS
-- ============================================
create extension if not exists "uuid-ossp";
create extension if not exists btree_gist;

-- ============================================
-- USERS PROFILE (extends auth.users)
-- ============================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  phone text,
  avatar_url text,
  bio text,
  city text default 'الكويت',
  rating numeric(2,1) default 0,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, full_name, username)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- LISTINGS (sales only; rentals removed in migration 005)
-- ============================================
create table if not exists public.listings (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null check (category in ('women','men','kids','accessories','shoes','bags')),
  brand text,
  size text,
  color text,
  condition text check (condition in ('new','like_new','good','fair')),
  price_buy numeric(10,3) not null check (price_buy > 0),
  -- Kids filters (migration 004): only allowed when category = 'kids'
  gender text check (gender in ('boys','girls','unisex')),
  age_range text check (age_range in ('0-2','3-5','6-9','10-12')),
  images text[] default array[]::text[],
  status text default 'active' check (status in ('draft','active','sold','archived')),
  views_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Kids fields are only allowed when category = 'kids'
alter table public.listings drop constraint if exists listings_kids_fields_only_for_kids;
alter table public.listings
  add constraint listings_kids_fields_only_for_kids
  check (
    (category = 'kids' or (gender is null and age_range is null))
  );

create index if not exists idx_listings_owner on public.listings(owner_id);
create index if not exists idx_listings_category on public.listings(category);
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_listings_gender on public.listings(gender);
create index if not exists idx_listings_age_range on public.listings(age_range);
-- Trigram full-text search indexes (migration 009)
create extension if not exists pg_trgm;
create index if not exists idx_listings_title_trgm
  on public.listings using gin (title gin_trgm_ops);
create index if not exists idx_listings_description_trgm
  on public.listings using gin (description gin_trgm_ops);
create index if not exists idx_listings_brand_trgm
  on public.listings using gin (brand gin_trgm_ops);
alter table public.listings add column if not exists searchable_text text
  generated always as (
    coalesce(title, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(brand, '')
  ) stored;
create index if not exists idx_listings_searchable_text_trgm
  on public.listings using gin (searchable_text gin_trgm_ops);


-- ============================================
-- ORDERS (sales)
-- ============================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.users(id) on delete cascade,
  amount numeric(10,3) not null,
  status text default 'pending' check (status in ('pending','paid','shipped','delivered','cancelled','refunded')),
  payment_id text,
  shipping_address jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_id on public.orders(payment_id);
-- Migration 007: support buyer/listing lookups
create index if not exists idx_orders_buyer on public.orders(buyer_id);
create index if not exists idx_orders_listing on public.orders(listing_id);

-- ============================================
-- MESSAGES
-- ============================================
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_receiver on public.messages(receiver_id);

-- ============================================
-- REVIEWS
-- ============================================
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  target_id uuid not null references public.users(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- ============================================
-- TRANSACTIONS
-- ============================================
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('payout','earning','refund','fee')),
  amount numeric(10,3) not null,
  status text default 'pending' check (status in ('pending','completed','failed')),
  reference_id uuid,
  description text,
  created_at timestamptz default now()
);

-- Idempotency: a webhook with the same reference_id+type cannot duplicate
alter table public.transactions drop constraint if exists transactions_unique_reference;
alter table public.transactions
  add constraint transactions_unique_reference
  unique (reference_id, type);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.users enable row level security;
alter table public.listings enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.transactions enable row level security;

-- USERS policies
drop policy if exists "Public profiles are viewable" on public.users;
create policy "Public profiles are viewable" on public.users
  for select using (true);

drop policy if exists "Users update own profile" on public.users;
create policy "Users update own profile" on public.users
  for update using (auth.uid() = id);

-- LISTINGS policies
drop policy if exists "Active listings are public" on public.listings;
create policy "Active listings are public" on public.listings
  for select using (status = 'active' or auth.uid() = owner_id);

drop policy if exists "Owners insert listings" on public.listings;
create policy "Owners insert listings" on public.listings
  for insert with check (auth.uid() = owner_id);

drop policy if exists "Owners update own listings" on public.listings;
create policy "Owners update own listings" on public.listings
  for update using (auth.uid() = owner_id);

drop policy if exists "Owners delete own listings" on public.listings;
create policy "Owners delete own listings" on public.listings
  for delete using (auth.uid() = owner_id);

-- ORDERS policies
drop policy if exists "Users see own orders" on public.orders;
create policy "Users see own orders" on public.orders
  for select using (
    auth.uid() = buyer_id
    or auth.uid() in (select owner_id from public.listings where id = listing_id)
  );

drop policy if exists "Users create orders" on public.orders;
create policy "Users create orders" on public.orders
  for insert with check (auth.uid() = buyer_id);

-- Orders UPDATE with WITH CHECK (migration 006): buyer cannot self-mark as paid
drop policy if exists "Sellers update orders on their listings" on public.orders;
create policy "Sellers update orders on their listings" on public.orders
  for update
  to authenticated
  using (
    auth.uid() = buyer_id
    or auth.uid() in (select owner_id from public.listings where id = listing_id)
  )
  with check (
    -- Seller can advance shipping state
    (auth.uid() in (select owner_id from public.listings where id = listing_id)
      and status in ('shipped','delivered','cancelled','refunded'))
    or
    -- Buyer can only cancel (before paid) or confirm delivered (after shipped)
    (auth.uid() = buyer_id and status in ('cancelled','delivered'))
  );

-- MESSAGES policies
drop policy if exists "Users see own messages" on public.messages;
create policy "Users see own messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users send messages" on public.messages;
create policy "Users send messages" on public.messages
  for insert with check (auth.uid() = sender_id);

drop policy if exists "Users mark received messages read" on public.messages;
create policy "Users mark received messages read" on public.messages
  for update using (auth.uid() = receiver_id);

-- REVIEWS policies
drop policy if exists "Reviews are public" on public.reviews;
create policy "Reviews are public" on public.reviews
  for select using (true);

drop policy if exists "Users write reviews" on public.reviews;
create policy "Users write reviews" on public.reviews
  for insert with check (auth.uid() = author_id);

-- TRANSACTIONS policies
-- Note: webhook inserts use service_role which bypasses RLS (intentional).
drop policy if exists "Users see own transactions" on public.transactions;
create policy "Users see own transactions" on public.transactions
  for select using (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true),
       ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies
drop policy if exists "Public read listings images" on storage.objects;
create policy "Public read listings images" on storage.objects
  for select using (bucket_id in ('listings','avatars'));

drop policy if exists "Auth users upload images" on storage.objects;
create policy "Auth users upload images" on storage.objects
  for insert with check (
    bucket_id in ('listings','avatars')
    and auth.role() = 'authenticated'
  );

drop policy if exists "Users update own images" on storage.objects;
create policy "Users update own images" on storage.objects
  for update using (auth.uid()::text = owner::text);

drop policy if exists "Users delete own images" on storage.objects;
create policy "Users delete own images" on storage.objects
  for delete using (auth.uid()::text = owner::text);

-- ============================================
-- LISTING STATUS TRANSITIONS (paid → sold)
-- ============================================
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

-- ============================================
-- REALTIME PUBLICATION
-- ============================================
do $$
begin
  begin execute 'alter publication supabase_realtime add table public.messages'; exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.listings'; exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.users'; exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.orders'; exception when others then null; end;
end$$;
