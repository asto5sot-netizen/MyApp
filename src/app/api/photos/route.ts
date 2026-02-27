import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const payload = await getAuthUser(req, 'pro')
  if (!payload) return unauthorizedResponse()

  const proProfile = await prisma.proProfile.findUnique({
    where: { profile_id: payload.userId },
    select: { id: true }
  })
  if (!proProfile) return errorResponse('Pro profile not found', 404)

  const photos = await prisma.proPhoto.findMany({
    where: { pro_id: proProfile.id },
    orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }]
  })

  return successResponse({ photos })
}

export async function POST(req: NextRequest) {
  const payload = await getAuthUser(req, 'pro')
  if (!payload) return unauthorizedResponse()

  const proProfile = await prisma.proProfile.findUnique({
    where: { profile_id: payload.userId },
    select: { id: true }
  })
  if (!proProfile) return errorResponse('Pro profile not found', 404)

  const count = await prisma.proPhoto.count({ where: { pro_id: proProfile.id } })
  if (count >= 12) return errorResponse('Maximum 12 photos allowed', 400)

  const body = await req.json()
  const { url, caption } = body
  if (!url) return errorResponse('url is required', 422)

  const photo = await prisma.proPhoto.create({
    data: { pro_id: proProfile.id, url, caption: caption || null, sort_order: count }
  })

  return successResponse({ photo }, 201)
}
