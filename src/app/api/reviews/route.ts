import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reviewSchema } from '@/lib/validation-schemas'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { Prisma } from '@prisma/client'
import { translateContent } from '@/lib/translation'
import { notif } from '@/lib/notifications'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  const payload = await getAuthUser(req, 'client')
  if (!payload) return unauthorizedResponse()

  const body = await req.json()
  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 422)

  const { job_id, pro_id, rating, comment } = parsed.data

  const job = await prisma.job.findUnique({ where: { id: job_id } })
  if (!job) return notFoundResponse('Job')
  if (job.client_id !== payload.userId) return unauthorizedResponse()
  if (job.status !== 'in_progress' && job.status !== 'done') {
    return errorResponse('Can only review completed jobs')
  }

  // Ensure the pro actually had an accepted proposal for this job
  const acceptedProposal = await prisma.proposal.findFirst({
    where: { job_id, pro_id, status: 'accepted' }
  })
  if (!acceptedProposal) return errorResponse('This professional was not accepted for this job', 403)

  const existing = await prisma.review.findUnique({
    where: { job_id_reviewer_id: { job_id, reviewer_id: payload.userId } }
  })
  if (existing) return errorResponse('Already reviewed this job', 409)

  let commentTranslated: Prisma.InputJsonValue | typeof Prisma.JsonNull = Prisma.JsonNull
  let originalLanguage = 'en'
  if (comment) {
    const t = await translateContent(comment)
    originalLanguage = t.originalLanguage
    commentTranslated = t.translated as Prisma.InputJsonValue
  }

  const review = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        job_id,
        reviewer_id: payload.userId,
        pro_id,
        rating,
        comment,
        comment_translated: commentTranslated,
        original_language: originalLanguage,
      }
    })

    // Update pro's average rating
    const agg = await tx.review.aggregate({
      where: { pro_id },
      _avg: { rating: true },
      _count: true,
    })

    await tx.proProfile.update({
      where: { profile_id: pro_id },
      data: {
        rating: agg._avg.rating || 0,
        reviews_count: agg._count,
      }
    })

    await tx.notification.create({ data: notif.newReview(pro_id, rating, job_id, review.id) })

    return review
  })

  return successResponse({ review }, 201)
}
