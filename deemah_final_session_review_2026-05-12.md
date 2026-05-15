# Deemah — Independent Session Audit (2026-05-12)

Scope: 3 commits today (6bfd0fd, 6122579, 5d0ebcb) + out-of-band production SQL.
Read-only audit; no files modified. All paths absolute.

---

## 1. Codex blockers landed correctly — PASS

- `app/listings/[id]/page.tsx:79` — JSON-LD output is wrapped exactly with
  `JSON.stringify(productJsonLd).replace(/</g, '\\u003c')`. The escape character
  in source is the literal four-char sequence `<` (back-slash, u, 003c),
  which Node serializes as `<` in the rendered script tag — XSS-safe.
- `lib/messages.ts:3` `import { z } from 'zod'`.
- `lib/messages.ts:5` `const uuidSchema = z.string().uuid()`.
- `lib/messages.ts:76-77` inside `fetchThread`:
  `const safePartnerId = uuidSchema.parse(partnerId)` /
  `const safeUserId = uuidSchema.parse(userId)`, placed BEFORE the
  `.or(...)` filter at line 81-83 which interpolates only `safeUserId` /
  `safePartnerId`. Inputs validated; PostgREST injection vector closed.

## 2. Migration 008 + 001 alignment — PASS

- `supabase/migrations/008_listings_price_positive.sql` exists (11 lines):
  `alter table … set not null`, `drop constraint if exists …`, then
  `add constraint listings_price_buy_positive check (price_buy > 0)`. Idempotent.
- `supabase/migrations/001_initial.sql:70` —
  `price_buy numeric(10,3) not null check (price_buy > 0),`. Exact match to brief.
- `supabase/schema.sql:64` — same line, same shape. Aligned.

## 3. Rental text in user-facing copy — PARTIAL (2 leaks)

Grep for `تأجير|إيجار|أجّر|للإيجار|rental` across the repo. Acceptable matches
in archive/, audit `.md` history, schema comments. **Two live leaks remain:**

1. `components/layout/footer.tsx:32` — brand description still reads
   "بيعي **وأجّري** ملابسك الراقية". Footer is rendered on every page via
   `components/layout/footer.tsx` (imported by every public page). HIGH-VISIBILITY.
2. `components/marketing/offer-countdown.tsx:64` — h2
   "خصم يصل إلى 30% **على الإيجار**". Grep across the project for
   `offer-countdown` finds **no importer** — dead component, not currently
   rendered. LOW risk but should be deleted or rewritten before launch.

All other public pages (`app/layout.tsx`, `app/page.tsx`, `app/faq/page.tsx`,
`app/how-it-works/page.tsx`, `app/terms/page.tsx`,
`components/home/*`, `app/listings/[id]/page.tsx`) are clean.

## 4. SEO files valid — PASS

- `app/sitemap.ts:4-5` references `process.env.NEXT_PUBLIC_SITE_URL` with
  fallback `https://deemah.com`. Pulls active listings from Supabase, falls back
  gracefully on error. Returns `MetadataRoute.Sitemap`. Type-correct.
- `app/robots.ts:3-4` uses same env var, disallows `/api/`, `/dashboard/`,
  `/messages/`, `/orders/`, `/profile/`, `/checkout/`. Returns sitemap URL +
  host. Type-correct.
- `app/listings/[id]/page.tsx:47-71` builds full `Product` JSON-LD with
  `@context`, `@type`, name, description, image[], url, sku, category,
  optional brand, optional `offers` (price, KWD, availability). Injected at
  line 78-81. Escape per §1.

## 5. No broken references — PASS

- `app/bookings/`, `app/checkout/booking/`, `lib/bookings.ts`,
  `app/listings/[id]/booking-form.tsx` — none exist on disk
  (confirmed via `find` + `ls`).
- `grep` for `from\s+['"\`].*booking` over `app/`, `lib/`, `components/` —
  **zero matches** in live code (only hits in stale audit `.md`s and the cached
  `build-output.log`).
- `build-output.log` is stale (mtime 2026-05-11 22:37) and pre-dates the
  booking-route deletion — not load-bearing.

## 6. TypeScript clean — UNVERIFIED in this audit environment

