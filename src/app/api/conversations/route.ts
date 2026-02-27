import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { successResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const payload = await getAuthUser(req)
  if (!payload) return unauthorizedResponse()

  const where = payload.role === 'client'
    ? { client_id: payload.userId }
    : { pro_id: payload.userId }

  const conversations = await prisma.conversation.findMany({
    where: { ...where, is_archived: false },
    include: {
      job: { select: { id: true, title: true, status: true } },
      client: { select: { id: true, full_name: true, avatar_url: true } },
      pro: { select: { id: true, full_name: true, avatar_url: true } },
      messages: {
        orderBy: { created_at: 'desc' },
        take: 1
      },
      _count: {
        select: {
          messages: {
            where: { is_read: false, sender_id: { not: payload.userId } }
          }
        }
      }
    },
    orderBy: { last_message_at: 'desc' }
  })

  return successResponse({ conversations })
}
