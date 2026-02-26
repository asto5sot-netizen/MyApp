import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { successResponse } from '@/lib/api-response'
import { getPaginationParams } from '@/lib/pagination'

export async function GET(req: NextRequest) {
  const payload = await getAuthUser(req, 'pro')
  if (!payload) return unauthorizedResponse()

  const { searchParams } = new URL(req.url)
  const { page, limit, skip } = getPaginationParams(searchParams)

  const [proposals, total] = await Promise.all([
    prisma.proposal.findMany({
      where: { pro_id: payload.userId },
      include: {
        job: {
          include: {
            category: true,
            client: { select: { id: true, full_name: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.proposal.count({ where: { pro_id: payload.userId } }),
  ])

  return successResponse({ proposals, total, page, limit })
}
