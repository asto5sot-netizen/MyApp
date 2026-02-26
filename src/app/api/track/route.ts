import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

// Lightweight page-view tracking via Redis counters.
// Called fire-and-forget from the PageTracker client component.
// Keys: pageviews:YYYY-MM-DD  (daily total)
//       pageviews:path:YYYY-MM-DD:/some/path  (per-path)

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const date = new Date().toISOString().split('T')[0]

    await redis.incr(`pageviews:${date}`)

    if (body.path && typeof body.path === 'string') {
      // Normalise path — strip query strings, limit length
      const path = body.path.split('?')[0].slice(0, 100)
      await redis.incr(`pageviews:path:${date}:${path}`)
      // Expire individual path keys after 90 days to avoid unbounded growth
      await redis.expire(`pageviews:path:${date}:${path}`, 60 * 60 * 24 * 90)
    }

    // Keep daily totals for 1 year
    await redis.expire(`pageviews:${date}`, 60 * 60 * 24 * 365)

    return NextResponse.json({ ok: true })
  } catch {
    // Silently swallow errors — tracking must never break the site
    return NextResponse.json({ ok: false })
  }
}
