import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response'

const updateSchema = z.object({
  name_en: z.string().min(1).max(100).optional(),
  name_ru: z.string().min(1).max(100).optional(),
  name_th: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  icon_url: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return unauthorizedResponse()

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 422)

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) return notFoundResponse('Category')

  const updated = await prisma.category.update({ where: { id }, data: parsed.data })
  return successResponse({ category: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return unauthorizedResponse()

  const { id } = await params
  const category = await prisma.category.findUnique({ where: { id }, include: { children: true } })
  if (!category) return notFoundResponse('Category')
  if (category.children.length > 0) return errorResponse('Cannot delete category with subcategories', 400)

  await prisma.category.delete({ where: { id } })
  return successResponse({ deleted: true })
}
