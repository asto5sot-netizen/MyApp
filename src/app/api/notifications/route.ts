import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { successResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const payload = await getAuthUser(req)
  if (!payload) return unauthorizedResponse()

  const notifications = await prisma.notification.findMany({
    where: { user_id: payload.userId },
    orderBy: { created_at: 'desc' },
    take: 20,
  })

  return successResponse({ notifications })
}

export async function PATCH(req: NextRequest) {
  const payload = await getAuthUser(req)
  if (!payload) return unauthorizedResponse()

  await prisma.notification.updateMany({
    where: { user_id: payload.userId, is_read: false },
    data: { is_read: true }
  })

  return successResponse({ message: 'All marked as read' })
}
