import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`)
  }

  // Collect cookies set during exchangeCodeForSession to apply to the final response
  const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            pendingCookies.push({ name, value, options: options as Record<string, unknown> })
          )
        },
      },
    }
  )

  let data, error
  try {
    const result = await supabase.auth.exchangeCodeForSession(code)
    data = result.data
    error = result.error
  } catch {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth`)
  }

  if (error || !data?.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth`)
  }

  // Ensure Profile exists — covers OAuth (Google, Facebook) and email confirmation flows
  const meta = data.user.user_metadata ?? {}
  const email = data.user.email || meta.email
  if (!email) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_email`)
  }

  let profile
  try {
    profile = await prisma.profile.findUnique({ where: { id: data.user.id } })

    if (!profile) {
      // Check if profile exists by email (user registered with email/password before OAuth)
      const existingByEmail = await prisma.profile.findUnique({ where: { email } })
      if (existingByEmail) {
        // Update ID to match Supabase auth ID (migrating from old custom auth)
        try {
          profile = await prisma.profile.update({
            where: { email },
            data: { id: data.user.id, avatar_url: existingByEmail.avatar_url || meta.avatar_url || meta.picture || null },
          })
        } catch {
          // FK constraints prevent ID update — use existing profile as-is
          profile = existingByEmail
        }
      } else {
        // New user — create profile
        const role = (meta.role as 'client' | 'pro' | 'admin') || 'client'
        profile = await prisma.profile.create({
          data: {
            id: data.user.id,
            email,
            full_name: meta.full_name || meta.name || email.split('@')[0],
            role,
            avatar_url: meta.avatar_url || meta.picture || null,
            city: meta.city || 'Bangkok',
            phone: meta.phone || null,
            preferred_language: meta.preferred_language || 'en',
          }
        })
        if (profile.role === 'pro') {
          await prisma.proProfile.create({ data: { profile_id: profile.id } })
        }
      }
    }
  } catch (err) {
    console.error('[auth/callback] DB error:', err)
    return NextResponse.redirect(`${origin}/auth/login?error=db`)
  }

  if (!profile) {
    return NextResponse.redirect(`${origin}/auth/login?error=profile_create`)
  }

  // Redirect to role-appropriate dashboard, applying session cookies to the response
  const destination = profile.role === 'admin' ? '/admin' : profile.role === 'pro' ? '/dashboard/pro' : '/dashboard/client'
  const finalResponse = NextResponse.redirect(`${origin}${destination}`)
  pendingCookies.forEach(({ name, value, options }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    finalResponse.cookies.set(name, value, options as any)
  )
  return finalResponse
}
