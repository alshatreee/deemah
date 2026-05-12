-- Migration 008: enforce positive price + non-null on listings.price_buy
-- Prevents 0 KWD or NULL price listings from being created or appearing in the UI.
-- Applied to production DB on 2026-05-12.

alter table public.listings alter column price_buy set not null;

alter table public.listings drop constraint if exists listings_price_buy_positive;
alter table public.listings
  add constraint listings_price_buy_positive
  check (price_buy > 0);
