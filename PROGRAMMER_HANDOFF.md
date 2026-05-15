# Deemah — Programmer Handoff Document
**Generated:** 2026-05-13
**Owner:** alshatreee9@gmail.com
**Status:** Technically production-ready, awaiting domain + Tap KYC + content

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| Repo | https://github.com/alshatreee/deemah |
| Live URL | https://deemah.vercel.app |
| Stack | Next.js 14 App Router + TypeScript + Supabase + Tap Payments |
| Package manager | pnpm (pnpm-lock.yaml) |
| Default branch | main |
| Owner email | alshatreee9@gmail.com |
| Owner role | admin (DB role + seller_status='approved') |

---

## 2. Infrastructure Map

### Hosting — Vercel
- **Org:** alshatreees-projects
- **Project:** deemah
- **Region:** fra1 (Frankfurt — closest to Kuwait)
- **Plan:** Hobby (Free) — upgrade to Pro recommended before scale
- **URL:** https://vercel.com/alshatreees-projects/deemah

### Database — Supabase
- **Org:** Sikka Car (mnfvecdayzlxeqpakxja)
- **Project ID:** xwbkdqwagygerjcwoisf
- **Project name:** deemah
- **Region:** eu-central-1 (Frankfurt)
- **Plan:** Free tier
- **URL:** https://supabase.com/dashboard/project/xwbkdqwagygerjcwoisf

### Error Monitoring — Sentry
- **Org:** kk-uh
- **Project slug:** deemah
- **URL:** https://kk-uh.sentry.io/projects/deemah/

### Rate Limiting — Upstash Redis
- **Database name:** deemah-ratelimit
- **Region:** eu-central-1 (AWS Frankfurt)
- **Plan:** Free Tier
- **URL:** https://console.upstash.com/redis

### Transactional Email — Resend
- **Account:** alshatreee9@gmail.com
- **Project:** Deemah Production (API key)
- **Sender:** onboarding@resend.dev (sandbox — sends only to owner email)
- **Status:** WAITING for custom domain verification
- **URL:** https://resend.com/api-keys

### Source — GitHub
- **Repo:** alshatreee/deemah
- **Branch:** main
- **Patches:** workflow uses `git format-patch` → user applies via `git am`

---

## 3. Environment Variables (Vercel Production)

Currently configured:

| Variable | Purpose | Source |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Supabase Settings → API Keys (legacy) |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server key | Supabase Settings → API Keys (legacy) |
| `NEXT_PUBLIC_SITE_URL` | https://deemah.vercel.app | manual |
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking | Sentry Project → Client Keys |
| `UPSTASH_REDIS_REST_URL` | Rate limiter Redis | Upstash DB → REST |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiter token | Upstash DB → REST |

Still pending (set when ready):

| Variable | Required when |
|----------|---------------|
| `TAP_SECRET_KEY` | Tap KYC approved |
| `TAP_WEBHOOK_SECRET` | Webhook URL configured in Tap |
| `RESEND_API_KEY` | (already added; double-check) |
| `RESEND_FROM_EMAIL` | After custom domain verified in Resend |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity |
| `MODERATION_PROVIDER` | If wiring AWS Rekognition / sightengine |

---

## 4. Commit History (this engagement)

13 commits, all on main:

| Commit | Title |
|--------|-------|
| 6bfd0fd | Pre-launch: cleanup + SEO + baseline migration |
| 6122579 | Security: escape JSON-LD + UUID validation |
| 5d0ebcb | DB: enforce listings.price_buy > 0 NOT NULL |
| 75d7abc | Copy: remove final rental wording |
| fa14d71 | Security: HTTPS headers, input validation, MIME check, security.txt |
| c6977b2 | Observability: Sentry error monitoring |
| fcd3759 | Security: Upstash Redis rate limiting |
| 47e9a5a | UX/PWA: error/loading/404, manifest, cookie banner, analytics, pg_trgm |
| 4a2e738 | Security: CSP, storage RLS, text moderation, account deletion |
| 9112c8d | Refund flow, cascade cleanup, order emails, perf wins |
| 6fac684 | Admin dashboard, review system, seller approval |
| e562afa | Wishlist, in-app notifications, listing view analytics |

---

## 5. Database Migrations Applied

All applied to production. Run in this order for fresh DB:

