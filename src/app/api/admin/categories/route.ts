import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

const createSchema = z.object({
  name_en: z.string().min(1).max(100),
  name_ru: z.string().min(1).max(100),
  name_th: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  parent_id: z.string().uuid(),
  icon_url: z.string().optional(),
  sort_order: z.number().int().default(0),
})

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return unauthorizedResponse()

  const categories = await prisma.category.findMany({
    where: { parent_id: null },
    orderBy: [{ sort_order: 'asc' }, { name_en: 'asc' }],
    include: { children: { orderBy: [{ sort_order: 'asc' }, { name_en: 'asc' }] } }
  })

  return successResponse({ categories })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorizedResponse()

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 422)

  const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } })
  if (existing) return errorResponse('Slug already exists', 409)

  const parent = await prisma.category.findUnique({ where: { id: parsed.data.parent_id } })
  if (!parent) return errorResponse('Parent category not found', 404)

  const category = await prisma.category.create({ data: parsed.data })
  return successResponse({ category }, 201)
}
