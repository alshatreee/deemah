-- Block/report system: users can block other users
create table if not exists public.blocks (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid not null references public.users(id) on delete cascade,
  blocked_id  uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint blocks_no_self_block check (blocker_id <> blocked_id),
  constraint blocks_unique unique (blocker_id, blocked_id)
);

-- Index for fast lookup
create index if not exists blocks_blocker_id_idx on public.blocks(blocker_id);
create index if not exists blocks_blocked_id_idx on public.blocks(blocked_id);

-- RLS
alter table public.blocks enable row level security;

-- Blocker can see their own blocks
create policy "blocks_select_own" on public.blocks
  for select using (auth.uid() = blocker_id);

-- Blocker can insert their own blocks
create policy "blocks_insert_own" on public.blocks
  for insert with check (auth.uid() = blocker_id);

-- Blocker can delete their own blocks (unblock)
create policy "blocks_delete_own" on public.blocks
  for delete using (auth.uid() = blocker_id);
