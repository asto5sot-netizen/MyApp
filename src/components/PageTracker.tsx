'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Fires a lightweight POST to /api/track on every client-side navigation.
// The request is fire-and-forget — failures are silently swallowed.
export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {})
  }, [pathname])

  return null
}
