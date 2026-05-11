-- Kids filters: gender + age_range, applies only when category='kids'
alter table public.listings
  add column if not exists gender text check (gender in ('boys','girls','unisex')),
  add column if not exists age_range text check (age_range in ('0-2','3-5','6-9','10-12'));

-- Enforce: gender/age_range only allowed when category = 'kids'
alter table public.listings drop constraint if exists listings_kids_fields_only_for_kids;
alter table public.listings
  add constraint listings_kids_fields_only_for_kids
  check (
    (category = 'kids' or (gender is null and age_range is null))
  );

create index if not exists idx_listings_gender on public.listings(gender);
create index if not exists idx_listings_age_range on public.listings(age_range);
