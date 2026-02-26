import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { successResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const payload = await getAuthUser(req)
  if (!payload) return unauthorizedResponse()

  const jobs = await prisma.job.findMany({
    where: { client_id: payload.userId },
    include: {
      category: true,
      _count: { select: { proposals: true } }
    },
    orderBy: { created_at: 'desc' }
  })

  return successResponse({ jobs })
}
