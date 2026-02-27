import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response'
import { notif } from '@/lib/notifications'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser(req, 'client')
  if (!payload) return unauthorizedResponse()

  const { id } = await params

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { job: true }
  })
  if (!proposal) return notFoundResponse('Proposal')
  if (proposal.job.client_id !== payload.userId) return unauthorizedResponse()
  if (proposal.job.status !== 'open') return errorResponse('Job is not open')

  // Accept this proposal, reject all others, update job status, create conversation
  let conversationId: string
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.proposal.update({ where: { id }, data: { status: 'accepted' } })
      await tx.proposal.updateMany({
        where: { job_id: proposal.job_id, id: { not: id } },
        data: { status: 'rejected' }
      })
      await tx.job.update({ where: { id: proposal.job_id }, data: { status: 'in_progress' } })
      const conversation = await tx.conversation.upsert({
        where: {
          job_id_client_id_pro_id: {
            job_id: proposal.job_id,
            client_id: payload.userId,
            pro_id: proposal.pro_id
          }
        },
        create: {
          job_id: proposal.job_id,
          client_id: payload.userId,
          pro_id: proposal.pro_id
        },
        update: {}
      })
      await tx.notification.create({ data: notif.proposalAccepted(proposal.pro_id, proposal.job.title, proposal.job_id, id, conversation.id) })
      return conversation
    })
    conversationId = result.id
  } catch (err) {
    console.error('[proposals/accept] transaction error:', err)
    return errorResponse('Failed to accept proposal', 500)
  }

  return successResponse({ message: 'Proposal accepted', conversation_id: conversationId })
}
