# Deemah — Final Independent Review

> **Date:** 2026-05-11
> **Reviewer:** Independent read-only audit (no code modifications)
> **Stack:** Next.js 16.2.4 (App Router) · React 19 · TypeScript 5.7 · Supabase (auth + Postgres + Storage + Realtime) · Tap Payments
> **Scope of pass:** post-Phase-2 + 9 P0 fixes + migrations 004 (kids), 005 (remove rentals), 006 (orders RLS WITH CHECK) + webhook hardening (HMAC, amount validation, 401 on bad sig)

---

## TL;DR

`npx tsc --noEmit` is **clean (exit 0)**. The application code reflects the rentals-removal cleanly — no live runtime references to `bookings`, `is_for_rent`, or `rented`. The four new migrations (003–006) are internally consistent.

**Two real defects remain:**

1. **`supabase/schema.sql` is NOT synced.** It still defines the `bookings` table, `is_for_rent`/`is_for_sale`/`price_rent_per_day`/`rented` status, booking triggers, and booking RLS — exactly the state migrations 005 explicitly removes. Anyone who reads the schema first (per its own header comment "Run in Supabase SQL Editor") will reintroduce the dropped objects.
2. **Home page + static pages still advertise rentals** ("للإيجار" badges, `type: "rent"` in demo data, "تأجير" copy in `/how-it-works`, `/faq`, `/terms`, layout description, hero CTA, `how-it-works.tsx`). End users will see a rental UX that no longer exists in the data layer.

Plus one stale-but-dead branch: `app/api/payments/tap/return/route.ts:11` still inspects `kind === 'booking'` and redirects to `/bookings/${id}` — harmless because `create` never sets that kind, and `/bookings` is now `notFound()`, but it is dead code that contradicts the cleanup.

**Production readiness: ~85%** — core flow (auth → listing → checkout → Tap → webhook → paid → shipped → delivered) is solid; the gaps are documentation drift and surface UI text.

---

## Scope-item verdicts

### 1. Migrations integrity + `schema.sql` sync — **PARTIAL**

Migration files audited individually:

| File | Verdict | Notes |
|---|---|---|
| `supabase/migrations/002_payments.sql` | PASS as a Phase-2 step; **superseded** by 005 (bookings-related blocks become no-ops once the table is dropped). |
| `supabase/migrations/003_p0_fixes.sql` | PASS as a P0 step; bookings parts also superseded by 005. The orders trigger (`handle_order_paid`) remains valid. |
| `supabase/migrations/004_kids_filters.sql` | **PASS** — adds `gender`/`age_range` columns with CHECK constraints, the kids-only constraint (`category = 'kids' OR (gender IS NULL AND age_range IS NULL)`), and indexes on both. Internally consistent. |
| `supabase/migrations/005_remove_rentals.sql` | **PASS** — drops trigger + function + exclusion constraint first, then `bookings cascade`, removes from realtime, drops `price_rent_per_day` / `is_for_rent` / `is_for_sale` columns, tightens `listings_status_check` to `('draft','active','sold','archived')`, repairs any rows with `status='rented'`, deletes rental-style transactions. Order is correct. |
| `supabase/migrations/006_p1_rls_with_check.sql` | **PASS** — `orders` UPDATE policy gets `to authenticated` + WITH CHECK splitting seller-allowed states (`shipped/delivered/cancelled/refunded`) from buyer-allowed states (`cancelled/delivered`). Prevents buyer from self-marking paid. |

**No `001_*.sql` exists.** The intended base is `supabase/schema.sql`, but that file is **out of sync**:

- `schema.sql:64-66` — still has `price_rent_per_day`, `is_for_sale`, `is_for_rent` columns.
- `schema.sql:68` — still allows `'rented'` in `listings.status` CHECK constraint.
- `schema.sql:81-107` — still creates `public.bookings` table + indexes + exclusion constraint.
- `schema.sql:181, 214-230` — still enables RLS and defines bookings policies.
- `schema.sql:330-365` — still defines `handle_booking_state()` and `trg_bookings_listing_state` trigger.
- `schema.sql:375` — still adds `bookings` to realtime publication.
- `schema.sql` has **no `gender` / `age_range` columns**, no `listings_kids_fields_only_for_kids` constraint, and **no WITH CHECK** on the orders UPDATE policy.

