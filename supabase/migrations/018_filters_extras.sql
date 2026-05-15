-- 018_filters_extras.sql
-- Adds: area (Kuwait governorates), original_price (discount display),
-- sub_category, delivery_method, delivery_fee, and useful indexes.

-- ===== AREA (Kuwait governorates) =====
do $$ begin
  create type public.kw_area as enum (
    'capital',     -- العاصمة
    'hawalli',     -- حولي
    'farwaniya',   -- الفروانية
    'mubarak',     -- مبارك الكبير
    'ahmadi',      -- الأحمدي
    'jahra'        -- الجهراء
  );
exception when duplicate_object then null; end $$;

alter table public.listings
  add column if not exists area public.kw_area;

alter table public.users
  add column if not exists default_area public.kw_area;

create index if not exists listings_area_idx on public.listings (area);

-- ===== ORIGINAL PRICE =====
alter table public.listings
  add column if not exists original_price numeric(10,3);

do $$ begin
  alter table public.listings
    add constraint listings_original_price_chk
      check (original_price is null or original_price >= price_buy);
exception when duplicate_object then null; end $$;

-- ===== SUB-CATEGORY =====
alter table public.listings
  add column if not exists sub_category text;

create index if not exists listings_sub_category_idx on public.listings (sub_category);

-- ===== DELIVERY =====
do $$ begin
  create type public.delivery_method as enum (
    'meet_in_person',
    'seller_delivery',
    'courier'
  );
exception when duplicate_object then null; end $$;

alter table public.listings
  add column if not exists delivery_method public.delivery_method default 'meet_in_person',
  add column if not exists delivery_fee numeric(10,3) default 0;

-- ===== INDEXES =====
create index if not exists listings_color_idx on public.listings (color);
create index if not exists listings_brand_idx on public.listings (brand);
create index if not exists listings_condition_idx on public.listings (condition);
