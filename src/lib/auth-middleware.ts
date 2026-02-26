import { NextRequest } from 'next/server'
import { createRouteClient, createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { unauthorizedResponse } from '@/lib/api-response'

export interface AuthPayload {
  userId: string
  role: string
  email: string
}

/**
 * Validates Supabase session from request cookies.
 * Returns null if unauthenticated or wrong role.
 *
 * Usage:
 *   const payload = await getAuthUser(req)
 *   if (!payload) return unauthorizedResponse()
 *
 *   const payload = await getAuthUser(req, 'client')
 *   if (!payload) return unauthorizedResponse()
 */
export async function getAuthUser(req: NextRequest, role?: string): Promise<AuthPayload | null> {
  const supabase = createRouteClient(req)
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!profile) return null
  if (role && profile.role !== role) return null

  return { userId: user.id, role: profile.role, email: user.email! }
}

/**
 * For admin Server Components and Route Handlers that don't have NextRequest.
 * Uses cookies() from next/headers.
 * Returns null if unauthenticated or not admin.
 */
export async function getAdminUser(): Promise<AuthPayload | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!profile || profile.role !== 'admin') return null

  return { userId: user.id, role: profile.role, email: user.email! }
}

export { unauthorizedResponse }
