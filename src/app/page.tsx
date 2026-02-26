'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/Navbar'
import { useLang } from '@/hooks/useLang'
import { THAI_CITIES, REGION_LABELS } from '@/lib/cities'

const FEATURED_CATS = [
  {
    slug: 'repair',
    name: { en: 'Repair & Home', ru: 'Ремонт', th: 'ซ่อมแซม' },
    tags: { en: ['Plumbing', 'Electrical', 'Construction'], ru: ['Сантехника', 'Электрика', 'Стройка'], th: ['ประปา', 'ไฟฟ้า', 'ก่อสร้าง'] },
    bg: 'bg-blue-50', border: 'border-blue-200', accent: 'text-blue-600', tagBg: 'bg-blue-100/70 text-blue-700',
    watermark: '🔧',
  },
  {
    slug: 'beauty',
    name: { en: 'Beauty & Care', ru: 'Красота и уход', th: 'ความงาม' },
    tags: { en: ['Hair', 'Nails', 'Massage'], ru: ['Волосы', 'Ногти', 'Массаж'], th: ['ผม', 'เล็บ', 'นวด'] },
    bg: 'bg-pink-50', border: 'border-pink-200', accent: 'text-pink-600', tagBg: 'bg-pink-100/70 text-pink-700',
    watermark: '💅',
  },
  {
    slug: 'auto',
    name: { en: 'Auto & Moto Service', ru: 'Авто / Мотосервис', th: 'ศูนย์บริการรถยนต์ / มอเตอร์ไซค์' },
    tags: { en: ['Auto Service', 'Moto Service'], ru: ['Автосервис', 'Мотосервис'], th: ['ศูนย์บริการรถยนต์', 'ศูนย์บริการมอเตอร์ไซค์'] },
    bg: 'bg-orange-50', border: 'border-orange-200', accent: 'text-orange-600', tagBg: 'bg-orange-100/70 text-orange-700',
    watermark: '🚗',
  },
  {
    slug: 'digital',
    name: { en: 'Digital & IT', ru: 'Диджитал и IT', th: 'ดิจิทัลและไอที' },
    tags: { en: ['Phone Repair', 'Web Dev', 'Design', 'Tech Setup'], ru: ['Ремонт сотовых', 'Сайты', 'Дизайн', 'Настройка техники'], th: ['ซ่อมโทรศัพท์', 'เว็บไซต์', 'ออกแบบ', 'ตั้งค่า'] },
    bg: 'bg-violet-50', border: 'border-violet-200', accent: 'text-violet-600', tagBg: 'bg-violet-100/70 text-violet-700',
    watermark: '💻',
  },
] as const

const regions = ['central', 'north', 'south', 'northeast'] as const

interface Category { id: string; slug: string; name_en: string; name_ru: string; name_th: string }
interface Job {
  id: string
  title: string
  title_translated?: Record<string, string>
  city: string
  budget_min?: number
  budget_max?: number
  created_at: string
  category: { name_en: string; name_ru: string; name_th: string }
  _count: { proposals: number }
}

