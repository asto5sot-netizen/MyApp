import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categorySlug = searchParams.get('category')
  const city = searchParams.get('city')
  const minRating = parseFloat(searchParams.get('min_rating') || '0')

  const where: Record<string, unknown> = { is_available: true }

  if (categorySlug) {
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
    if (!category) return errorResponse('Category not found', 404)

    const childCategories = await prisma.category.findMany({ where: { parent_id: category.id } })
    const categoryIds = [category.id, ...childCategories.map(c => c.id)]
    where.categories = { some: { category_id: { in: categoryIds } } }
  }

  if (city) where.city = city
  if (minRating > 0) where.rating = { gte: minRating }

  const pros = await prisma.proProfile.findMany({
    where,
    orderBy: { rating: 'desc' },
    take: 60,
    include: {
      profile: {
        select: { id: true, full_name: true, avatar_url: true, city: true }
      },
      categories: {
        include: { category: true },
        take: 3,
      }
    }
  })

  return successResponse({ pros })
}
