import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser()
  if (!admin) return unauthorizedResponse()

  const { id } = await params
  const body = await req.json().catch(() => ({}))

  if (id === admin.userId && body.role && body.role !== 'admin') {
    return errorResponse('Cannot change your own admin role', 400)
  }

  const updated = await prisma.profile.update({
    where: { id },
    data: {
      ...(body.role && ['client', 'pro', 'admin'].includes(body.role) ? { role: body.role } : {}),
      ...(body.is_verified !== undefined ? { is_verified: Boolean(body.is_verified) } : {}),
    },
    select: { id: true, email: true, role: true, is_verified: true },
  })

  return successResponse({ user: updated })
}
