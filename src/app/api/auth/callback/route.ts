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

  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth`)
  }

  // Ensure Profile exists — covers OAuth (Google) and email confirmation flows
  let profile = await prisma.profile.findUnique({ where: { id: data.user.id } })
  if (!profile) {
    const meta = data.user.user_metadata ?? {}
    const role = (meta.role as 'client' | 'pro' | 'admin') || 'client'
    profile = await prisma.profile.create({
      data: {
        id: data.user.id,
        email: data.user.email!,
        full_name: meta.full_name || meta.name || data.user.email!.split('@')[0],
        role,
        avatar_url: meta.avatar_url || null,
        city: meta.city || 'Bangkok',
        phone: meta.phone || null,
        preferred_language: meta.preferred_language || 'en',
      }
    })
    if (role === 'pro') {
      await prisma.proProfile.create({ data: { profile_id: profile.id } })
    }
  }

  // Redirect to role-appropriate dashboard
  const destination = profile.role === 'admin' ? '/admin' : profile.role === 'pro' ? '/dashboard/pro' : '/dashboard/client'
  return NextResponse.redirect(`${origin}${destination}`)
}
