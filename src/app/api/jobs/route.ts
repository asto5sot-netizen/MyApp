import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createJobSchema } from '@/lib/validation-schemas'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { detectLanguage, translateToAllLanguages } from '@/lib/translation'
import { successResponse, errorResponse } from '@/lib/api-response'
import { jobCreateRateLimit } from '@/lib/rate-limit'
import { getPaginationParams } from '@/lib/pagination'

export async function POST(req: NextRequest) {
  const payload = await getAuthUser(req, 'client')
  if (!payload) return unauthorizedResponse()

  const allowed = await jobCreateRateLimit(payload.userId)
  if (!allowed) return errorResponse('Too many jobs created. Try again later.', 429)

  const body = await req.json()
  const parsed = createJobSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 422)

  const { title, description, preferred_date, ...rest } = parsed.data

  const originalLanguage = await detectLanguage(title + ' ' + description)
  const [titleTranslated, descTranslated] = await Promise.all([
    translateToAllLanguages(title, originalLanguage),
    translateToAllLanguages(description, originalLanguage),
  ])

  const job = await prisma.job.create({
    data: {
      client_id: payload.userId,
      title,
      description,
      original_language: originalLanguage,
      title_translated: titleTranslated,
      description_translated: descTranslated,
      preferred_date: preferred_date ? new Date(preferred_date) : undefined,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      ...rest,
    },
    include: {
      category: true,
      client: { select: { id: true, full_name: true, avatar_url: true } },
    }
  })

  return successResponse({ job }, 201)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category_id = searchParams.get('category_id')
  const city = searchParams.get('city') || 'Bangkok'
  const { page, limit, skip } = getPaginationParams(searchParams)

  const where: Record<string, unknown> = {
    status: 'open',
    expires_at: { gt: new Date() },
  }
  if (category_id) where.category_id = category_id
  if (city) where.city = city

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        category: true,
        client: { select: { id: true, full_name: true, avatar_url: true } },
        _count: { select: { proposals: true } }
      }
    }),
    prisma.job.count({ where })
  ])

  return successResponse({ jobs, total, page, limit })
}
