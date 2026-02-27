'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/Navbar'
import { THAI_CITIES, REGION_LABELS } from '@/lib/cities'

interface Category {
  id: string
  slug: string
  name_en: string
  name_ru: string
  name_th: string
  parent_id?: string
  children?: Category[]
}

export default function CreateJobPage() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [catSearch, setCatSearch] = useState('')
  const [catOpen, setCatOpen] = useState(false)
  const catRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const [form, setForm] = useState({
    category_id: '',
    title: '',
    description: '',
    budget_min: '',
    budget_max: '',
    location_address: '',
    district: '',
    city: 'Bangkok',
    preferred_date: '',
  })

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(d.data?.categories || []))
  }, [])

  const getCategoryName = (cat: Category) => {
    const lang = i18n.language
    return lang === 'ru' ? cat.name_ru : lang === 'th' ? cat.name_th : cat.name_en
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.budget_min && form.budget_max) {
      if (parseFloat(form.budget_min) > parseFloat(form.budget_max)) {
        setError('Minimum budget cannot be greater than maximum budget')
        return
      }
    }

    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        category_id: form.category_id,
        title: form.title,
        description: form.description,
        city: form.city,
      }
      if (form.budget_min) body.budget_min = parseFloat(form.budget_min)
      if (form.budget_max) body.budget_max = parseFloat(form.budget_max)
      if (form.location_address) body.location_address = form.location_address
      if (form.district) body.district = form.district
      if (form.preferred_date) body.preferred_date = new Date(form.preferred_date).toISOString()

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!data.success) {
        if (res.status === 401) { router.push('/auth/login'); return }
        setError(data.error)
        return
      }
      router.push(`/jobs/${data.data.job.id}`)
    } catch {
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const regions = ['central', 'north', 'south', 'northeast'] as const

  // Flatten categories for select
  const allCategories: Category[] = []
  categories.forEach(cat => {
    allCategories.push(cat)
    cat.children?.forEach(child => allCategories.push(child))
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-blue-600 text-sm flex items-center gap-1 mb-4 hover:underline">
            ← {t('common.back')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t('jobs.createNew')}</h1>
          <p className="text-gray-500 text-sm mt-1">Professionals will respond within hours</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div ref={catRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs.category')} *</label>
            <button
              type="button"
              onClick={() => setCatOpen(o => !o)}
              className={`w-full text-left border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                form.category_id ? 'text-gray-900 border-gray-200' : 'text-gray-400 border-gray-200'
              }`}
            >
              {form.category_id
                ? allCategories.find(c => c.id === form.category_id) ? getCategoryName(allCategories.find(c => c.id === form.category_id)!) : 'Select a category...'
                : 'Select a category...'}
              <span className="float-right text-gray-400">▾</span>
            </button>
            {catOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-gray-100">
                  <input
                    type="text"
                    autoFocus
                    value={catSearch}
                    onChange={e => setCatSearch(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {allCategories
                    .filter(c => getCategoryName(c).toLowerCase().includes(catSearch.toLowerCase()))
                    .map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => { setForm(f => ({ ...f, category_id: cat.id })); setCatOpen(false); setCatSearch('') }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors ${
                          form.category_id === cat.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        } ${cat.parent_id ? 'pl-8 text-gray-500' : 'font-medium'}`}
                      >
                        {cat.parent_id ? '↳ ' : ''}{getCategoryName(cat)}
                      </button>
                    ))}
                </div>
              </div>
            )}
            {/* Hidden required input for form validation */}
            <input type="text" required value={form.category_id} onChange={() => {}} className="sr-only" tabIndex={-1} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs.title')} *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g. Fix air conditioner in my apartment"
            />
            <p className="text-xs text-gray-400 mt-1">Write in any language — we'll translate automatically</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs.description')} *</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
              placeholder="Describe your task in detail..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs.budgetMin')}</label>
              <input
                type="number"
                min="0"
                value={form.budget_min}
                onChange={e => setForm(f => ({ ...f, budget_min: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs.budgetMax')}</label>
              <input
                type="number"
                min="0"
                value={form.budget_max}
                onChange={e => setForm(f => ({ ...f, budget_max: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="2000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs.city')}</label>
            <select
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs.location')}</label>
            <input
              type="text"
              value={form.location_address}
              onChange={e => setForm(f => ({ ...f, location_address: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g. Sukhumvit Soi 11, Bangkok"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs.preferredDate')}</label>
            <input
              type="date"
              value={form.preferred_date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-lg"
          >
            {loading ? t('common.loading') : t('jobs.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
