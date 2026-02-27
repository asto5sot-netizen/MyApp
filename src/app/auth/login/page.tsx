'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { GoogleIcon, FacebookIcon } from '@/components/auth/OAuthIcons'

function LoginForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error')
  const resetSuccess = searchParams.get('reset') === 'success'
  const supabase = createClient()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(
    oauthError === 'oauth' ? 'Sign-in failed. Please try again.' :
    oauthError === 'no_email' ? 'Facebook did not share your email. Please allow email access or use another sign-in method.' :
    oauthError === 'profile_create' ? 'Account creation failed. Please try again.' :
    oauthError === 'db' ? 'Database error. Please try again in a moment.' : ''
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return
        const res = await fetch('/api/profile/me')
        const d = await res.json()
        const role = d?.data?.user?.role || 'client'
        router.replace(role === 'admin' ? '/admin' : role === 'pro' ? '/dashboard/pro' : '/dashboard/client')
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (authError) { setError(authError.message); return }

      const res = await fetch('/api/profile/me')
      const d = await res.json()
      const role = d?.data?.user?.role || 'client'
      router.push(role === 'admin' ? '/admin' : role === 'pro' ? '/dashboard/pro' : '/dashboard/client')
    } catch {
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  const signInWithFacebook = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.login')}</h1>
          <p className="text-gray-500 text-sm mb-6">{t('auth.noAccount')}{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline">{t('auth.registerBtn')}</Link>
          </p>

          {resetSuccess && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">Password updated successfully. Please log in.</div>
          )}
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
          )}

          <div className="space-y-2 mb-4">
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              <GoogleIcon />
              Continue with Google
            </button>
            <button
              onClick={signInWithFacebook}
              className="w-full flex items-center justify-center gap-3 border border-blue-200 rounded-xl py-3 hover:bg-blue-50 transition-colors text-sm font-medium text-blue-700"
            >
              <FacebookIcon />
              Continue with Facebook
            </button>
          </div>
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or with email</span></div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">{t('auth.password')}</label>
                <Link href="/auth/reset-password" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? t('common.loading') : t('auth.loginBtn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginForm />
    </Suspense>
  )
}