**Evidence:** `supabase/schema.sql` lines 64–107, 181, 214–230, 330–365, 375.

**Recommendation:** Either regenerate `schema.sql` from current DB state (`pg_dump --schema-only`), or replace its content with a hand-rolled post-005/006 baseline that:
- removes the `bookings` table block,
- drops `price_rent_per_day`/`is_for_sale`/`is_for_rent` columns from listings,
- tightens `listings.status` CHECK to `('draft','active','sold','archived')`,
- adds `gender`/`age_range` columns + indexes + kids-only check,
- rewrites the orders UPDATE policy with the same WITH CHECK as 006,
- removes `bookings` from the realtime publication block.

Until then, anyone running `schema.sql` on a fresh DB then trying to run 004–006 will hit either redundant work or, worse, end up with a DB that doesn't match the app (e.g., a fresh `schema.sql` deploy without 005 will leave the bookings table that has no app code to support it; with 005 it will work but the wasted DDL is a confusing first-impression).

### 2. Code consistency — no rentals references — **PARTIAL**

**Live code (TS/TSX excluding stubs):** `Grep` against `\b(bookings|is_for_rent|booking|rental|price_rent_per_day|is_for_sale)\b` over `**/*.{ts,tsx}` returns **zero matches that exercise the dropped table or columns**. Stubs are intentional placeholders:
- `lib/bookings.ts` — `export {}` only.
- `app/bookings/page.tsx` and `app/bookings/[id]/page.tsx` — `notFound()`.
- `app/bookings/actions.ts` — empty `'use server'`.
- `app/bookings/[id]/actions-client.tsx` — returns `null`.
- `app/checkout/booking/[id]/page.tsx` — `notFound()`.
- `app/listings/[id]/booking-form.tsx` — `return null` stub.

**Stale dead code:**
- `app/api/payments/tap/return/route.ts:11` —
  ```ts
  kind === 'booking' ? `/bookings/${id ?? ''}` : kind === 'order' ? `/orders/${id ?? ''}` : '/dashboard'
  ```
  The `'booking'` branch is unreachable (no caller sets `kind=booking`; `/bookings/${id}` resolves to `notFound()`), but the literal should be deleted.

**UI/UX copy still advertising rentals:**
- `app/layout.tsx:14` — site meta description: "بيع وتأجير الملابس الراقية".
- `components/home/hero-section.tsx:19, 25` — "اشتري وأجّري" h1, "بيعي وأجّري ملابسك" subtitle.
- `components/home/how-it-works.tsx:33` — "ثلاث خطوات بسيطة لبدء بيع أو تأجير أزيائك".
- `components/home/featured-listings.tsx:13, 37, 49, 96, 101, 138` — three of four demo cards have `type: "rent"` with "للإيجار" badge and "/يوم" suffix.
- `components/listings/product-card.tsx:13, 52, 57, 110` — `ProductCardProps.type: "rent" | "sale"`; only `sale` is ever passed from `/listings/page.tsx:138` (`type="sale"` hard-coded), so dead branch in this component but it still types the API.
- `app/faq/page.tsx:18-19` — Q: "هل التأجير متاح؟" A: "نعم، يمكنك تأجير قطعك أو استئجار قطع".
- `app/how-it-works/page.tsx:22, 35` — "بعد إتمام البيع أو الإيجار", "البيع أو التأجير على ديمة".
- `app/terms/page.tsx:30` — "ديمة منصة لبيع وتأجير قطع الأزياء".

**Recommendation:** Update copy to "بيع" only (or remove rental wording). Delete `'booking'` branch in `app/api/payments/tap/return/route.ts`. Simplify `ProductCardProps.type` to `'sale'` only (or drop the prop entirely) and remove rent-branches from `product-card.tsx` and the demo array in `featured-listings.tsx`. Optionally delete the now-unused stub files (`app/bookings`, `app/checkout/booking`, `lib/bookings.ts`, `app/listings/[id]/booking-form.tsx`).

### 3. TypeScript `tsc --noEmit` — **PASS**

Run from `/sessions/eager-sharp-cerf/mnt/dima_final` with `npx tsc --noEmit`:

```
EXIT_CODE=0
```

No type errors, no warnings emitted. `tsconfig.json` has `strict: true`.

