import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categorySlug = searchParams.get('category')
  const city = searchParams.get('city')

  if (!categorySlug) return errorResponse('category is required', 400)

  const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
  if (!category) return errorResponse('Category not found', 404)

  // Find all category ids (parent + children if parent)
  const childCategories = await prisma.category.findMany({ where: { parent_id: category.id } })
  const categoryIds = [category.id, ...childCategories.map(c => c.id)]

  const where: Record<string, unknown> = {
    categories: { some: { category_id: { in: categoryIds } } },
    is_available: true,
  }
  if (city) where.city = city

  const pros = await prisma.proProfile.findMany({
    where,
    orderBy: { rating: 'desc' },
    take: 50,
    include: {
      profile: {
        select: {
          id: true,
          full_name: true,
          avatar_url: true,
          city: true,
        }
      },
      categories: {
        where: { category_id: { in: categoryIds } },
        include: { category: true },
      }
    }
  })

  return successResponse({ category, pros })
}
