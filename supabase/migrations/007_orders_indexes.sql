-- P2: Add missing indexes on orders to support buyer/listing lookups.
-- Postgres does not auto-index FK source columns; queries like
-- fetchMyOrdersAsBuyer (filters by buyer_id) and fetchMyOrdersAsSeller
-- (filters via listing_id IN (...)) benefit from these.

create index if not exists idx_orders_buyer on public.orders(buyer_id);
create index if not exists idx_orders_listing on public.orders(listing_id);
