import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createRouteClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api-response'

// Called by register page after supabase.auth.signUp() to create Profile record
export async function POST(req: NextRequest) {
  const supabase = createRouteClient(req)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return errorResponse('Unauthorized', 401)

  const body = await req.json()
  const { full_name, phone, city, preferred_language, role } = body

  if (!full_name) return errorResponse('Name is required', 422)
  if (!['client', 'pro'].includes(role)) return errorResponse('Invalid role', 422)

  const existing = await prisma.profile.findUnique({ where: { id: user.id } })
  if (existing) return successResponse({ user: existing })

  const profile = await prisma.profile.create({
    data: {
      id: user.id,
      email: user.email!,
      full_name,
      role,
      phone: phone || null,
      city: city || 'Bangkok',
      preferred_language: preferred_language || 'en',
    }
  })

  // Create pro_profile record if registering as pro
  if (role === 'pro') {
    await prisma.proProfile.create({ data: { profile_id: profile.id } })
  }

  return successResponse({ user: profile }, 201)
}