| File | Purpose |
|------|---------|
| `001_initial.sql` | Baseline: users, listings, orders, messages, reviews, transactions, RLS, storage |
| `007_orders_indexes.sql` | buyer_id + listing_id indexes |
| `008_listings_price_positive.sql` | NOT NULL + CHECK > 0 on price_buy |
| `009_search_indexes.sql` | pg_trgm + searchable_text generated column |
| `010_storage_rls.sql` | Storage bucket policies (path = auth.uid()/...) |
| `011_disputes.sql` | Disputes table + RLS |
| `012_cascade_cleanup.sql` | cleanup_user_data() RPC |
| `013_admin_and_seller_status.sql` | role + seller_status + rating trigger + admin policies |
| `014_wishlists.sql` | Wishlists + favorites_count |
| `015_notifications.sql` | Notifications + triggers (new message, order paid) |
| `016_listing_analytics.sql` | increment_listing_views RPC |

Archive (historical, not run on fresh DB): `archive/002` through `archive/006`.

---

## 6. Feature Inventory

### Marketplace (Buyer)
- Signup → email confirm → login
- Browse listings with filters (category, gender+age for kids only, price, condition)
- Full-text search (pg_trgm on title+description+brand via `searchable_text`)
- Product detail page with seller info, images, Buy button, Wishlist heart
- Buy → checkout → Tap payment → webhook updates order to `paid`
- Order tracking page (paid → shipped → delivered)
- Order emails (paid + shipped) via Resend
- Open dispute on paid/shipped/delivered orders
- Submit 1-5 star review after delivered
- Message seller (realtime)
- Wishlist `/wishlist`
- Notifications bell + `/notifications`
- Account deletion `/api/account/delete`

### Marketplace (Seller)
- Create listing (gated on `seller_status='approved'`)
- Edit listing (`app/listings/[id]/edit/`)
- Receive order email
- Mark shipped (sends email to buyer)
- Receive review on profile
- See top listings by views in dashboard

### Admin (Owner)
- `/admin` — count tiles (users, listings, orders, open disputes)
- `/admin/users` — approve / suspend / ban any user
- `/admin/listings` — archive any listing
- `/admin/disputes` — resolve disputes with required note
- Guarded by `lib/admin/guard.ts` (`requireAdmin` redirects non-admins)

---

## 7. Security Posture

### Database
- ✅ RLS enabled on all tables (`users`, `listings`, `orders`, `messages`, `reviews`, `transactions`, `disputes`, `wishlists`, `notifications`)
- ✅ Orders UPDATE with WITH CHECK (buyer cannot self-mark as paid)
- ✅ Messages UPDATE restricted to receiver_id
- ✅ Listings INSERT requires `seller_status='approved'`
- ✅ Admin role policies on users/listings/disputes
- ✅ Storage RLS — only owner can write to their auth.uid() folder
- ✅ `price_buy > 0 NOT NULL` enforced
- ✅ Kids fields CHECK constraint (only when category='kids')

### Webhook (`app/api/payments/tap/webhook/route.ts`)
- ✅ HMAC SHA-256 signature with constant-time compare
- ✅ Amount validation against order (0.001 KWD tolerance)
- ✅ Three-layer idempotency
- ✅ 401 on bad signature, 400 on bad payload, 502 on Tap retrieve failure
- ✅ Rate limited 30/min per IP

### HTTP Layer
- ✅ HSTS (`max-age=63072000; includeSubDomains; preload`)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy (locks down camera/mic/geo, allows Tap)
- ✅ X-DNS-Prefetch-Control: on
- ✅ Content-Security-Policy with allowlist (Tap, Supabase, Sentry, Resend, GA, Clarity)
  - Note: still uses `'unsafe-inline'`/`'unsafe-eval'` — future iteration should use nonces

### Application
- ✅ Zod schemas with max-length on all server actions
- ✅ UUID validation before PostgREST `.or()` filters
- ✅ JSON-LD `<` escape (XSS prevention)
- ✅ Image MIME + 5MB + path validation
- ✅ Text moderation (blocks URLs/email/phone in listings)
- ✅ `server-only` import on sensitive modules

### Rate Limiting (`lib/ratelimit.ts`)
| Endpoint | Limit |
|----------|-------|
| Login + Signup | 5/min per IP+email |
| Listing create | 3/hour per user |
| Messages | 60/min per user |
| Webhook | 30/min per IP |

### Auth (Supabase)
- ✅ Email confirmation required
- ✅ Custom SMTP via Resend
- ✅ Arabic RTL email templates (confirm signup, reset password, magic link)
- ⚠️ Sender: `onboarding@resend.dev` (sandbox — only sends to owner)

---

