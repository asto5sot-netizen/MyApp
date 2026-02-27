import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  let db = 'FAIL'
  try {
    await prisma.$queryRaw`SELECT 1`
    db = 'OK'
  } catch {
    // db remains FAIL
  }

  // In production: only expose db status — no infrastructure details
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ db })
  }

  return NextResponse.json({
    db,
    env: {
      DATABASE_URL: process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':***@') ?? 'MISSING',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
    }
  })
}
