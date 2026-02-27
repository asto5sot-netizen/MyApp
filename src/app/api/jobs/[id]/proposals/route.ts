import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { proposalSchema } from '@/lib/validation-schemas'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { translateContent } from '@/lib/translation'
import { notif } from '@/lib/notifications'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser(req, 'pro')
  if (!payload) return unauthorizedResponse()

  const { id: job_id } = await params

  const job = await prisma.job.findUnique({ where: { id: job_id, status: 'open' } })
  if (!job) return notFoundResponse('Job')
  if (job.client_id === payload.userId) return errorResponse('Cannot apply to your own job')

  const existing = await prisma.proposal.findUnique({
    where: { job_id_pro_id: { job_id, pro_id: payload.userId } }
  })
  if (existing) return errorResponse('Already submitted a proposal for this job', 409)

  const body = await req.json()
  const parsed = proposalSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 422)

  const { message, ...rest } = parsed.data
  const { originalLanguage, translated: messageTranslated } = await translateContent(message)

  const [proposal] = await prisma.$transaction([
    prisma.proposal.create({
      data: {
        job_id,
        pro_id: payload.userId,
        message,
        message_translated: messageTranslated,
        original_language: originalLanguage,
        ...rest,
      },
      include: {
        pro: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            pro_profile: {
              select: { rating: true, reviews_count: true, completed_jobs: true, verification_status: true }
            }
          }
        }
      }
    }),
    prisma.job.update({
      where: { id: job_id },
      data: { proposals_count: { increment: 1 } }
    }),
    prisma.notification.create({ data: notif.newProposal(job.client_id, job.title, job_id) })
  ])

  return successResponse({ proposal }, 201)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser(req)
  if (!payload) return unauthorizedResponse()

  const { id: job_id } = await params
  const job = await prisma.job.findUnique({ where: { id: job_id } })
  if (!job) return notFoundResponse('Job')

  // Only job owner or admin can see all proposals
  if (job.client_id !== payload.userId && payload.role !== 'admin') return unauthorizedResponse()

  const proposals = await prisma.proposal.findMany({
    where: { job_id },
    include: {
      pro: {
        select: {
          id: true,
          full_name: true,
          avatar_url: true,
          preferred_language: true,
          pro_profile: {
            select: { rating: true, reviews_count: true, completed_jobs: true, city: true, verification_status: true, hourly_rate: true }
          }
        }
      }
    },
    orderBy: { created_at: 'asc' }
  })

  return successResponse({ proposals })
}
