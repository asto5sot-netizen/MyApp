import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      category: true,
      client: { select: { id: true, full_name: true, avatar_url: true, preferred_language: true } },
      proposals: {
        include: {
          pro: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true,
              pro_profile: {
                select: { rating: true, reviews_count: true, completed_jobs: true, city: true, verification_status: true }
              }
            }
          }
        },
        orderBy: { created_at: 'asc' }
      },
      _count: { select: { proposals: true } }
    }
  })

  if (!job) return notFoundResponse('Job')
  return successResponse({ job })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser(req)
  if (!payload) return unauthorizedResponse()

  const { id } = await params
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) return notFoundResponse('Job')
  if (job.client_id !== payload.userId && payload.role !== 'admin') return unauthorizedResponse()

  const body = await req.json()
  const { status } = body

  if (!['open', 'in_progress', 'done', 'cancelled'].includes(status)) {
    return errorResponse('Invalid status')
  }

  const updated = await prisma.job.update({
    where: { id },
    data: { status }
  })

  return successResponse({ job: updated })
}
