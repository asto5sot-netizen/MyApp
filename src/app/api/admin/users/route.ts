import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { successResponse } from '@/lib/api-response'
import type { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorizedResponse()

  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const role = url.searchParams.get('role') || 'all'
  const search = url.searchParams.get('search') || ''
  const limit = 25

  const where: Prisma.ProfileWhereInput = {
    ...(role !== 'all' ? { role: role as 'client' | 'pro' | 'admin' } : {}),
    ...(search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { full_name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ],
    } : {}),
  }

  const [users, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true, email: true, full_name: true, role: true,
        is_verified: true, phone: true,
        city: true, created_at: true,
        pro_profile: {
          select: {
            verification_status: true,
            rating: true,
            reviews_count: true,
            completed_jobs: true,
          },
        },
      },
    }),
    prisma.profile.count({ where }),
  ])

  return successResponse({
    users: users.map(u => ({
      ...u,
      pro_profile: u.pro_profile
        ? { ...u.pro_profile, rating: u.pro_profile.rating ? Number(u.pro_profile.rating) : null }
        : null,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  })
}
