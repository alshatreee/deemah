'use client'
import { useEffect } from 'react'

export function TrackListingView({ listingId }: { listingId: string }) {
  useEffect(() => {
    const key = `viewed_${listingId}_${new Date().toDateString()}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    fetch(`/api/listings/${listingId}/view`, { method: 'POST' }).catch(() => {})
  }, [listingId])
  return null
}