export default function HomePage() {
  const { t } = useTranslation()
  const lang = useLang()

  // Services tab state
  const [activeTab, setActiveTab] = useState<'categories' | 'services'>('categories')
  const [selectedCity, setSelectedCity] = useState('Bangkok')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsTotal, setJobsTotal] = useState(0)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])

  const getLang = useCallback((obj: Record<string, string> | undefined, fallback: string) => {
    if (!obj) return fallback
    return obj[lang] || obj['en'] || fallback
  }, [lang])

  const getCatName = (cat: { name_en: string; name_ru: string; name_th: string }) => {
    return lang === 'ru' ? cat.name_ru : lang === 'th' ? cat.name_th : cat.name_en
  }

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        const cats: Category[] = []
        const tree: (Category & { children?: Category[] })[] = d.data?.categories || []
        tree.forEach(c => {
          cats.push(c)
          c.children?.forEach(ch => cats.push(ch))
        })
        setAllCategories(cats)
      })
  }, [])

  const fetchJobs = useCallback(async () => {
    setJobsLoading(true)
    try {
      const params = new URLSearchParams({ city: selectedCity, limit: '12' })
      if (selectedCategoryId) params.set('category_id', selectedCategoryId)
      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()
      if (data.success) {
        setJobs(data.data.jobs)
        setJobsTotal(data.data.total)
      }
    } finally {
      setJobsLoading(false)
    }
  }, [selectedCity, selectedCategoryId])

  useEffect(() => {
    if (activeTab === 'services') fetchJobs()
  }, [activeTab, fetchJobs])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="text-sm font-medium">🇹🇭 {t('hero.location')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/jobs/create"
              className="bg-white text-blue-600 font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              {t('hero.cta')}
            </Link>
            <Link
              href="/auth/register?role=pro"
              className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/10 transition-colors"
            >
              {t('hero.ctaPro')}
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {['🇬🇧 English', '🇹🇭 ภาษาไทย', '🇷🇺 Русский', '+ Auto-translate all languages'].map(lang => (
              <span key={lang} className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories / Services tabs */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-10 mx-auto">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'categories'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('categories.title')}
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'services'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔍 Services in your city
            </button>
          </div>

          {/* Categories tab */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FEATURED_CATS.map(cat => {
                const catLang = (lang as 'en' | 'ru' | 'th') in cat.name ? (lang as 'en' | 'ru' | 'th') : 'en'
                const name = cat.name[catLang]
                const tags = cat.tags[catLang]
                return (
                  <Link
                    key={cat.slug}
                    href={`/masters/${cat.slug}`}
                    className={`group relative overflow-hidden rounded-2xl border ${cat.bg} ${cat.border} p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
                  >
                    {/* Watermark icon */}
                    <span className="absolute -right-2 -bottom-2 text-[48px] opacity-[0.08] select-none pointer-events-none leading-none">
                      {cat.watermark}
                    </span>

                    {/* Icon circle */}
                    <div className={`w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-base mb-3 border ${cat.border}`}>
                      {cat.watermark}
                    </div>

                    {/* Name */}
                    <h3 className={`text-sm font-extrabold ${cat.accent} mb-1.5`}>{name}</h3>

                    {/* Tag pills */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tags.slice(0, 2).map(tag => (
                        <span key={tag} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cat.tagBg}`}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${cat.accent} group-hover:gap-2 transition-all duration-150`}>
                      {lang === 'ru' ? 'Смотреть' : lang === 'th' ? 'ดูเพิ่มเติม' : 'Browse'} →
                    </span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Services tab */}
          {activeTab === 'services' && (
            <div>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">📍 City</label>
                  <select
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select
                    value={selectedCategoryId}
                    onChange={e => setSelectedCategoryId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">All categories</option>
                    {allCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{getCatName(cat)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchJobs}
                    className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Results count */}
              {!jobsLoading && (
                <p className="text-sm text-gray-500 mb-4">
                  {jobsTotal} open {jobsTotal === 1 ? 'task' : 'tasks'} in <strong>{selectedCity}</strong>
                </p>
              )}

              {/* Jobs grid */}
              {jobsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                      <div className="h-3 bg-gray-100 rounded w-1/3 mb-3" />
                      <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-500 text-sm">No open tasks in {selectedCity} yet.</p>
                  <Link href="/jobs/create" className="inline-block mt-4 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                    Post a task
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobs.map(job => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                          {getCatName(job.category)}
                        </span>
                        <span className="text-xs text-gray-400">📍 {job.city}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {getLang(job.title_translated, job.title)}
                      </h3>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">
                          {job._count.proposals} proposals
                        </span>
                        {(job.budget_min || job.budget_max) && (
                          <span className="text-xs font-semibold text-gray-700">
                            {job.budget_min && job.budget_max
                              ? `฿${job.budget_min}–${job.budget_max}`
                              : job.budget_min
                              ? `from ฿${job.budget_min}`
                              : `up to ฿${job.budget_max}`}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {jobs.length > 0 && jobsTotal > 12 && (
                <div className="text-center mt-6">
                  <Link
                    href={`/jobs?city=${selectedCity}${selectedCategoryId ? `&category_id=${selectedCategoryId}` : ''}`}
                    className="text-blue-600 text-sm font-semibold hover:underline"
                  >
                    View all {jobsTotal} tasks →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20 px-4" id="how-it-works">
        <div className="max-w-5xl mx-auto">

          <h2 className="text-4xl font-black text-gray-900 text-center mb-16">
            {t('nav.howItWorks')}
          </h2>

          {/* Cards row */}
          <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0">

            {/* Card 1 — Blue */}
            <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl p-8">
              <div className="w-16 h-16 rounded-full border-2 border-blue-400 bg-white flex items-center justify-center mb-6 mx-auto text-blue-500">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="8" y="2" width="8" height="4" rx="1"/>
                  <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
                  <line x1="9" y1="12" x2="15" y2="12"/>
                  <line x1="9" y1="16" x2="13" y2="16"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-blue-600 mb-3 text-center">
                {t('howItWorks.step')} 1: {t('howItWorks.step1Title')}
              </h3>
              <p className="text-gray-500 text-sm text-center leading-relaxed">{t('howItWorks.step1Desc')}</p>
            </div>

            {/* Arrow 1→2 */}
            <div className="hidden md:flex items-center justify-center px-2 mt-10 shrink-0">
              <svg width="40" height="14" viewBox="0 0 40 14">
                <line x1="0" y1="7" x2="30" y2="7" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 3"/>
                <polyline points="26,3 34,7 26,11" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Card 2 — Purple */}
            <div className="flex-1 bg-purple-50 border border-purple-100 rounded-2xl p-8">
              <div className="w-16 h-16 rounded-full border-2 border-purple-400 bg-white flex items-center justify-center mb-6 mx-auto text-purple-500">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-purple-600 mb-3 text-center">
                {t('howItWorks.step')} 2: {t('howItWorks.step2Title')}
              </h3>
              <p className="text-gray-500 text-sm text-center leading-relaxed">{t('howItWorks.step2Desc')}</p>
            </div>

            {/* Arrow 2→3 */}
            <div className="hidden md:flex items-center justify-center px-2 mt-10 shrink-0">
              <svg width="40" height="14" viewBox="0 0 40 14">
                <line x1="0" y1="7" x2="30" y2="7" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 3"/>
                <polyline points="26,3 34,7 26,11" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Card 3 — Green */}
            <div className="flex-1 bg-green-50 border border-green-100 rounded-2xl p-8">
              <div className="w-16 h-16 rounded-full border-2 border-green-400 bg-white flex items-center justify-center mb-6 mx-auto text-green-500">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9,12 11,14 15,10"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-green-600 mb-3 text-center">
                {t('howItWorks.step3Title')}
              </h3>
              <p className="text-gray-500 text-sm text-center leading-relaxed">{t('howItWorks.step3Desc')}</p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white font-bold text-lg">ProService Thailand</div>
          <div className="text-sm">{t('footer.rights')}</div>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="hover:text-white">{t('footer.privacy')}</Link>
            <Link href="/terms" className="hover:text-white">{t('footer.terms')}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
