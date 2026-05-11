import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const kind = url.searchParams.get('kind')
  const id = url.searchParams.get('id')
  const target = kind === 'order' ? `/orders/${id ?? ''}` : '/dashboard'
  return NextResponse.redirect(new URL(target, url.origin))
}