### 4. Kids filter end-to-end — **PASS**

| Layer | Evidence | Status |
|---|---|---|
| **DB** | `supabase/migrations/004_kids_filters.sql:2-15` adds `gender text check (in ('boys','girls','unisex'))`, `age_range text check (in ('0-2','3-5','6-9','10-12'))`, the kids-only check constraint, and two indexes. | OK |
| **Types** | `lib/types.ts:15-16` defines `KidsGender` + `KidsAgeRange`; `lib/types.ts:43-44` adds them to `Listing`. | OK |
| **Form (new + edit)** | `app/listings/new/listing-form.tsx:38-39, 67-73, 172-202` — gender/age selects render only when `category === 'kids'`; on submit, fields are deleted when category changes. | OK |
| **Server action** | `app/listings/new/actions.ts:12-13, 24-25, 29-36, 87-88, 133-134` — Zod enums for `GENDERS`/`AGE_RANGES`, two `.refine()` rules requiring both when `category==='kids'`, and the insert/update payloads explicitly null out kids fields when category is not kids. | OK |
| **Query** | `lib/listings.ts:18-19, 48-49` — filters pass `gender`/`age_range` as `.eq()` clauses. | OK |
| **Sidebar filter** | `components/listings/listings-filter.tsx:33-44, 65, 148-200` — `GENDERS` and `AGE_RANGES` constants, the kids accordion section only renders when `currentCategory === 'kids'`, and selecting a non-kids category in `selectCategory` (lines 84-94) clears gender/age URL params. | OK |
| **URL → query parsing** | `app/listings/page.tsx:35-72` — `VALID_GENDERS`/`VALID_AGES`, the parsed values are only kept when `cat === 'kids'`. Defense-in-depth even if the DB check constraint already enforces it. | OK |
| **Listing detail badges** | `app/listings/[id]/page.tsx:21-25, 100-105` — shows gender label + age range only for kids category. | OK |

### 5. RLS policies — **PASS for code-of-record (migrations), FAIL in `schema.sql`**

Migration `006` provides the post-fix orders policy. Reading the migrations as the source of truth, the final RLS picture is:

- **users:** SELECT public (line 187-190 of `schema.sql`); UPDATE limited to `auth.uid() = id`. OK.
- **listings:** SELECT for active or owner; INSERT/UPDATE/DELETE only by owner. OK.
- **bookings:** dropped by 005, no policies needed.
- **orders:** SELECT for buyer or seller (owner of listing); INSERT with buyer_id check; **UPDATE with WITH CHECK** (006_p1) restricting buyer to `cancelled/delivered` and seller to `shipped/delivered/cancelled/refunded` — closes the buyer-self-marks-paid hole.
- **messages:** SELECT for sender or receiver; INSERT with sender_id check; UPDATE for receiver (read_at) — covered by 003.
- **reviews:** SELECT public, INSERT for author. OK.
- **transactions:** SELECT for owner; INSERT via service_role only (webhook bypasses RLS). The `(reference_id, type)` unique constraint provides idempotency.

**Issue:** None of this is reflected in `schema.sql`. The file still has the old orders UPDATE policy without WITH CHECK at lines 244-249, still has bookings policies at 214-230, etc. (Same root cause as scope item 1.)

**Recommendation:** Re-sync `schema.sql`; consider adding an explicit `transactions INSERT` policy comment block so it's clear the omission is intentional (service_role only).

### 6. Webhook security — **PASS**

`app/api/payments/tap/webhook/route.ts`:

