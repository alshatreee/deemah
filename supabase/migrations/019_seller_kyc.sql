-- 019_seller_kyc.sql
-- KYC verification for sellers + authenticity check on listings.

alter table public.users
  add column if not exists kyc_doc_url text,
  add column if not exists kyc_full_name text,
  add column if not exists kyc_phone text,
  add column if not exists kyc_submitted_at timestamptz,
  add column if not exists authenticated_at timestamptz,
  add column if not exists authenticated_by uuid references public.users(id) on delete set null;

create index if not exists users_authenticated_idx on public.users (authenticated_at)
  where authenticated_at is not null;

-- ===== Authenticity check on listings =====
do $$ begin
  create type public.authenticity_status as enum (
    'none',
    'in_review',
    'verified',
    'rejected'
  );
exception when duplicate_object then null; end $$;

alter table public.listings
  add column if not exists authenticity_status public.authenticity_status default 'none',
  add column if not exists authenticity_verified_at timestamptz,
  add column if not exists authenticity_verified_by uuid references public.users(id) on delete set null,
  add column if not exists proof_photos jsonb default '[]'::jsonb,
  add column if not exists purchase_year int,
  add column if not exists defects text;

create index if not exists listings_authenticity_idx on public.listings (authenticity_status)
  where authenticity_status = 'verified';

-- ===== Private bucket for KYC docs (insert if missing) =====
insert into storage.buckets (id, name, public)
  values ('kyc-docs', 'kyc-docs', false)
  on conflict (id) do nothing;

-- Owner can upload to their folder
do $$ begin
  drop policy if exists "kyc_owner_insert" on storage.objects;
  create policy "kyc_owner_insert" on storage.objects for insert
    with check (
      bucket_id = 'kyc-docs'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  drop policy if exists "kyc_owner_select" on storage.objects;
  create policy "kyc_owner_select" on storage.objects for select
    using (
      bucket_id = 'kyc-docs'
      and (
        (storage.foldername(name))[1] = auth.uid()::text
        or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
      )
    );
end $$;

-- ===== Admin can read all users.kyc_* (already covered by admin policies; explicit policy for safety) =====
-- (No new policy needed; existing admin policy on public.users grants read access.)