Could not run `tsc --noEmit`: the Linux mount has an incomplete
`node_modules` (Windows install), and the `tsc` binary fails with
`Cannot find module '../lib/tsc.js'`. Sources read manually compile-check:
no obvious type errors in modified files (`app/listings/[id]/page.tsx`,
`lib/messages.ts`, `app/sitemap.ts`, `app/robots.ts`). The cached
`build-output.log` from 2026-05-11 22:37 reports `Compiled successfully`
and `Finished TypeScript` but pre-dates today's commits — informational only.
Recommend: run `npx tsc --noEmit` on Windows host before push to confirm.

## 7. Secret leaks — PASS

- `SUPABASE_SERVICE_ROLE_KEY` referenced only in server-only files:
  `app/register/actions.ts:68`, `app/api/payments/dev-simulate/route.ts:18`,
  `app/api/payments/tap/webhook/route.ts:28` — all server actions / route
  handlers. None of these carry `'use client'`.
- `TAP_SECRET_KEY` referenced only in `lib/payments/tap.ts` (server module).
- Grep across all `*.tsx`/`*.ts` for `NEXT_PUBLIC_.*(SECRET|SERVICE_ROLE|PRIVATE)` —
  zero matches.
- `.gitignore:11` ignores `.env*.local`. `git ls-files` shows only
  `.env.local.example` is tracked; no actual `.env.local` in repo.

## 8. Git state — PASS (with note)

- `git log --oneline -5` confirms top 3 commits exactly:
  `5d0ebcb db: enforce listings.price_buy > 0 NOT NULL`,
  `6122579 security: escape JSON-LD output + validate UUID inputs in fetchThread`,
  `6bfd0fd Pre-launch: cleanup + SEO + baseline migration`.
- `git status` from the Linux mount shows almost every file as `M` — this is a
  FUSE/CRLF artefact (`git diff lib/messages.ts` returns identical content with
  only EOL differences). On the Windows host the working tree is clean.
- Untracked: `codex_fixes.patch`, `migration_008.patch` — expected scratch patches.

## 9. Migrations apply cleanly — PASS

Order on a fresh DB: `001_initial.sql` → `007_orders_indexes.sql` →
`008_listings_price_positive.sql`.

- 001 already defines `price_buy … not null check (price_buy > 0)`.
- 008 `alter … set not null` is a no-op on a NOT-NULL column.
- 008 `drop constraint if exists listings_price_buy_positive` is safe (the 001
  check is anonymous, so the named constraint won't exist yet).
- 008 then `add constraint listings_price_buy_positive check (price_buy > 0)` —
  adds a second equivalent check, which Postgres accepts (named constraint
  coexists with the anonymous one). Functionally correct, slightly redundant.
- No duplicate table definitions, no conflicting RLS, no broken FKs.

On the **production DB** (where the original schema was 002-006 historical),
the out-of-band SQL (`ALTER … SET NOT NULL`, `ADD CONSTRAINT … CHECK (> 0)`)
matches migration 008 exactly. The `DELETE FROM listings WHERE title ILIKE …`
cleanup is also reflected — no live rental rows.

---

## Overall verdict — PASS with one launch-blocker

The three commits and the production SQL are internally consistent, well-formed,
and the codex blockers are correctly implemented. SEO, JSON-LD escape, UUID
validation, and the NOT NULL/CHECK constraint are all in place. Migrations are
ordered, idempotent, and aligned with `schema.sql`.

### Must fix before launch

- **`components/layout/footer.tsx:32`** still says "بيعي **وأجّري** ملابسك" —
  this footer renders on every public page. Replace with sale-only copy.

### Should fix (not blocking)

- **`components/marketing/offer-countdown.tsx:64`** — dead component with
  rental copy. Either delete the file or rewrite the headline.
- **`build-output.log`** is stale and references the deleted `/bookings/*`
  routes; either regenerate or delete it from the repo.
- **TS check** could not be run in this sandbox — confirm `npx tsc --noEmit`
  exits 0 on the Windows host before push.
- Migration 008 adds a named CHECK that duplicates the anonymous CHECK in
  001. Harmless, but for a clean schema you could drop the inline check from
  001 and rely on 008 for the named constraint.
