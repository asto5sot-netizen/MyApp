import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateProfileSchema } from '@/lib/validation-schemas'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { translateToAllLanguages, detectLanguage } from '@/lib/translation'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function PATCH(req: NextRequest) {
  const payload = await getAuthUser(req)
  if (!payload) return unauthorizedResponse()

  const body = await req.json()
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 422)

  const { full_name, phone, preferred_language, avatar_url, bio, experience_years,
    hourly_rate, service_radius_km, city, is_available, category_ids,
    whatsapp, telegram, line_id, facebook, instagram, tiktok, youtube, website } = parsed.data

  // Update user
  const userUpdate: Record<string, unknown> = {}
  if (full_name !== undefined) userUpdate.full_name = full_name
  if (phone !== undefined) {
    userUpdate.phone = phone
  }
  if (preferred_language !== undefined) userUpdate.preferred_language = preferred_language
  if (avatar_url !== undefined) userUpdate.avatar_url = avatar_url
  if (city !== undefined) userUpdate.city = city

  if (Object.keys(userUpdate).length > 0) {
    await prisma.profile.update({ where: { id: payload.userId }, data: userUpdate })
  }

  // Update pro profile if role is pro
  if (payload.role === 'pro') {
    const proUpdate: Record<string, unknown> = {}
    if (bio !== undefined) {
      const lang = await detectLanguage(bio)
      proUpdate.bio = bio
      proUpdate.bio_translated = await translateToAllLanguages(bio, lang)
    }
    if (experience_years !== undefined) proUpdate.experience_years = experience_years
    if (hourly_rate !== undefined) proUpdate.hourly_rate = hourly_rate
    if (service_radius_km !== undefined) proUpdate.service_radius_km = service_radius_km
    if (city !== undefined) proUpdate.city = city
    if (is_available !== undefined) proUpdate.is_available = is_available
    if (whatsapp !== undefined) proUpdate.whatsapp = whatsapp || null
    if (telegram !== undefined) proUpdate.telegram = telegram || null
    if (line_id !== undefined) proUpdate.line_id = line_id || null
    if (facebook !== undefined) proUpdate.facebook = facebook || null
    if (instagram !== undefined) proUpdate.instagram = instagram || null
    if (tiktok !== undefined) proUpdate.tiktok = tiktok || null
    if (youtube !== undefined) proUpdate.youtube = youtube || null
    if (website !== undefined) proUpdate.website = website || null

    if (Object.keys(proUpdate).length > 0) {
      await prisma.proProfile.update({ where: { profile_id: payload.userId }, data: proUpdate })
    }

    // Update categories
    if (category_ids !== undefined) {
      const proProfile = await prisma.proProfile.findUnique({ where: { profile_id: payload.userId } })
      if (proProfile) {
        await prisma.proCategory.deleteMany({ where: { pro_id: proProfile.id } })
        if (category_ids.length > 0) {
          await prisma.proCategory.createMany({
            data: category_ids.map(cat_id => ({ pro_id: proProfile.id, category_id: cat_id }))
          })
        }
      }
    }
  }

  const user = await prisma.profile.findUnique({
    where: { id: payload.userId },
    select: {
      id: true, email: true, role: true, full_name: true, avatar_url: true,
      preferred_language: true, phone: true,
      pro_profile: {
        include: {
          categories: { include: { category: true } },
          photos: true
        }
      }
    }
  })

  return successResponse({ user })
}
