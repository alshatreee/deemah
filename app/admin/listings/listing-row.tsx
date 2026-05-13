'use client'
import { useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { setListingStatusAction } from './actions'

export function ListingRow({ listing }: { listing: any }) {
  const [pending, startTransition] = useTransition()
  function archive() {
    if (!confirm('أرشفة المنتج؟')) return
    startTransition(async () => {
      const r = await setListingStatusAction(listing.id, 'archived')
      if (r?.error) alert(r.error)
    })
  }
  return (
    <tr className="border-t">
      <td className="p-3">
        <Link href={`/listings/${listing.id}`} className="hover:underline">{listing.title}</Link>
      </td>
      <td className="p-3">{listing.users?.username || '-'}</td>
      <td className="p-3">{Number(listing.price_buy).toFixed(3)} د.ك</td>
      <td className="p-3">{listing.status}</td>
      <td className="p-3">
        {listing.status !== 'archived' && (
          <Button size="sm" variant="destructive" disabled={pending} onClick={archive}>
            أرشفة
          </Button>
        )}
      </td>
    </tr>
  )
}
