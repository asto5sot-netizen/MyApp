import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMessageSchema } from '@/lib/validation-schemas'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { translateContent } from '@/lib/translation'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response'
import { messageRateLimit } from '@/lib/rate-limit'
import { getPaginationParams } from '@/lib/pagination'
import { notif } from '@/lib/notifications'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser(req)
  if (!payload) return unauthorizedResponse()

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const { page, limit, skip } = getPaginationParams(searchParams, 50)

  const conversation = await prisma.conversation.findUnique({ where: { id } })
  if (!conversation) return notFoundResponse('Conversation')
  if (conversation.client_id !== payload.userId && conversation.pro_id !== payload.userId) {
    return unauthorizedResponse()
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversation_id: id },
      include: { sender: { select: { id: true, full_name: true, avatar_url: true } } },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.message.count({ where: { conversation_id: id } })
  ])

  // Mark messages as read
  await prisma.message.updateMany({
    where: { conversation_id: id, sender_id: { not: payload.userId }, is_read: false },
    data: { is_read: true }
  })

  return successResponse({ messages: messages.reverse(), total, page, limit })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser(req)
  if (!payload) return unauthorizedResponse()

  const allowed = await messageRateLimit(payload.userId)
  if (!allowed) return errorResponse('Too many messages. Slow down.', 429)

  const { id } = await params

  const conversation = await prisma.conversation.findUnique({ where: { id } })
  if (!conversation) return notFoundResponse('Conversation')
  if (conversation.client_id !== payload.userId && conversation.pro_id !== payload.userId) {
    return unauthorizedResponse()
  }

  const body = await req.json()
  const parsed = sendMessageSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 422)

  const { content, message_type, attachment_url } = parsed.data

  const { originalLanguage, translated: contentTranslated } = await translateContent(content)

  const recipientId = payload.userId === conversation.client_id
    ? conversation.pro_id
    : conversation.client_id

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversation_id: id,
        sender_id: payload.userId,
        content,
        content_translated: contentTranslated,
        original_language: originalLanguage,
        message_type,
        attachment_url,
      },
      include: { sender: { select: { id: true, full_name: true, avatar_url: true } } }
    }),
    prisma.conversation.update({
      where: { id },
      data: { last_message_at: new Date() }
    }),
    prisma.notification.create({ data: notif.newMessage(recipientId, id, content) })
  ])

  return successResponse({ message }, 201)
}
