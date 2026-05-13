# Supabase Email Templates — Arabic (RTL)

Paste these into Supabase Dashboard -> Authentication -> Email Templates. Each template uses `dir="rtl"` and the Deemah brand color (`#b8860b`). Replace the magic tokens (`{{ .ConfirmationURL }}`, `{{ .RecoveryURL }}`, `{{ .MagicLink }}`) only when Supabase asks for them; the tokens are inserted automatically by the auth service.

---

## 1. Confirm signup

**Subject:** `تأكيد بريدك الإلكتروني — ديمة`

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, sans-serif; background: #faf6f0; padding: 32px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; text-align: right;">
    <h1 style="color: #b8860b; margin: 0 0 16px;">مرحباً بك في ديمة</h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6;">شكراً لتسجيلك. اضغطي الزر أدناه لتأكيد بريدك الإلكتروني والبدء.</p>
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #b8860b; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin-top: 16px;">تأكيد البريد</a>
    <p style="color: #888; font-size: 13px; margin-top: 24px;">إذا لم تطلبي هذا، تجاهلي الرسالة.</p>
  </div>
</body>
</html>
```

---

## 2. Reset password

**Subject:** `إعادة تعيين كلمة المرور — ديمة`

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, sans-serif; background: #faf6f0; padding: 32px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; text-align: right;">
    <h1 style="color: #b8860b; margin: 0 0 16px;">إعادة تعيين كلمة المرور</h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6;">وصلنا طلب لإعادة تعيين كلمة المرور الخاصة بحسابك في ديمة. اضغطي الزر أدناه لاختيار كلمة مرور جديدة.</p>
    <a href="{{ .RecoveryURL }}" style="display: inline-block; background: #b8860b; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin-top: 16px;">إعادة التعيين</a>
    <p style="color: #888; font-size: 13px; margin-top: 24px;">الرابط صالح لمدة ساعة واحدة. إذا لم تطلبي هذا، يمكنك تجاهل الرسالة وستبقى كلمة المرور كما هي.</p>
  </div>
</body>
</html>
```

---

## 3. Magic link

**Subject:** `تسجيل الدخول — ديمة`

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, sans-serif; background: #faf6f0; padding: 32px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; text-align: right;">
    <h1 style="color: #b8860b; margin: 0 0 16px;">تسجيل الدخول إلى ديمة</h1>
    <p style="color: #333; font-size: 16px; line-height: 1.6;">اضغطي الزر أدناه لتسجيل الدخول إلى حسابك. لا تحتاجين لكلمة المرور.</p>
    <a href="{{ .MagicLink }}" style="display: inline-block; background: #b8860b; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin-top: 16px;">تسجيل الدخول</a>
    <p style="color: #888; font-size: 13px; margin-top: 24px;">الرابط صالح لمدة 10 دقائق ولاستخدام واحد فقط. إذا لم تطلبي تسجيل الدخول، تجاهلي الرسالة.</p>
  </div>
</body>
</html>
```

---

## Notes for ops

- Set `Site URL` in Supabase to the production domain so the redirect tokens resolve correctly.
- Keep the brand color (`#b8860b`) in sync with `app/globals.css` if you change the primary palette.
- Test each template by triggering the action (signup, password reset, magic link) against a real inbox before launch.
