-- Migration 014: per-user wishlist of favorite listings

create table if not exists public.wishlists (
  user_id uuid not null references public.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, listing_id)
);

create index if not exists idx_wishlists_user on public.wishlists(user_id);
create index if not exists idx_wishlists_listing on public.wishlists(listing_id);

alter table public.wishlists enable row level security;

drop policy if exists "Users manage own wishlist" on public.wishlists;
create policy "Users see own wishlist" on public.wishlists
  for select using (auth.uid() = user_id);

create policy "Users insert into own wishlist" on public.wishlists
  for insert with check (auth.uid() = user_id);

create policy "Users delete from own wishlist" on public.wishlists
  for delete using (auth.uid() = user_id);

-- Aggregate count cache (denormalized for perf)
alter table public.listings add column if not exists favorites_count int default 0;

create or replace function public.trg_wishlist_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.listings set favorites_count = favorites_count + 1
     where id = new.listing_id;
  elsif tg_op = 'DELETE' then
    update public.listings set favorites_count = greatest(favorites_count - 1, 0)
     where id = old.listing_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_wishlist_count_update on public.wishlists;
create trigger trg_wishlist_count_update
  after insert or delete on public.wishlists
  for each row execute function public.trg_wishlist_count();
