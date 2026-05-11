# مراجعة شاملة لمشروع ديمة (Deemah) — Independent Code Review

> **تاريخ المراجعة:** 2026-05-09
> **Reviewer:** Independent code review (read-only)
> **Stack:** Next.js 16.2.4 · React 19 · Tailwind 4 · shadcn/ui · TypeScript 5.7 · Supabase (xwbkdqwagygerjcwoisf, Frankfurt) · Tap Payments
> **Scope:** المرحلتان 1 + 2 (Auth + 11 صفحة + Booking + Orders + Tap + Earnings)

---

## ملخص تنفيذي (TL;DR)

البنية العامة جيدة: Server Components بشكل افتراضي، Server Actions للكتابة، RLS مفعّل، service_role لا يُسرّب للعميل (`'server-only'` مستعمل بانتظام). الفحص كشف عن **9 مشاكل P0 حرجة تمنع الإطلاق** أهمها: تباين schema vs code، عدم تحديث حالة القطعة بعد الدفع، فلتر Listings غير موصول إطلاقاً، race conditions في الحجز/الـwebhook، ومشكلات RLS صامتة.

**Production readiness: ~55%** — جاهز وظيفياً لكن **غير قابل للإطلاق التجاري قبل إصلاح P0**.

**التوصية النهائية:** ⛔ لا تطلقي قبل معالجة كامل قائمة P0. الكود نظيف وقابل للإصلاح، لكن المشاكل الحالية تؤدي إلى بيع نفس القطعة مرتين، وحجوزات متداخلة، وفلترة لا تعمل.

---

## 1) بنية الملفات (Architecture)

