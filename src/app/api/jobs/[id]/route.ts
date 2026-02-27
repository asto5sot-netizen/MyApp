import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response'
import { notif } from '@/lib/notifications'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getAuthUser(req)

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

  // Only the job owner or admin can see proposals
  const canSeeProposals = payload && (payload.userId === job.client_id || payload.role === 'admin')
  const { proposals: _, ...jobWithoutProposals } = job
  const jobData = canSeeProposals ? job : jobWithoutProposals

  return successResponse({ job: jobData })
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

  const updated = await prisma.$transaction(async (tx) => {
    const updated = await tx.job.update({ where: { id }, data: { status } })

    if (status === 'done' && job.status !== 'done') {
      const accepted = await tx.proposal.findFirst({
        where: { job_id: id, status: 'accepted' },
      })
      if (accepted) {
        await tx.proProfile.update({
          where: { profile_id: accepted.pro_id },
          data: { completed_jobs: { increment: 1 } },
        })
        await tx.notification.create({
          data: notif.jobAccepted(accepted.pro_id, job.title, id),
        })
      }
    }

    return updated
  })

  return successResponse({ job: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser(req)
  if (!payload) return unauthorizedResponse()

  const { id } = await params
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) return notFoundResponse('Job')
  if (job.client_id !== payload.userId && payload.role !== 'admin') return unauthorizedResponse()

  if (job.status !== 'open') return errorResponse('Only open jobs can be deleted')

  await prisma.job.delete({ where: { id } })
  return successResponse({ deleted: true })
}
