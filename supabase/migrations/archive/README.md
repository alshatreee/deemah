# Archived migrations

These migrations are kept for historical context only. They are **not** run by
Supabase CLI because they live in a subdirectory (the CLI only scans top-level
`*.sql` files in `supabase/migrations/`).

## Why archived?

Migrations 002-006 were authored against the original "rentals + bookings"
schema. That schema is gone. Their final state is captured in
`../001_initial.sql`, which is the single source of truth for fresh databases.

| File | Purpose |
|------|---------|
| `002_payments.sql` | Added bookings/orders extras + payment columns. |
| `003_p0_fixes.sql` | P0 race/idempotency/listing-status triggers. |
| `004_kids_filters.sql` | Added `gender` + `age_range` to listings. |
| `005_remove_rentals.sql` | Dropped bookings table, rental columns, `rented` status. |
| `006_p1_rls_with_check.sql` | Tightened orders UPDATE RLS with WITH CHECK. |

`007_orders_indexes.sql` is still active at the top level (idempotent `CREATE
INDEX IF NOT EXISTS`).

## To run on a fresh DB

```sh
supabase db reset
# applies: 001_initial.sql, then 007_orders_indexes.sql
```

The top-level `002`-`006` files in this branch are no-op stubs (a single SQL
comment) so even if the CLI does pick them up, nothing happens. They should be
deleted manually; FUSE blocked `rm` in the agent run.