- **HMAC verify**: lines 106-123. When `tapConfigured()` is true, reads the `hashstring` (or `x-tap-signature`) header and calls `verifyWebhookSignature` from `lib/payments/tap.ts:130-157`. The verifier rebuilds the canonical Tap string `x_id…x_amount…x_currency…x_gateway_reference…x_payment_reference…x_status…x_created` using HMAC-SHA256 over `TAP_SECRET_KEY` and does a `crypto.timingSafeEqual` constant-time compare. Returns **401** on missing or mismatched signature.
- **Bad JSON**: lines 93-99 → **400 "invalid json"**.
- **Missing id**: lines 101-104 → **400 "no id"**.
- **Missing/invalid metadata**: lines 137-144 → **400 "missing metadata"** (only `kind === 'order'` is accepted post-rentals-removal).
- **Retrieve failure**: lines 125-131 → **502** with no DB write.
- **Amount + currency validation**: lines 67-76 — `Math.abs(expectedAmount - actualAmount) > 0.001 || charge.currency !== 'KWD'` returns `ok: false, error: 'amount mismatch'` (then route returns **400**). KWD has 3 decimal places, so tolerance 0.001 is correct.
- **Idempotency**: three layers
  1. Lines 62-64 — pre-check: if order status is already `paid`, `shipped`, or `delivered`, returns `{ ok: true }` no-op.
  2. `transactions_unique_reference` unique constraint on `(reference_id, type)` from migration 003 — second webhook with same `target_id` + `'earning'` errors with `23505`.
  3. Lines 48-50 in `insertEarningOnce` — explicit ignore of error code `23505`.
- **Tap charge re-fetch**: line 127 — even with signed payload, the route re-fetches the charge from Tap (`retrieveCharge`) and validates `isPaid(charge.status)`. Defense-in-depth.

**One small note:** the signature canonical-string construction relies on values from the original webhook body (`payload.amount`, `payload.currency`, etc.) but the **amount comparison** uses `charge.amount` returned by `retrieveCharge`. That's correct because the canonical string is for *Tap-side authenticity*, while the amount check is against authoritative server-fetched data. Belt + suspenders.

### 7. Types vs DB schema — **PASS**

`lib/types.ts:13` defines `ListingStatus = 'draft' | 'active' | 'sold' | 'archived'` — exactly matches the post-005 CHECK constraint. `lib/types.ts:32-50` `Listing` interface has no `is_for_sale`, no `is_for_rent`, no `price_rent_per_day` — matches the post-005 column set, and adds `gender` + `age_range` matching migration 004. `OrderStatus` (lines 84-91) matches the orders status CHECK. No `Booking` type exists.

No `any` usage. `Grep` of `\bany\b` in `**/*.{ts,tsx}` returned only the word "any" in a doc comment (`lib/storage.ts:29`), not a type annotation. `:` and `<>` searches for `any` type came back empty.

The one type-system shortcut used in two places is explicit and clearly commented:
- `lib/orders.ts:11, 18, 31, 38, 45, 52` — `(data ?? []) as unknown as OrderWithListing[]` because the Supabase generic for embedded joins is loose. Going through `unknown` is the safer cast.
- `app/api/payments/tap/webhook/route.ts:83-86` and `app/api/payments/dev-simulate/route.ts:90-92` — `(order as unknown as { listings: ... })` to handle the Supabase embed result, which can be `T | T[] | null` depending on join cardinality. The runtime branch on `Array.isArray` handles both shapes.

### 8. Security (secrets, .gitignore, XSS, SQLi) — **PASS**

- **Server-only secrets:**
  - `SUPABASE_SERVICE_ROLE_KEY` referenced only in `app/register/actions.ts`, `app/api/payments/dev-simulate/route.ts`, `app/api/payments/tap/webhook/route.ts` — all server-side files.
  - `TAP_SECRET_KEY` only in `lib/payments/tap.ts`, which is marked `import 'server-only'` (line 1) so Next would error if it ever got pulled into a client bundle.
  - `RESEND_API_KEY` is declared in `.env.local.example` but not actually consumed anywhere yet — no leak risk.
  - `NEXT_PUBLIC_*` is restricted to `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SITE_URL` — correct.
- **`.gitignore`:** `.env*.local` is excluded (line 11). `git ls-files | grep .env` returns nothing; `git check-ignore .env.local` confirms it is ignored.
- **XSS:** Only one `dangerouslySetInnerHTML` in the entire codebase (`components/ui/chart.tsx:83`), wired to CSS variables computed from an internal `THEMES`/`ChartConfig` object — no user input touches it. All user text (`message.body`, `listing.title/description`, profile fields) renders as text children, which React escapes by default. `whitespace-pre-wrap` is the only formatting concession.
- **SQL injection:** Every query goes through `@supabase/ssr` builder methods (`.eq()`, `.ilike()`, `.in()`, `.gte()`, `.lte()`) — parameterized at the PostgREST level. The only places that build SQL-like fragments are:
  - `lib/messages.ts:11` — `or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)` — `userId` is a UUID from `supabase.auth.getUser()` (server-controlled, RLS-restricted), never user input.
  - `lib/messages.ts:77` — same pattern with `partnerId` from a Next route param. RLS still restricts results and the route guards via `requireUser`. UUID format isn't validated client-side but the PostgREST builder rejects malformed UUIDs.
