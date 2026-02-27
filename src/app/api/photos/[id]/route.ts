import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api-response'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser(req, 'pro')
  if (!payload) return unauthorizedResponse()

  const { id } = await params

  const proProfile = await prisma.proProfile.findUnique({
    where: { profile_id: payload.userId },
    select: { id: true }
  })
  if (!proProfile) return errorResponse('Pro profile not found', 404)

  const photo = await prisma.proPhoto.findUnique({ where: { id } })
  if (!photo) return notFoundResponse('Photo')
  if (photo.pro_id !== proProfile.id) return unauthorizedResponse()

  await prisma.proPhoto.delete({ where: { id } })

  return successResponse({ deleted: true })
}
