-- Migration 013: admin role + seller_status + rating aggregation

-- Add role column to public.users
alter table public.users add column if not exists role text default 'user' check (role in ('user','admin'));
create index if not exists idx_users_role on public.users(role) where role = 'admin';

-- Add seller_status to control marketplace participation
alter table public.users add column if not exists seller_status text default 'approved'
  check (seller_status in ('pending','approved','suspended','banned'));
create index if not exists idx_users_seller_status on public.users(seller_status);

-- Tighten listings INSERT: only approved sellers can create listings
drop policy if exists "Owners insert listings" on public.listings;
create policy "Owners insert listings" on public.listings
  for insert with check (
    auth.uid() = owner_id
    and exists (
      select 1 from public.users
       where id = auth.uid()
         and seller_status = 'approved'
    )
  );

-- Recompute users.rating from reviews
create or replace function public.recompute_user_rating(p_target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  avg_rating numeric(2,1);
begin
  select coalesce(round(avg(rating)::numeric, 1), 0)
    into avg_rating
    from public.reviews
   where target_id = p_target_id;

  update public.users
     set rating = avg_rating, updated_at = now()
   where id = p_target_id;
end;
$$;

create or replace function public.trg_reviews_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or tg_op = 'UPDATE' then
    perform public.recompute_user_rating(new.target_id);
  elsif tg_op = 'DELETE' then
    perform public.recompute_user_rating(old.target_id);
  end if;
  return null;
end;
$$;

drop trigger if exists trg_reviews_recompute_rating on public.reviews;
create trigger trg_reviews_recompute_rating
  after insert or update or delete on public.reviews
  for each row execute function public.trg_reviews_rating();

-- Reviews UPDATE/DELETE policies (author can edit own review)
drop policy if exists "Authors update own reviews" on public.reviews;
create policy "Authors update own reviews" on public.reviews
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "Authors delete own reviews" on public.reviews;
create policy "Authors delete own reviews" on public.reviews
  for delete using (auth.uid() = author_id);

-- Admin can read+update everything (RLS bypass for service_role is already there;
-- this lets logged-in admins use anon key safely on admin routes)
drop policy if exists "Admin can read all users" on public.users;
create policy "Admin can read all users" on public.users
  for select using (
    exists (
      select 1 from public.users u
       where u.id = auth.uid()
         and u.role = 'admin'
    )
  );

drop policy if exists "Admin can update users" on public.users;
create policy "Admin can update users" on public.users
  for update using (
    exists (
      select 1 from public.users u
       where u.id = auth.uid()
         and u.role = 'admin'
    )
  );

drop policy if exists "Admin can update listings" on public.listings;
create policy "Admin can update listings" on public.listings
  for update using (
    exists (
      select 1 from public.users u
       where u.id = auth.uid()
         and u.role = 'admin'
    )
  );

drop policy if exists "Admin reads all disputes" on public.disputes;
create policy "Admin reads all disputes" on public.disputes
  for select using (
    exists (
      select 1 from public.users u
       where u.id = auth.uid()
         and u.role = 'admin'
    )
  );

drop policy if exists "Admin updates disputes" on public.disputes;
create policy "Admin updates disputes" on public.disputes
  for update using (
    exists (
      select 1 from public.users u
       where u.id = auth.uid()
         and u.role = 'admin'
    )
  );

-- Bootstrap: make alshatreee9@gmail.com an admin if the row exists
do $$
declare
  admin_user_id uuid;
begin
  select id into admin_user_id
    from auth.users
   where email = 'alshatreee9@gmail.com'
   limit 1;
  if admin_user_id is not null then
    update public.users set role = 'admin' where id = admin_user_id;
  end if;
end $$;
