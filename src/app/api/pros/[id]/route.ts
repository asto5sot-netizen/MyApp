import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, notFoundResponse } from '@/lib/api-response'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const user = await prisma.profile.findUnique({
    where: { id, role: 'pro' },
    select: {
      id: true,
      full_name: true,
      phone: true,
      avatar_url: true,
      preferred_language: true,
      created_at: true,
      pro_profile: {
        include: {
          categories: {
            include: { category: true }
          },
          photos: { orderBy: { sort_order: 'asc' } }
        }
      },
      reviews_received: {
        where: { is_moderated: true },
        include: {
          reviewer: { select: { id: true, full_name: true, avatar_url: true } }
        },
        orderBy: { created_at: 'desc' },
        take: 20
      }
    }
  })

  if (!user || !user.pro_profile) return notFoundResponse('Professional')
  return successResponse({ pro: user })
}
