'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/Navbar'
import { THAI_CITIES, REGION_LABELS } from '@/lib/cities'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/hooks/useLang'

function passwordChecks(pw: string) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    digit: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  }
}

const regions = ['central', 'north', 'south', 'northeast'] as const

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

function RegisterForm() {
  const { t } = useTranslation()
  const lang = useLang()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [role, setRole] = useState<'client' | 'pro'>(
    (searchParams.get('role') as 'client' | 'pro') || 'client'
  )
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    full_name: '',
    phone: '',
    city: 'Bangkok',
    preferred_language: (lang || 'en') as 'en' | 'th' | 'ru',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const checks = passwordChecks(form.password)
  const passwordValid = Object.values(checks).every(Boolean)
  const passwordsMatch = form.password === form.passwordConfirm && form.passwordConfirm.length > 0
  const canSubmit = passwordValid && passwordsMatch && form.email && form.full_name

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordValid) { setError('Password does not meet requirements'); return }
    if (!passwordsMatch) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    try {
      // 1. Create auth user — pass metadata so callback can create Profile if email confirmation is required
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            role,
            city: form.city,
            phone: form.phone || null,
            preferred_language: form.preferred_language,
          },
        },
      })
      if (authError) { setError(authError.message); return }
      if (!data.user) { setError('Registration failed. Please try again.'); return }

      // 2a. Email confirmation required — session is null, Profile will be created in /api/auth/callback
      if (!data.session) {
        setEmailSent(true)
        return
      }

      // 2b. Email confirmation disabled — session exists, create Profile immediately
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          phone: form.phone || undefined,
          city: form.city,
          preferred_language: form.preferred_language,
          role,
        }),
      })
      const result = await res.json()
      if (!result.success) {
        setError(result.error || 'Profile creation failed')
        return
      }

      router.push(role === 'client' ? '/dashboard/client' : '/dashboard/pro')
    } catch {
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-500 text-sm mb-4">
              We sent a confirmation link to <strong>{form.email}</strong>. Click the link to activate your account.
            </p>
            <p className="text-xs text-gray-400">Did not receive it? Check your spam folder.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.register')}</h1>
          <p className="text-gray-500 text-sm mb-6">
            {t('auth.haveAccount')}{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">{t('auth.loginBtn')}</Link>
          </p>

          <button onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 mb-4 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            <GoogleIcon />
            Continue with Google
          </button>
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"/></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or with email</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button" onClick={() => setRole('client')}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-colors ${
                role === 'client' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
              }`}>
              {t('auth.asClient')}
            </button>
            <button type="button" onClick={() => setRole('pro')}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-colors ${
                role === 'pro' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
              }`}>
              {t('auth.asPro')}
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.name')}</label>
              <input type="text" required value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  form.password && !passwordValid ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Min. 8 characters"
              />
              {(passwordFocused || (form.password.length > 0 && !passwordValid)) && (
                <div className="mt-2 space-y-1">
                  {[
                    { key: 'length', label: 'Minimum 8 characters' },
                    { key: 'upper', label: 'Uppercase letter (A-Z)' },
                    { key: 'lower', label: 'Lowercase letter (a-z)' },
                    { key: 'digit', label: 'Number (0-9)' },
                    { key: 'special', label: 'Special character (!@#$...)' },
                  ].map(({ key, label }) => (
                    <div key={key} className={`flex items-center gap-1.5 text-xs ${checks[key as keyof typeof checks] ? 'text-green-600' : 'text-gray-400'}`}>
                      <span>{checks[key as keyof typeof checks] ? '✓' : '○'}</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <input type="password" required value={form.passwordConfirm}
                onChange={e => setForm(f => ({ ...f, passwordConfirm: e.target.value }))}
                className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  form.passwordConfirm && !passwordsMatch ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Repeat password"
              />
              {form.passwordConfirm && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City in Thailand</label>
              <select required value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
                {regions.map(region => (
                  <optgroup key={region} label={REGION_LABELS[region]}>
                    {THAI_CITIES.filter(c => c.region === region).map(city => (
                      <option key={city.value} value={city.value}>{city.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="+66 80 000 0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.language')}</label>
              <select value={form.preferred_language}
                onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value as 'en' | 'th' | 'ru' }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
                <option value="en">English</option>
                <option value="th">ภาษาไทย</option>
                <option value="ru">Русский</option>
              </select>
            </div>

            <button type="submit" disabled={loading || !canSubmit}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? t('common.loading') : t('auth.registerBtn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