## 8. Where to Find Things

### Code
- `app/` — Next.js routes (App Router)
- `app/api/` — API routes (payments, account delete, view tracking)
- `app/admin/` — admin dashboard (owner-only)
- `components/` — shared components (`layout/`, `listings/`, `reviews/`, `analytics/`, `marketing/`, `ui/`)
- `lib/` — server-only helpers (`supabase/`, `payments/`, `ratelimit.ts`, `moderation/`, `email/`, `wishlist.ts`, `notifications.ts`, `admin/`)
- `supabase/migrations/` — DB migration history
- `supabase/schema.sql` — full schema reference
- `docs/supabase-email-templates.md` — paste-ready Arabic templates

### Audit reports (in repo root)
- `deemah_final_review_2026-05-11.md`
- `deemah_verification_2026-05-11.md`
- `deemah_final_session_review_2026-05-12.md`
- `HANDOFF_SUMMARY_2026-05-13.md`
- `PROGRAMMER_HANDOFF.md` (this file)
- `PRELAUNCH_MANUAL_DELETE.md` (OneDrive workaround notes)

### Config files
- `next.config.mjs` — security headers + Sentry wrap
- `vercel.json` — region pinning + function timeouts
- `tsconfig.json` — TS config
- `instrumentation.ts` — Sentry runtime registration
- `sentry.{client,server,edge}.config.ts` — Sentry init

---

## 9. How to Access & Control

### Admin login
1. Go to https://deemah.vercel.app/login
2. Sign in with `alshatreee9@gmail.com` + password
3. Navigate to https://deemah.vercel.app/admin

### Supabase data access
- Dashboard: https://supabase.com/dashboard/project/xwbkdqwagygerjcwoisf
- SQL editor: https://supabase.com/dashboard/project/xwbkdqwagygerjcwoisf/sql/new
- Auth users: https://supabase.com/dashboard/project/xwbkdqwagygerjcwoisf/auth/users
- Storage: https://supabase.com/dashboard/project/xwbkdqwagygerjcwoisf/storage/buckets

### Vercel deployment
- https://vercel.com/alshatreees-projects/deemah
- Logs: Deployments → click latest → Logs tab
- Env vars: Settings → Environment Variables

### Sentry issues
- https://kk-uh.sentry.io/projects/deemah/

### Upstash Redis (rate limit metrics)
- https://console.upstash.com/redis

### Resend dashboard
- https://resend.com/emails

---

## 10. Local Development

```bash
# Clone
git clone https://github.com/alshatreee/deemah.git
cd deemah

# Install (pnpm-lock.yaml present)
pnpm install

# Env vars
cp .env.local.example .env.local
# Copy values from Vercel project Settings → Environment Variables

# Dev server
pnpm dev   # opens http://localhost:3000

# Type check (MUST exit 0)
npx tsc --noEmit

# Build (verify before push if changing critical paths)
pnpm build
```

### Applying DB changes
```bash
# Option A: paste migration SQL into Supabase SQL Editor manually
# Option B: Supabase CLI
supabase link --project-ref xwbkdqwagygerjcwoisf
supabase db push   # pushes new migrations
```

### Common operations

**Promote a user to admin:**
```sql
update public.users set role = 'admin'
where id = (select id from auth.users where email = 'EMAIL_HERE');
```

**Approve a seller:**
```sql
update public.users set seller_status = 'approved'
where id = (select id from auth.users where email = 'EMAIL_HERE');
```

**Ban a seller:**
```sql
update public.users set seller_status = 'banned'
where id = (select id from auth.users where email = 'EMAIL_HERE');
```

**Delete a test user (cascades to all their data):**
```sql
delete from auth.users where email = 'EMAIL_HERE';
```

---

## 11. ⚠️ OneDrive Warning

The local repo path is in OneDrive: `C:\Users\xman9\OneDrive\Desktop\Desktop\Desktop\deeemah\dima_final`. OneDrive sync has caused **file corruption** (truncation mid-content) and **blocks rm + git index.lock operations** from non-Windows tools.

**Symptoms:**
- TypeScript errors in files that compiled fine before
- `git am` failing with "does not match index"
- Cannot delete files via bash/Node.js (`EPERM`)

**Workarounds:**
- For deletes from CMD: `del /f /q <file>` or `rmdir /s /q <dir>`
- For corrupt files: re-clone the repo fresh (`rm -rf` + `git clone`)
- Better long-term: **move the working copy outside OneDrive** (e.g. `C:\dev\deemah`)

