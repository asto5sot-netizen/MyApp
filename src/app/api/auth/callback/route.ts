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

  // Ensure Profile exists for OAuth users (Google, etc.)
  const profile = await prisma.profile.findUnique({ where: { id: data.user.id } })
  if (!profile) {
    await prisma.profile.create({
      data: {
        id: data.user.id,
        email: data.user.email!,
        full_name: data.user.user_metadata?.full_name || data.user.email!.split('@')[0],
        role: 'client',
        avatar_url: data.user.user_metadata?.avatar_url || null,
      }
    })
  }

  // Redirect to role-appropriate dashboard
  const role = profile?.role || 'client'
  const destination = role === 'admin' ? '/admin' : role === 'pro' ? '/dashboard/pro' : '/dashboard/client'
  return NextResponse.redirect(`${origin}${destination}`)
}
