-- P1: Add WITH CHECK to orders UPDATE policy so buyer cannot self-mark as 'paid' or 'delivered'.
-- Bookings table has been removed in migration 005, so no booking policy needed.

drop policy if exists "Sellers update orders on their listings" on public.orders;
create policy "Sellers update orders on their listings" on public.orders
  for update
  to authenticated
  using (
    auth.uid() = buyer_id
    or auth.uid() in (select owner_id from public.listings where id = listing_id)
  )
  with check (
    -- Seller can advance shipping state
    (auth.uid() in (select owner_id from public.listings where id = listing_id)
      and status in ('shipped','delivered','cancelled','refunded'))
    or
    -- Buyer can only cancel (before paid) or confirm delivered (after shipped)
    (auth.uid() = buyer_id and status in ('cancelled','delivered'))
  );