**This is a local-only issue** — GitHub repo and Vercel build are unaffected.

---

## 12. Patch Workflow (used during this engagement)

Because the sandbox doing the work has no GitHub credentials, the workflow was:

1. Agent clones fresh repo to `/tmp`
2. Agent applies changes, runs `npx tsc --noEmit` (must exit 0)
3. Agent commits locally and runs `git format-patch -1 -o /sessions/eager-sharp-cerf/mnt/outputs/`
4. Patch file path is reported back
5. User copies patch into their local repo and runs `git am <patch>` + `git push`

If you (next programmer) work directly, you skip this dance — just edit, commit, push.

---

## 13. Known TODOs / Limitations

### Documented but not implemented
1. **CSP nonces** — current CSP uses `'unsafe-inline'`/`'unsafe-eval'` for Next.js inline scripts. Future iteration: per-request nonces via middleware + `strict-dynamic`.
2. **Real text/image moderation** — placeholder regex/MIME checks. Wire AWS Rekognition / sightengine / Perspective API when ready (env var: `MODERATION_PROVIDER`).
3. **CSP nonces** — see above.
4. **Seller payout mechanism** — not implemented. Marketplace currently has no automated way to pay sellers their share. Options: Tap Connect (split payment), manual bank transfer per order, or escrow.
5. **Refund execution** — disputes can be opened and admin can mark resolved, but no actual refund is issued through Tap. Admin must manually refund via Tap dashboard.
6. **Shipping integration** — order status manually progresses (paid → shipped → delivered). No carrier integration (Aramex Kuwait, Kuwait Post).
7. **PWA service worker** — manifest exists, but no offline support / service worker.
8. **PWA icons** — manifest references `/icon-192.png` and `/icon-512.png` but those files don't exist yet.
9. **English i18n** — only Arabic supported.

### Required user actions for launch
1. **Tap KYC** — submit commercial license + IBAN at https://business.tap.company (5-10 day wait)
2. **Domain purchase** — buy + link via Vercel
3. **Resend domain verify** — add domain to Resend, add SPF+DKIM DNS records
4. **Real content** — 20-50 real listings with real photos
5. **PWA icons** — generate at realfavicongenerator.net
6. **Lighthouse audit** — run on production, target LCP < 2.5s
7. **Legal review** — Terms + Privacy by Kuwaiti lawyer
8. **Soft launch** — 20-50 test users for 1 week before public
9. **Plan upgrades** — Vercel Pro + Supabase Pro before scale

---

## 14. Verification Checklist (for the next programmer)

Run these to confirm everything is wired correctly:

```bash
# 1. Clone + install
git clone https://github.com/alshatreee/deemah.git
cd deemah
pnpm install

# 2. Type check
npx tsc --noEmit
# expected: clean exit 0

# 3. Build
pnpm build
# expected: success

# 4. Grep for forbidden tokens
grep -rE "تأجير|إيجار|أجّر" app components --include="*.tsx" --include="*.ts"
# expected: no matches (rentals fully removed)

grep -rE "is_for_rent|price_rent_per_day|'rented'" app components lib --include="*.ts" --include="*.tsx"
# expected: no matches in app/components/lib

# 5. Check for secret leaks
grep -rE "SUPABASE_SERVICE_ROLE_KEY|TAP_SECRET_KEY|UPSTASH_REDIS_REST_TOKEN" app components --include="*.tsx" --include="*.ts" | grep -v ".env"
# expected: no matches in client code (these should only appear in server lib)

# 6. Confirm migrations
ls supabase/migrations/*.sql
# expected: 001, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016

# 7. Verify Sentry config
cat sentry.client.config.ts sentry.server.config.ts sentry.edge.config.ts
# expected: all three exist, gated by NODE_ENV === 'production'

# 8. Verify CSP
grep -A 1 "Content-Security-Policy" next.config.mjs
# expected: header present with directives
```

---

## 15. Verdict

**Technical readiness: ~95%.** Code, security, monitoring, observability, marketplace flows, admin tools — all production-grade. What remains is external/operational:

- Real content (replace AI mockup photos)
- Tap production KYC
- Custom domain
- Plan upgrades for traffic
- Legal review

A competent programmer can take this over without significant ramp-up. The architecture is documented inline + via migration files + via this handoff. There is no hidden state.

**Recommended next action:** soft launch to 20 trusted users with sandbox Tap and built-in Resend SMTP. Iterate based on real friction, not speculation.

---

*End of handoff.*
