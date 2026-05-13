-- Migration 009: trigram full-text search on listings
-- Enables fast LIKE/ILIKE queries on title + description + brand.

create extension if not exists pg_trgm;

create index if not exists idx_listings_title_trgm
  on public.listings using gin (title gin_trgm_ops);

create index if not exists idx_listings_description_trgm
  on public.listings using gin (description gin_trgm_ops);

create index if not exists idx_listings_brand_trgm
  on public.listings using gin (brand gin_trgm_ops);

-- Optional: combined searchable_text generated column for unified search
alter table public.listings drop column if exists searchable_text;
alter table public.listings add column searchable_text text
  generated always as (
    coalesce(title, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(brand, '')
  ) stored;

create index if not exists idx_listings_searchable_text_trgm
  on public.listings using gin (searchable_text gin_trgm_ops);
