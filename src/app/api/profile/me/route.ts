import { NextRequest } from 'next/server'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { successResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const payload = await getAuthUser(req)
  if (!payload) return unauthorizedResponse()

  const user = await prisma.profile.findUnique({
    where: { id: payload.userId },
    select: {
      id: true, email: true, role: true, full_name: true,
      avatar_url: true, preferred_language: true, phone: true,
      is_verified: true, created_at: true, city: true,
      pro_profile: {
        select: {
          id: true, bio: true, experience_years: true, hourly_rate: true,
          service_radius_km: true, city: true, rating: true, reviews_count: true,
          completed_jobs: true, verification_status: true, is_available: true,
          whatsapp: true, telegram: true, line_id: true,
          facebook: true, instagram: true, tiktok: true, youtube: true, website: true,
        }
      }
    }
  })

  if (!user) return unauthorizedResponse()
  return successResponse({ user })
}
