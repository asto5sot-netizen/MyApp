import { NotificationType } from '@prisma/client'

/**
 * Notification factory — creates typed notification data objects.
 * Replaces inline notification data in prisma.notification.create() calls.
 *
 * Usage:
 *   prisma.notification.create({ data: notif.newMessage(recipientId, convId, content) })
 */
export const notif = {
  newMessage: (userId: string, conversationId: string, content: string) => ({
    user_id: userId,
    type: NotificationType.new_message,
    title: 'New message',
    body: content.substring(0, 100),
    data: { conversation_id: conversationId },
  }),

  proposalAccepted: (userId: string, jobTitle: string, jobId: string, proposalId: string, conversationId: string) => ({
    user_id: userId,
    type: NotificationType.proposal_accepted,
    title: 'Your proposal was accepted!',
    body: `Client accepted your proposal for: "${jobTitle}"`,
    data: { job_id: jobId, proposal_id: proposalId, conversation_id: conversationId },
  }),

  newProposal: (userId: string, jobTitle: string, jobId: string) => ({
    user_id: userId,
    type: NotificationType.new_proposal,
    title: 'New proposal received',
    body: `A professional responded to your job: "${jobTitle}"`,
    data: { job_id: jobId, proposal_id: 'pending' },
  }),

  newReview: (userId: string, rating: number, jobId: string, reviewId: string) => ({
    user_id: userId,
    type: NotificationType.new_review,
    title: 'You received a new review',
    body: `Rating: ${rating}/5`,
    data: { job_id: jobId, review_id: reviewId },
  }),

  jobAccepted: (userId: string, jobTitle: string, jobId: string) => ({
    user_id: userId,
    type: NotificationType.job_accepted,
    title: 'Job marked as completed',
    body: `Client confirmed completion of: "${jobTitle}"`,
    data: { job_id: jobId },
  }),
}
