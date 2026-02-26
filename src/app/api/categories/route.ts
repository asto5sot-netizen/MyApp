import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const flat = searchParams.get('flat') === 'true'

  if (flat) {
    const categories = await prisma.category.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { name_en: 'asc' }]
    })
    return successResponse({ categories })
  }

  // Return tree structure
  const categories = await prisma.category.findMany({
    where: { is_active: true, parent_id: null },
    orderBy: [{ sort_order: 'asc' }],
    include: {
      children: {
        where: { is_active: true },
        orderBy: [{ sort_order: 'asc' }]
      }
    }
  })

  return successResponse({ categories })
}