### إيجابيات
- تنظيم Next.js App Router سليم: `app/<feature>/page.tsx` + `actions.ts` + `*-client.tsx` تقسيم منطقي.
- `lib/` منظّم حسب الـdomain: `auth.ts / listings.ts / bookings.ts / orders.ts / messages.ts / storage.ts / payments/tap.ts / supabase/{client,server,middleware}.ts`.
- استخدام `'use server'` و`'use client'` صحيح في كل الملفات الفاحصة.
- ملف `lib/types.ts` مركزي، يطابق DB إلى حد كبير (لكن انظر P1 #6).
- `force-dynamic` مستعمل في صفحات تحتاجه (`/listings/[id]`، `/bookings`، `/orders`، إلخ) — ✓.

### ملاحظات
- وجود `hooks/` و`components/ui/use-mobile.tsx` و`components/ui/use-toast.ts` بالإضافة إلى `hooks/use-mobile.ts` و`hooks/use-toast.ts` = **ازدواجية ملفات** (4 ملفات لـhookين). يجب توحيدها.
- `app/_payments/pay-client.tsx` خارج صفحة محددة، ربما الأفضل أن يكون `components/payments/pay-client.tsx`.
- `components/listings/listings-filter.tsx` كبير (252 سطراً) ولا يفعل شيئاً وظيفياً (انظر P0 #1).

---

## 2) Auth + Security

### ما يعمل
- `app/register/actions.ts` و`app/login/actions.ts` و`app/listings/new/actions.ts` و`app/bookings/actions.ts` و`app/checkout/actions.ts` و`app/messages/[id]/actions.ts` كلها تستورد `'server-only'` ✓.
- `SUPABASE_SERVICE_ROLE_KEY` يُستخدم فقط داخل: `app/register/actions.ts` (server-only)، `app/api/payments/tap/webhook/route.ts` (route handler)، `app/api/payments/dev-simulate/route.ts` (route handler) — لا يخرج للـclient bundle.
- middleware يحمي `/profile`، `/dashboard*`، `/messages*`، `/bookings*`، `/orders*`، `/checkout*`، `/listings/new`، `/listings/[id]/edit` بشكل صحيح، ويعيد المستخدم لـ`/login?redirectTo=...`.
- `getUser()` يستخدم `supabase.auth.getUser()` بدل `getSession()` — صحيح من ناحية أمنية.
- Zod مستعمل لكل المدخلات تقريباً.
- `.gitignore` يستثني `.env*.local` ✓ (تم التحقق: `git ls-files` لا يحتوي `.env.local`).

### مشاكل Auth (انظر P0/P1)
- `/api/auth/signout/route.ts` لا يحقق CSRF أو يقتصر على same-origin بشكل صريح (انظر P2).
- التسجيل يستخدم admin endpoint مع `email_confirm: true` — أي **بدون تحقق من البريد**. أي شخص يستطيع تسجيل بريد ليس له. (P1 #8)
- لا يوجد Rate limiting خاص بالتطبيق على `/register` أو `/login` — يعتمد على Supabase الافتراضي فقط. (P1 #7)
- لا يوجد `forgot-password` flow.

---

## 3) RLS Policies — تحليل تفصيلي

`schema.sql` لوحده **ناقص خطيراً**. يحتوي SELECT و INSERT فقط لأغلب الجداول. الـUPDATEs الضرورية (تأكيد حجز، شحن طلب، تعليم رسالة كمقروءة، تعديل قطعة) **سترفض كلها صامتاً** إن لم يُطبَّق `002_payments.sql`.

| Table | في schema.sql | المطلوب (واقعياً) | في 002_payments.sql |
|---|---|---|---|
| listings | SELECT, INSERT, UPDATE (owner), DELETE (owner) | ✓ | — |
| bookings | SELECT, INSERT | + UPDATE للمالك والمستأجر | ✓ مضافة |
| orders | SELECT, INSERT | + UPDATE للبائع والمشتري | ✓ مضافة |
| messages | SELECT, INSERT | + UPDATE (read_at) | ❌ **ناقصة** |
| transactions | SELECT | INSERT (via service_role webhook) | يكفي |

**النتيجة:** `lib/messages.ts:84` يعمل `update({ read_at })` بدون UPDATE policy → فشل صامت → unread badges لا تنخفض. **P0 #8**.

**خطر Deployment:** التعليق في رأس `schema.sql` يقول "Run in Supabase SQL Editor". إذا اتُّبع التعليق حرفياً ولم يُطبَّق `002_payments.sql`، سيفشل: تأكيد الحجز، شحن الطلب، الدفع، شيبنغ أدرس، إلخ. **P0 #4**.

---

## 4) مراجعة كل Feature

### 4.1 Listings (CRUD + رفع صور + فلاتر)

**الإيجابيات**
- `app/listings/new/actions.ts` ينفذ Zod validation شامل، يتحقق من الملكية في UPDATE/DELETE عبر `eq('owner_id', user.id)` ✓.
- `lib/storage.ts` يحقق MIME + حجم + كومبريشن client-side ✓.
- صفحة التفاصيل تتحقق إن المشاهد ليس المالك قبل عرض زر الشراء/الحجز ✓.

**المشاكل**
- `incrementViews` (`lib/listings.ts:111`) عملية read+write غير ذرّية — race يضيع views بين زائرين متزامنين. **P1 #1**.
- يتم تنفيذ `incrementViews` على كل تحميل صفحة بما في ذلك تحميل المالك نفسه — يجب استثناء owner أو unique-visitor عبر cookie.
- `images` في Zod schema هي `z.array(z.string())` بدون تحقق أن المسارات تنتمي لـowner. مستخدم خبيث يمكنه حقن مسارات لقطع غيره (الصور عامة على أي حال، لكن سلامة بنية البيانات تتأثر). **P1 #13**.
- Filter component (`components/listings/listings-filter.tsx`) **منفصلة تماماً عن URL state** — `useState` محلي فقط. الـcategories فيها (`dresses/abayas/jewelry`) **لا تطابق enum في schema** (`women/men/kids/accessories/shoes/bags`). **P0 #1**.
- في `app/listings/page.tsx` الـ`<ListingsFilter />` يُرندر **مرتين** (السطر 90 + السطر 108). **P0 #2**.
- "Sort by rating" يستعمل `views_count` بدلاً من rating حقيقي — مضلل اسم.

### 4.2 Messages + Realtime

**الإيجابيات**
- Realtime subscription في `thread-client.tsx` يضيف رسائل `INSERT` الواردة، ويلغي الاشتراك في cleanup (`removeChannel`) ✓.
- Optimistic update + rollback عند خطأ ✓.
- `partner` نُحضر من `users` table مع IDs صغيرة محدّدة ✓.

**المشاكل**
- `fetchThread` (`lib/messages.ts:84-88`) يستدعي `update({ read_at })` لكن **لا توجد UPDATE policy على `messages`** → يفشل صامتاً → الـbadges في `/messages` و`/dashboard` لا تنخفض. **P0 #8**.
- `fetchThread` تنفّذ side-effect (mark-as-read) داخل دالة "fetch" وعلى كل تحميل صفحة. تصميم خاطئ — يجب action مستقل أو على mount فقط. **P0 #9**.
- `fetchConversations` يقرأ آخر 500 رسالة ويعالجها في JS لبناء summary — N+1-like غير قابل للتوسع. **P1 #11**. الحل: SQL `DISTINCT ON (partner_id)`.
- `partnerId` (URL param) يُمرَّر إلى `.or()` filter بدون UUID validation:
  ```ts
  .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),...`)
  ```
  مدخل خبيث يحتوي `,` أو `)` يكسر الـquery. **P1 #2**.
- Realtime channel يستخدم `receiver_id=eq.${meId}` — لا يلتقط الرسائل الصادرة من تبويب آخر للمستخدم نفسه. مينور.
- Optimistic id `tmp-${Date.now()}` قد يُكرَّر عرض إذا وصل الـINSERT realtime قبل refresh router (الـdedup حسب id فقط لا يكفي).

### 4.3 Bookings

**الإيجابيات**
- `createBookingAction` يتحقق من: status القطعة، is_for_rent، عدم حجز قطعتك، توفر السعر، التواريخ صالحة، التداخل قبل الإدخال.
- `confirmBookingAction` و`cancelBookingAction` يتحققان من ملكية القطعة قبل التحديث.
- التواريخ تُحفظ كـ`date` (ليست timestamptz) → لا قلق timezone في DB، لكن الـclient يبني `new Date('YYYY-MM-DD')` الذي يُفسَّر UTC midnight (مشكلة بسيطة في `dayCount`).

**المشاكل**
- **Race condition في الحجز** (`app/bookings/actions.ts:56-74`): `fetchListingBookedRanges → rangesOverlap → insert` عملية غير ذرّية. مستخدمان يحجزان نفس التواريخ متزامناً = نجاح الإثنين. **P0 #5**.
  - الحل المقترح: إضافة `EXCLUDE` constraint في Postgres:
    ```sql
    create extension if not exists btree_gist;
    alter table bookings add constraint bookings_no_overlap
      exclude using gist (
        listing_id with =,
        daterange(from_date, to_date, '[]') with &&
      ) where (status in ('pending','confirmed','paid','active'));
    ```
- **حالة القطعة لا تتحدث** عند `paid`/`active` للحجز — قطعة مؤجَّرة تظهر `status='active'` ويمكن لشخص آخر حجزها لتاريخ آخر (مقصود؟ لكن داشبورد المستأجر يظهرها كنشطة) — قد يكون مقبولاً للتأجير لكن **يجب توثيقه**.
- `confirmBookingAction` و`cancelBookingAction` يحدّثان `updated_at` (في `bookings`) — العمود **غير موجود في schema.sql الأصلي**، فقط في 002. **P0 #4**.
- `loadBookingForOwner` و الكاست `Array.isArray(...).listings` مكرر في عدة ملفات — يستحق helper مشترك.
- لا يوجد منع للحجز في الماضي على مستوى السيرفر (الـclient فقط يضع `min={isoToday()}`).

### 4.4 Orders + Checkout

**الإيجابيات**
- التحقق من ملكية القطعة، حالتها، السعر، عدم شراء قطعتك ✓.
- shipping_address منظّم ومخزَّن كـjsonb ✓.

**المشاكل**
- `shipping_address` و `updated_at` في جدول `orders` — **غير موجودَين في schema.sql**، فقط في 002. **P0 #4**.
- لا UPDATE policy في schema.sql — `markShipped/markDelivered` يفشلان صامتاً بدون 002. **P0 #4**.
- `createOrderAction` يخلق order مباشرة + redirect إلى `/orders/[id]/pay` — حالياً listing يبقى `active` بعد الـorder، فيمكن لمشترٍ ثانٍ خلق order على نفس القطعة قبل دفع الأول. **P0 #3**: يجب إما (أ) قفل `listing.status='reserved'` عند إنشاء order pending، (ب) تحويل `status='sold'` عند الدفع فقط لكن منع orders جديدة بفحص "هل توجد order pending/paid".
- `markShippedAction` و`markDeliveredAction` بدون فحص الترتيب الصحيح (يفترضان الـcurrent status من الـclient state). أي seller يستطيع تعليم order ما زال `pending` كـ`shipped` نظرياً — **يجب فحص `WHERE status='paid'` في الـUPDATE**.
- لا يوجد `cancelOrderAction` للمشتري قبل الدفع (يفترض المستخدم سيدفع أو يهجر).

### 4.5 Tap Payments

**الإيجابيات**
- `lib/payments/tap.ts` يلف `https://api.tap.company/v2/charges` باحتراف، threeDSecure مفعّل، KWD افتراضي.
- `webhook/route.ts` **يجلب الـcharge من Tap API** (`retrieveCharge`) قبل تطبيق التغيير — يحمي من webhooks مزوّرة ✓.
- `payment_id` يُحفظ على order/booking عند `create` ✓.
- transactions تُسجَّل تلقائياً عند الدفع ✓.
- `tapConfigured()` يحدد ظهور وضع المحاكاة ✓.

**المشاكل خطيرة**
- **لا يتحقق من توقيع `hashstring`** الخاص بـTap. الـretrieveCharge كافٍ لكن احتساب الـsignature طبقة دفاع إضافية مهمة. **P0 #7** (deferred — الـretrieve يحمي عملياً، لكن أفضل ممارسة).
- **Webhook idempotency racy** (`webhook/route.ts:34, 60`):
  ```ts
  if (order.status !== 'pending') return;
  await update(...).eq('id', targetId)
  ```
  webhook ثاني يصل مباشرة قد يقرأ `pending` قبل تحديث الأول. الحل: تحديث شرطي ذرّي:
  ```ts
  const { data: rows } = await supabase
    .from('orders')
    .update({ status: 'paid', payment_id: chargeId, ... })
    .eq('id', targetId)
    .eq('status', 'pending')
    .select('id');
  if (!rows || rows.length === 0) return; // already applied
  // … only then insert transaction
  ```
  **P0 #6**.
- **لا تحديث على listing.status** — قطعة `paid` تبقى `active` ويستطيع مشترٍ آخر شرائها. **P0 #3**.
- transactions.description مكتوب في الـwebhook لكن العمود في schema موجود فقط في 002.
- `dev-simulate` route محمي بـ`if (tapConfigured()) return 403` — إن نُشر للإنتاج بدون مفاتيح Tap، يصبح الـsimulate متاحاً للجميع (مع auth user فقط). يجب إضافة فحص `NODE_ENV !== 'production'` صريح.
- `redirect_url` في create يستخدم query string `?id=${parsed.data.targetId}` — يجب التحقق منه في `return/route.ts` أنه يخص نفس المستخدم (حالياً الـreturn يعيد التوجيه ببساطة لـ`/orders/${id}` والـRLS يتولى الفحص) — مقبول.
- Customer email fallback: `${user.email ?? user_${user.id}@deemah.kw}` — لو لم يكن للمستخدم بريد (OAuth providers قد لا ترجع email)، البريد المركّب لن يستلم إيصال.

### 4.6 Earnings

- يقرأ `transactions` بـRLS الذاتية ✓.
- ملخص (إجمالي/قيد الانتظار/مسحوب) صحيح حسابياً.
- **`Transaction` interface في `lib/types.ts` لا يحتوي `description`** بينما الـwebhook يكتبها. type drift صغير. **P1 #6**.
- لا حالة سحب فعلية بعد (`Button disabled "قريباً"`) — مقبول للمرحلة 2.

---

## 5) Code Quality

### TypeScript
- `tsc --noEmit` لم يكتمل خلال 35s في sandbox (مشروع كبير، أول build) — يُنصح بتشغيله محلياً.
- **0 occurrences لـ`: any` / `as any` / `<any>`** ✓ (تم البحث).
- Type narrowing عبر `unknown` + `instanceof Error` مستخدم في catches ✓.
- `as unknown as X` casts كثيرة بسبب ردود Supabase المعقدة — مقبول لكن قابل للتحسين بـschema generator.

### Logging
- **0 console.log** ✓
- 33 `console.error` في server-only files (lib/, server actions, route handlers). متوافق نسبياً مع قاعدة "no console.log" لكن يبقى تحت "no console.* in production". الحل: استبدال بـlogger موحّد (مثلاً `pino`) أو على الأقل `lib/logger.ts` بسيط يقرأ `NODE_ENV`. **P2**.

### Error handling
- معظم الأخطاء تعود بـ`{ error: 'رسالة عربية' }` للمستخدم ✓.
- لا تُكشف رسائل DB raw للـclient ✓ (يُكتب message في console.error فقط).
- بعض الأماكن تكشف `err.message` للـclient (مثل `pay-client.tsx:35` — يعرض `err.message` من response). إذا الـerror text من Tap يحتوي تفاصيل تقنية بالإنجليزية، يصل للمستخدم العربي.

### i18n / RTL
- `<html lang="ar" dir="rtl">` في root layout ✓.
- النصوص كلها عربية في الـUI ✓.
- بعض mr/ml في tailwind قد تحتاج مراجعة (Tailwind 4 يدعم logical `me-*` / `ms-*`).
- `/profile/[username]/page.tsx` يعرض `@username` بـ`dir="ltr"` — لطيف ✓.
- **مشكلة**: `phone` في checkout استخدم `dir="ltr"` لكن في register/login لا — اتساق ناقص.

### Loading / empty / error states
- ✓ Empty states في كل القوائم: `/listings`, `/messages`, `/bookings`, `/orders`, `/dashboard`, `/dashboard/earnings`, `/profile/[username]`.
- ❌ **لا يوجد `app/error.tsx` ولا `app/not-found.tsx` ولا `loading.tsx`** على مستوى الـroot. **P1 #4**.
- Forms تستخدم `useTransition` و`isPending` ✓.

---

## 6) Performance

- Server Components افتراضياً ✓.
- `next/image` مستعمل لكن `next.config.mjs` فيه `images: { unoptimized: true }` → الصور تُقدَّم خاماً من Supabase Storage بدون optimization. **P1 #3**. الحل:
  ```js
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'xwbkdqwagygerjcwoisf.supabase.co',
      pathname: '/storage/v1/object/public/**',
    }],
  }
  ```
- DB indexes:
  - ✓ `listings(owner_id, category, status)` موجودة.
  - ✓ `bookings(listing_id, renter_id, status, payment_id)` موجودة (بعد 002).
  - ❌ لا index على `messages(sender_id, receiver_id, read_at)` — الـ`fetchConversations` يعتمد على scan مع `or()`. يحتاج composite index.
  - ❌ لا index على `transactions(user_id, created_at desc)` — earnings page تطلبه.
- Realtime cleanup ✓ (`removeChannel`).
- `fetchConversations` يقرأ 500 رسالة ثم يجمّع في JS — لن يتوسع. **P1 #11**.

---

## 7) Security Audit

| البند | الحالة | ملاحظة |
|---|---|---|
| SQL injection | ✓ آمن | كل الـqueries عبر Supabase SDK مع params |
| XSS render | ✓ آمن | لا `dangerouslySetInnerHTML`، `whitespace-pre-wrap` فقط |
| CSRF (server actions) | ✓ Next.js افتراضياً يحمي | POST same-origin |
| service_role leakage | ✓ آمن | `'server-only'` + لا `NEXT_PUBLIC_` |
| `.env.local` في git | ✓ آمن | `.gitignore` يستثني `.env*.local` |
| Tap webhook auth | ⚠ جزئي | retrieve يحمي، لكن لا signature verification |
| Tap webhook idempotency | ❌ racy | check-then-update غير ذرّي |
| Auth rate limiting | ❌ مفقود | يعتمد على Supabase الافتراضي فقط |
| Password reset | ❌ مفقود | لا flow |
| Email confirmation | ❌ تجاوز | admin endpoint مع `email_confirm: true` |
| Open redirect (`redirectTo`) | ⚠ جزئي | لا فحص أن القيمة تبدأ بـ`/` |
| Body size on /api/payments | ⚠ افتراضي | لا حد صريح |

### تفاصيل خطر Open Redirect
في `middleware.ts:46`: `url.searchParams.set('redirectTo', request.nextUrl.pathname)` — هذا آمن (نضيف pathname فقط).
في `app/login/page.tsx` يقرأ `redirectTo` من URL ويستخدمه للـredirect — يجب التحقق أنه يبدأ بـ`/` لمنع `redirectTo=https://evil.com`.

---

## 8) Bugs محتملة

1. **Race في booking overlap** (P0 #5).
2. **Webhook idempotency racy** (P0 #6).
3. **`incrementViews` race** (P1 #1).
4. **`partnerId` غير محقق UUID قبل `.or()` filter** (P1 #2).
5. **Realtime duplicate** عند وصول INSERT بعد optimistic temp id.
6. **Status transitions غير محمية في DB**: لا CHECK constraint على trigger transitions (مثلاً منع `cancelled→shipped`). الفحص في الـapp فقط.
7. **`dayCount` في `lib/bookings.ts:78`**: نفس اليوم = 1، اليوم التالي = 2 (inclusive). متّسق مع `booking-form.tsx`. لكن `new Date('2026-05-10')` يُفسَّر UTC في JS، وعميل في الكويت (+03) قد يرى تاريخاً مختلفاً عند منتصف الليل.
8. **Currency precision**: KWD = 3 خانات عشرية. الـschema يستخدم `numeric(10,3)` ✓. لكن `Number(...)` و`toLocaleString('ar-KW')` لا يضمن دائماً إظهار 3 خانات. اختبار 0.001 د.ك مهم.

---

## 9) UX Issues

- ✓ Mobile responsive ممتاز (Sheet للـmobile menu، grid responsive).
- ✓ RTL كامل.
- ⚠ `ListingsFilter` تظهر كزر "الفلاتر" + sidebar **في نفس الوقت** على desktop → ضوضاء بصرية + مكرر (P0 #2).
- ⚠ نموذج العنوان (`area/block/street/building`) كله مطلوب — قد يكون مرهقاً. تحويل بعضها لـoptional أو combobox للمناطق المعروفة في الكويت أفضل.
- ⚠ `BookingForm` لا يعرض التواريخ المحجوزة سابقاً للمستخدم — يحجز ثم يكتشف "محجوزة".
- ⚠ زر "تعديل" يظهر فقط لـowner لكن `Link` يسبق فحص `isOwner`؟ لا، الفحص ✓.
- ❌ لا breadcrumbs في صفحات detail (إلا earnings).
- ❌ زر "تحميل المزيد" في `/listings` يستبدل URL ولا يضيف للقائمة الحالية — كل صفحة تطلب الكل من البداية. UX غير سلس.

---

## 10) Production Readiness

| البند | حالة |
|---|---|
| `app/error.tsx` (root error boundary) | ❌ مفقود |
| `app/not-found.tsx` | ❌ مفقود |
| `app/loading.tsx` | ❌ مفقود |
| `robots.txt` / `app/robots.ts` | ❌ مفقود |
| `sitemap.xml` / `app/sitemap.ts` | ❌ مفقود |
| `generateMetadata` لصفحات detail (listings/profiles) | ❌ مفقود (SEO) |
| `next.config.mjs` يفعّل صور Supabase | ❌ unoptimized |
| Analytics (Vercel) | ✓ في production فقط |
| Error monitoring (Sentry/PostHog) | ❌ مفقود |
| Health check endpoint | ❌ مفقود |
| Tests (E2E / Unit) | ❌ غير موجودة |
| ESLint config | ⚠ `pnpm lint` يستدعي eslint لكن لا config مرئي في الـrepo |
| README / setup docs | ❌ غير مرفقَين في المراجعة |
| Migration order docs | ❌ غير واضح أن `schema.sql` يجب أن يُتبع بـ`002_payments.sql` |

---

## 11) قائمة P0 — يجب الإصلاح قبل الإطلاق

> هذه المشاكل **تمنع الإطلاق التجاري**. كل واحدة تُسبب فقدان مال أو بيانات أو ثقة.

### P0-1: فلتر القطع غير موصول
- **الملف:** `components/listings/listings-filter.tsx`
- **المشكلة:** state محلي فقط، لا يحدّث `searchParams`. categories لا تطابق schema (`dresses, abayas, jewelry` vs `women, men, kids, accessories, shoes, bags`).
- **الأثر:** المستخدم يستخدم فلتراً يبدو يعمل لكنه decorative.
- **الإصلاح:** تحويل المكوّن إلى `useRouter() + searchParams.set()` وتطابق الـenum، أو الأفضل: استخدام Server Component مع form يـsubmit إلى نفس الـURL.

### P0-2: Filter يُرندر مرتين
- **الملف:** `app/listings/page.tsx:90, 108`
- **الإصلاح:** احذف أحدهما (الـmobile sheet trigger يكفي للموبايل، الـsidebar للـdesktop — هما داخل نفس المكوّن أصلاً، لذا استدعاء واحد كافٍ).

### P0-3: حالة القطعة لا تتحدث بعد البيع/الإيجار
- **الملفات:** `app/api/payments/tap/webhook/route.ts`، `app/api/payments/dev-simulate/route.ts`
- **المشكلة:** عند `paid` لا يُغيَّر `listings.status` إلى `sold`/`rented`. مشترٍ آخر يستطيع شراء نفس القطعة.
- **الإصلاح:** بعد update الـorder/booking الناجح، نفّذ:
  ```ts
  await admin.from('listings')
    .update({ status: kind === 'order' ? 'sold' : 'rented' })
    .eq('id', listingId);
  ```
- **بالإضافة:** عند إنشاء `order` pending، يجب رفض orders جديدة على نفس القطعة (الفحص في `createOrderAction`).

### P0-4: Schema غير متّسقة — خطر deployment
- **الملف:** `supabase/schema.sql` + `supabase/migrations/002_payments.sql`
- **المشكلة:** schema.sql لا يحتوي: `bookings.payment_id`، `bookings.updated_at`، `'paid'` في bookings status، `orders.shipping_address`، `orders.updated_at`، UPDATE policies على bookings/orders، `transactions.description`.
- **الأثر:** إذا طُبّق schema.sql فقط (كما يقترح التعليق "Run in Supabase SQL Editor")، تنهار: تأكيد الحجز، شحن الطلب، الدفع كاملاً.
- **الإصلاح:** دمج 002 في schema.sql أو إضافة README واضح بترتيب الملفات. الأفضل: استخدام Supabase migrations CLI.

### P0-5: Race condition في حجز التواريخ
- **الملف:** `app/bookings/actions.ts:56-74`
- **المشكلة:** `fetchListingBookedRanges → check overlap → insert` غير ذرّية.
- **الإصلاح:** Postgres exclusion constraint:
  ```sql
  create extension if not exists btree_gist;
  alter table public.bookings drop constraint if exists bookings_no_overlap;
  alter table public.bookings add constraint bookings_no_overlap
    exclude using gist (
      listing_id with =,
      daterange(from_date, to_date, '[]') with &&
    ) where (status in ('pending','confirmed','paid','active'));
  ```

### P0-6: Webhook idempotency racy
- **الملف:** `app/api/payments/tap/webhook/route.ts:23-77`
- **المشكلة:** `if (order.status !== 'pending') return; … update`. webhookان متزامنان قد يدخلان كلاهما.
- **الإصلاح:** UPDATE شرطي ذرّي:
  ```ts
  const { data: rows } = await supabase
    .from('orders')
    .update({ status: 'paid', payment_id: chargeId, updated_at: new Date().toISOString() })
    .eq('id', targetId)
    .eq('status', 'pending')
    .select('id');
  if (!rows?.length) return; // already applied → skip transaction insert
  ```
  ثم `transactions.insert` مرة واحدة. إضافياً: unique index على `(reference_id, type)` يحمي transactions من تكرار:
  ```sql
  create unique index transactions_dedupe on public.transactions(reference_id, type) where reference_id is not null;
  ```

### P0-7: لا signature verification لـTap webhook
- **الملف:** `app/api/payments/tap/webhook/route.ts`
- **المشكلة:** يثق بـpayload ثم يـverify عبر retrieve (مقبول جزئياً) لكن لا hashstring check.
- **الإصلاح:** قراءة `tap-signature` (header) واحتساب HMAC حسب وثائق Tap قبل قراءة body.
- **ملاحظة:** الـretrieve يحمي عملياً، لكن signature أسرع وأقل تكلفة + دفاع في العمق.

### P0-8: Messages UPDATE يفشل صامتاً
- **الملف:** `lib/messages.ts:84-88` + `supabase/schema.sql`
- **المشكلة:** لا UPDATE policy على `messages` → `read_at` لا يُحدَّث → unread badges عالقة.
- **الإصلاح:** أضف policy:
  ```sql
  create policy "Receivers mark messages read" on public.messages
    for update using (auth.uid() = receiver_id)
    with check (auth.uid() = receiver_id);
  ```
  ضعها في `002_payments.sql` أو schema.

### P0-9: `fetchThread` تفعل side-effect على كل قراءة
- **الملف:** `lib/messages.ts:84`
- **المشكلة:** mark-as-read يحدث في كل تحميل صفحة بدون قصد المستخدم. مع P0-8 (RLS مفقود) لا يعمل أصلاً، لكن بعد الإصلاح سيعمل بشكل خاطئ (سيعلّم رسائل كمقروءة قبل أن تراها فعلاً).
- **الإصلاح:** استدعاء صريح من `thread-client.tsx` عند `useEffect` mount + visibility check، أو server action `markThreadReadAction(partnerId)`.

---

## 12) قائمة P1 — مهم لكن غير حرج

1. **`incrementViews` race + يحسب owner.** استبدل بـRPC: `update listings set views_count = views_count + 1 where id = $1`.
2. **`partnerId` بدون UUID validation** قبل interpolation في `.or()` filter (`lib/messages.ts:64-69`).
3. **`next.config.mjs` `unoptimized: true`** — أضف `remotePatterns` لـSupabase وأزل `unoptimized`.
4. **`app/error.tsx`، `app/not-found.tsx`، `app/loading.tsx`** مفقودة.
5. **`robots.ts` + `sitemap.ts`** مفقودة.
6. **`Transaction` interface** ينقصه `description: string | null`.
7. **Rate limiting على `/register` و`/login`** — استخدم Upstash Redis أو middleware بسيط.
8. **التسجيل عبر admin endpoint بـ`email_confirm: true`** — يتجاوز التحقق. استبدل بـ`signUp` العادي + email link، أو على الأقل أرسل confirmation manually.
9. **Password reset flow** مفقود.
10. **Open redirect على `redirectTo`** — تحقق أنه يبدأ بـ`/` ولا يحتوي `//`.
11. **`fetchConversations` لا يتوسع** — استخدم SQL `DISTINCT ON (partner_id) ... ORDER BY partner_id, created_at DESC` + composite indexes.
12. **`images` array لا يُحقَّق** أن المسارات تنتمي لـowner. حقن مسار صور قطعة أخرى ممكن.
13. **`markShipped/markDelivered` لا يفحصان status السابق** في الـUPDATE — يجب `eq('status', 'paid')`.
14. **`generateMetadata`** مفقودة على صفحات detail (SEO + OG).
15. **Composite indexes**: `messages(sender_id, receiver_id, read_at)`, `transactions(user_id, created_at desc)`.

---

## 13) قائمة P2 — تحسينات

- توحيد الـlogger (`lib/logger.ts`) بدلاً من `console.error` المتناثر.
- إزالة الـduplicate hooks (`hooks/use-mobile.ts` + `components/ui/use-mobile.tsx`، نفس الشيء لـtoast).
- إضافة `lib/db-helpers.ts` لـcasts المتكررة `Array.isArray((x).listings) ? ... : ...`.
- استخدام Supabase typegen لاستبدال `as unknown as X`.
- Sentry / PostHog للـerror + analytics events.
- Toaster (sonner) في layout — حالياً مكوّنات shadcn موجودة لكن لم تُركَّب.
- E2E tests (Playwright) للـcritical flows: signup → list → pay → ship → deliver.
- ESLint + Prettier + typecheck في CI.
- "تحميل المزيد" infinite scroll مع state local، أو virtual list (TanStack Virtual).
- `generateMetadata` + Open Graph images لكل listing/profile.
- Currency formatter موحّد في `lib/currency.ts`.
- "Booked dates" يُعرض في `BookingForm` (Calendar مع مناطق غير متاحة).
- زر "نسخ الرقم" / "اتصال" بجانب رقم الهاتف في الـorder.
- عرض رسالة CTA إن لم يفعّل البائع الـoutgoing email لإيصالات Tap.
- Dark mode (موجود `theme-provider.tsx` لكن لا toggle).

---

## 14) خلاصة + نسبة الجاهزية

```
البنية والـTS:        ████████░░  80%
Auth + RLS:           ██████░░░░  60%   (002 لازم يُطبَّق + messages UPDATE policy)
Listings:             ██████░░░░  60%   (الفلتر غير موصول)
Messages:             ██████░░░░  60%   (read_at معطّل، N+1)
Bookings:             █████░░░░░  50%   (race condition + status لا يتحدث)
Orders:               █████░░░░░  50%   (status القطعة لا يتحدث + race)
Payments (Tap):       ███████░░░  70%   (idempotency + listing status + signature)
Earnings:             ████████░░  80%   (يعمل، type drift صغير)
UX / RTL / i18n:      ████████░░  80%
Production polish:    ███░░░░░░░  30%   (لا error.tsx, sitemap, robots, متابعة)
Tests:                ░░░░░░░░░░   0%
─────────────────────────────────
Production readiness:  ~55%
```

### التوصية النهائية

⛔ **لا تطلقي بعد.** الكود قابل للإطلاق خلال 1-2 أسبوع عمل لو عُولجت P0 بانضباط، لكن في الحالة الحالية:

- بائع يبيع نفس القطعة لمشتريَين (P0-3).
- مستأجرتان يحجزان نفس التواريخ (P0-5).
- Webhook قد يضاعف earnings (P0-6).
- الفلاتر تبدو تعمل ولا تعمل (P0-1، P0-2).
- نشر الـschema بدون 002 يكسر كل شيء (P0-4).

**الخطة المقترحة:**
1. **يومان (2):** P0-1، P0-2، P0-4، P0-8، P0-9 (الـUI + RLS + schema).
2. **3 أيام:** P0-3، P0-5، P0-6، P0-7 (race conditions + listing status + webhook hardening).
3. **أسبوع:** P1 (السبعة الأهم: 1، 3، 4، 6، 7، 10، 13).
4. **اختبار E2E** كامل لـsignup → buy → pay → ship → deliver وbook → confirm → pay → cancel.
5. ثم إطلاق beta محدود (10-20 مستخدم) لـ72 ساعة قبل العام.

النية والتنفيذ احترافيان. الـcleanups صغيرة في معظمها. ✋ لكن **لا تطلقي قبل P0**.

---

*— تقرير مراجعة مستقل، 2026-05-09*
