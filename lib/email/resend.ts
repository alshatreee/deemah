import 'server-only'
import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

const client = apiKey ? new Resend(apiKey) : null

interface OrderEmailContext {
  to: string
  orderId: string
  amount: number
  listingTitle: string
}

export async function sendOrderPaidEmail(ctx: OrderEmailContext): Promise<void> {
  if (!client) {
    console.log('[email] RESEND_API_KEY not set, skipping')
    return
  }
  try {
    await client.emails.send({
      from: `ديمة <${fromAddress}>`,
      to: ctx.to,
      subject: 'تم استلام دفعتك — ديمة',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <body style="font-family: -apple-system, sans-serif; background: #faf6f0; padding: 32px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; text-align: right;">
            <h1 style="color: #b8860b; margin: 0 0 16px;">تم استلام دفعتك بنجاح</h1>
            <p>شكراً لشرائك من ديمة. تم تأكيد طلبك:</p>
            <p><strong>${escape(ctx.listingTitle)}</strong></p>
            <p>المبلغ: ${ctx.amount.toFixed(3)} د.ك</p>
            <p>رقم الطلب: ${escape(ctx.orderId.slice(0, 8))}</p>
            <p>سنشعرك حين يتم شحن طلبك.</p>
          </div>
        </body>
        </html>
      `,
    })
  } catch (err) {
    console.error('[email] sendOrderPaidEmail failed', err)
    // Don't throw — emails are best-effort, must not block webhook
  }
}

export async function sendOrderShippedEmail(ctx: OrderEmailContext & { trackingUrl?: string }): Promise<void> {
  if (!client) return
  try {
    await client.emails.send({
      from: `ديمة <${fromAddress}>`,
      to: ctx.to,
      subject: 'تم شحن طلبك — ديمة',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <body style="font-family: -apple-system, sans-serif; background: #faf6f0; padding: 32px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; text-align: right;">
            <h1 style="color: #b8860b; margin: 0 0 16px;">تم شحن طلبك</h1>
            <p><strong>${escape(ctx.listingTitle)}</strong></p>
            ${ctx.trackingUrl ? `<p><a href="${escape(ctx.trackingUrl)}">تتبع الشحنة</a></p>` : ''}
          </div>
        </body>
        </html>
      `,
    })
  } catch (err) {
    console.error('[email] sendOrderShippedEmail failed', err)
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