- **Webhook 401:** confirmed in scope item 6.
- **Auth middleware:** `middleware.ts` + `lib/supabase/middleware.ts:32-47` redirect unauthenticated users from `/profile`, `/dashboard*`, `/messages*`, `/orders*`, `/checkout*`, `/listings/new`, `/listings/[id]/edit` to `/login?redirectTo=…`. `/bookings*` is no longer in the matcher list (correct — it's gone). The auth check uses `supabase.auth.getUser()`, the safe path.
- **Signout:** `app/api/auth/signout/route.ts` is POST-only and runs `supabase.auth.signOut()`. No CSRF token; for a session-cookie sign-out this is acceptable but a sameOrigin check or Origin header validation would harden it.

### 9. UX (empty states, RTL, loading) — **PASS**

- **RTL:** `app/layout.tsx:36` `<html lang="ar" dir="rtl">`. All Tailwind layouts are direction-agnostic. Spot checks of pages (header, dashboard, listings, orders, messages) show no LTR-only assumptions in the layout.
- **Empty states:** every list/grid screen has one:
  - `/listings` (`app/listings/page.tsx:123-129`) — "لا توجد قطع مطابقة حالياً" + CTA.
  - `/dashboard` (`app/dashboard/page.tsx:129-132, 173-177`) — listing and messages empty states.
  - `/messages` (`app/messages/page.tsx:32-38`) — "لا توجد محادثات بعد" + link.
  - `/messages/[id]` (`app/messages/[id]/thread-client.tsx:91-93`) — "لا توجد رسائل بعد".
  - `/orders` (`app/orders/page.tsx:64-68, 77-81`) — separate empty states for buyer/seller.
  - `/dashboard/earnings` (`app/dashboard/earnings/page.tsx:97-99`) — empty state.
  - `/profile/[username]` (`app/profile/[username]/page.tsx:113-115`) — "لا قطع منشورة".
- **Loading indicators:**
  - All client forms use `useTransition` and disable buttons with localized text ("جارٍ الحفظ…", "جارٍ الإنشاء…", "جارٍ التحويل…").
  - Image uploads have an inline "جارٍ الرفع…" state.
- **Error surfacing:** every Server Action returns `{ error?: string }` and clients render it as `<p className="text-sm text-destructive">`. Errors are Arabic-localized.
- **Optimistic UI:** `messages/[id]/thread-client.tsx:64-83` adds an optimistic message then removes it on failure.

### 10. Performance (Server Components, Realtime cleanup, indexes) — **PASS**

- **Server Components by default:** only 10 client components total (`Grep` confirmed): `app/_payments/pay-client.tsx`, `app/bookings/[id]/actions-client.tsx` (stub), `app/checkout/[listingId]/checkout-form.tsx`, `app/register/page.tsx`, `app/login/page.tsx`, `app/listings/[id]/buy-button.tsx`, `app/profile/profile-form.tsx`, `app/orders/[id]/actions-client.tsx`, `app/messages/[id]/thread-client.tsx`, `app/listings/new/listing-form.tsx`. Each is required for stateful UI.
- **Realtime cleanup:** the only `supabase.channel()` is in `app/messages/[id]/thread-client.tsx:33-54`. Its `useEffect` returns `() => { void supabase.removeChannel(channel) }` — cleaned up on unmount and on `meId`/`partnerId` change.
- **Indexes (per `schema.sql` + migrations):**
  - `listings`: owner_id, category, status (schema.sql 74-76), gender + age_range (004), price_rent_per_day index would have been useful but column dropped.
  - `orders`: status, payment_id (schema 124-125, 002).
  - `messages`: sender_id, receiver_id (schema 140-141).
  - `transactions`: unique on (reference_id, type) (003).
  - **Gap:** no index on `orders.buyer_id` even though `fetchMyOrdersAsBuyer` filters by it. Postgres can still use a seq scan; for low row counts it's fine, but production scale will want one. Similarly `orders.listing_id` is queried via `in()` in `fetchMyOrdersAsSeller` — already FK-indexed by Postgres on the referencing side? No — Postgres does not auto-index FK source columns. Worth adding `idx_orders_listing` and `idx_orders_buyer`.

**Recommendation (P2):** add `create index if not exists idx_orders_buyer on public.orders(buyer_id); create index if not exists idx_orders_listing on public.orders(listing_id);` in a follow-up migration.

---

## Overall verdict

**Code: PASS.** TS is clean, no `any`, no rental references in live code, no `bookings` table reads in the runtime, RLS hardened, webhook secure (HMAC + amount + idempotency + 401/400), Realtime cleaned up, kids filter wired end-to-end across DB → types → form → query → URL params → sidebar UI.

**Documentation/UX: PARTIAL.** Two surface-level inconsistencies prevent calling the rentals-removal "done":
1. `supabase/schema.sql` is the old schema and contradicts migrations 004–006.
2. Marketing copy and demo data on the home page + static info pages still promise rentals.

These are not technical defects in the running app, but a user who reads the public site will be misled about what the platform offers, and a future operator who runs `schema.sql` first will reintroduce the bookings table.

---

## Prioritized punch list

### P1 — fix before launch

1. **Re-sync `supabase/schema.sql`** so it matches the post-006 database. Remove the bookings block, the `is_for_rent`/`is_for_sale`/`price_rent_per_day` columns, the `'rented'` literal in the status check, the booking trigger/function, and the bookings entry in the realtime publication. Add the `gender`/`age_range` columns + the kids-only constraint + their indexes. Replace the orders UPDATE policy with the WITH-CHECK version from 006. _(File: `supabase/schema.sql`, ~80 lines of edits.)_

2. **Strip rental copy from public-facing pages:**
   - `app/layout.tsx:14` — remove "وتأجير" from meta description.
   - `components/home/hero-section.tsx:19, 25` — drop "وأجّري".
   - `components/home/how-it-works.tsx:33` — drop "أو تأجير".
   - `app/how-it-works/page.tsx:22, 35` — drop "أو الإيجار" / "أو التأجير".
   - `app/terms/page.tsx:30` — drop "وتأجير".
   - `app/faq/page.tsx:18-19` — remove the "هل التأجير متاح؟" Q/A entry.

3. **Replace rental demo cards on the home page.** `components/home/featured-listings.tsx:8-57` — change `type: "rent"` to `"sale"` for items 1/3/4 (or replace the demo array with a server-rendered fetch of real listings, which would also kill the dead-code rental branch in `product-card.tsx`).

### P2 — clean-up (low risk, do soon)

4. **Delete dead `'booking'` branch** in `app/api/payments/tap/return/route.ts:11`. Replace the ternary with just `kind === 'order' ? \`/orders/${id ?? ''}\` : '/dashboard'`.

5. **Simplify `ProductCard`.** `components/listings/product-card.tsx:13, 52-58, 110-112` — make `type` required-`'sale'` (or drop it). All call sites already hard-code `type="sale"`.

6. **Remove now-empty stub files** (optional but tidies the tree): `lib/bookings.ts`, `app/bookings/`, `app/checkout/booking/`, `app/listings/[id]/booking-form.tsx`. They are not imported by anything except `app/bookings/[id]/actions-client.tsx` which itself is dead.

7. **Add missing indexes** on `orders.buyer_id` and `orders.listing_id` (P2 migration `007_orders_indexes.sql`).

### P3 — nice-to-have

8. Tighten signout to validate `Origin` header (CSRF defense-in-depth) — `app/api/auth/signout/route.ts`.
9. Implement forgot-password flow (still missing from previous review).
10. Add app-level rate limiting to `/register` and `/login` server actions.
11. Email confirmation flow — current registration uses admin endpoint with `email_confirm: true`, allowing signup with arbitrary emails the user does not control.

---

## Appendix — TypeScript check output

```
$ cd /sessions/eager-sharp-cerf/mnt/dima_final && npx tsc --noEmit; echo "EXIT_CODE=$?"
EXIT_CODE=0
```

No errors, no warnings. `tsconfig.json` has `strict: true`, `noEmit: true`, `isolatedModules: true`.
