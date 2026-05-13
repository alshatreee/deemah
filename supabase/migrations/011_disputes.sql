-- Migration 011: dispute/refund requests on orders
create table if not exists public.disputes (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  opened_by uuid not null references public.users(id) on delete cascade,
  reason text not null check (reason in ('not_received','damaged','not_as_described','other')),
  description text,
  status text default 'open' check (status in ('open','reviewing','resolved_refund','resolved_release','closed')),
  resolution_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_disputes_order on public.disputes(order_id);
create index if not exists idx_disputes_status on public.disputes(status);

alter table public.disputes enable row level security;

-- Buyer or seller of the order can see disputes
drop policy if exists "Users see own disputes" on public.disputes;
create policy "Users see own disputes" on public.disputes
  for select using (
    auth.uid() = opened_by
    or auth.uid() in (
      select buyer_id from public.orders where id = order_id
      union
      select l.owner_id from public.orders o
        join public.listings l on l.id = o.listing_id
       where o.id = order_id
    )
  );

-- Only buyer of the order can open a dispute
drop policy if exists "Buyer opens dispute" on public.disputes;
create policy "Buyer opens dispute" on public.disputes
  for insert with check (
    auth.uid() = opened_by
    and auth.uid() in (select buyer_id from public.orders where id = order_id)
  );

-- Disputes can only be updated by service_role (admin) — no user-facing update policy
