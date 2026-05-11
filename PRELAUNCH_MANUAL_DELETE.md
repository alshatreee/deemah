# Manual Deletion Required

OneDrive FUSE blocked `rm`/`unlink` from the agent shell. The files below have been **truncated to zero bytes** (content removed, no longer referenced anywhere in the codebase) but the empty files/directories themselves must be deleted manually via Windows Explorer or PowerShell.

## Paths to remove

Run this from PowerShell at the project root:

```powershell
Remove-Item -Recurse -Force .deleted_bookings
Remove-Item -Force lib\bookings.ts
Remove-Item -Recurse -Force app\bookings
Remove-Item -Force app\listings\[id]\booking-form.tsx
Remove-Item -Recurse -Force app\checkout\booking
```

## What was emptied

- `lib/bookings.ts` (0 bytes)
- `app/bookings/actions.ts` (0 bytes)
- `app/bookings/[id]/actions-client.tsx` (0 bytes)
- `app/listings/[id]/booking-form.tsx` (0 bytes)
- `.deleted_bookings/*.{ts,tsx}` (all 5 files, 0 bytes)
- `app/checkout/booking/[id]/` (already empty directory)

## Migration archive cleanup

After verifying `001_initial.sql` works on a fresh DB, also remove the no-op
stubs at `supabase/migrations/002_payments.sql` through `006_p1_rls_with_check.sql`
(their full content is preserved under `supabase/migrations/archive/`):

```powershell
Remove-Item supabase\migrations\002_payments.sql,
            supabase\migrations\003_p0_fixes.sql,
            supabase\migrations\004_kids_filters.sql,
            supabase\migrations\005_remove_rentals.sql,
            supabase\migrations\006_p1_rls_with_check.sql
```

After deletion `supabase\migrations\` should contain only `001_initial.sql`,
`007_orders_indexes.sql`, and the `archive\` folder.

## Verification after manual delete

```powershell
# Should print nothing
Get-ChildItem -Recurse -Include *.ts,*.tsx app, lib | Select-String "from .*bookings|from .*booking-form|from .*actions-client"
```
