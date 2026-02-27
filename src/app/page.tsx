'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/Navbar'
import { useLang } from '@/hooks/useLang'
import { HomeHero } from './_components/HomeHero'
import { HomeFeaturedCats } from './_components/HomeFeaturedCats'
import { HomeServicesTab } from './_components/HomeServicesTab'
import { HowItWorks } from './_components/HowItWorks'
import { HomeFooter } from './_components/HomeFooter'
import type { Category } from '@/types/job'

interface Job {
  id: string; title: string; title_translated?: Record<string, string>
  city: string; budget_min?: number; budget_max?: number
  category: { name_en: string; name_ru: string; name_th: string }
  _count: { proposals: number }
}

export default function HomePage() {
  const { t } = useTranslation()
  const lang = useLang()
  const [activeTab, setActiveTab] = useState<'categories' | 'services'>('categories')
  const [selectedCity, setSelectedCity] = useState('Bangkok')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsTotal, setJobsTotal] = useState(0)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])

  const getLang = useCallback((obj: Record<string, string> | undefined, fallback: string) =>
    obj ? (obj[lang] || obj['en'] || fallback) : fallback, [lang])

  const getCatName = (cat: { name_en: string; name_ru: string; name_th: string }) =>
    lang === 'ru' ? cat.name_ru : lang === 'th' ? cat.name_th : cat.name_en

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      const cats: Category[] = []
      const tree: (Category & { children?: Category[] })[] = d.data?.categories || []
      tree.forEach(c => { cats.push(c); c.children?.forEach(ch => cats.push(ch)) })
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
      if (data.success) { setJobs(data.data.jobs); setJobsTotal(data.data.total) }
    } finally { setJobsLoading(false) }
  }, [selectedCity, selectedCategoryId])

  useEffect(() => { if (activeTab === 'services') fetchJobs() }, [activeTab, fetchJobs])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HomeHero />
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-10 mx-auto">
            {(['categories', 'services'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab === 'categories' ? t('categories.title') : '🔍 Services in your city'}
              </button>
            ))}
          </div>
          {activeTab === 'categories'
            ? <HomeFeaturedCats lang={lang} />
            : <HomeServicesTab lang={lang} jobs={jobs} jobsTotal={jobsTotal} jobsLoading={jobsLoading}
                selectedCity={selectedCity} selectedCategoryId={selectedCategoryId}
                allCategories={allCategories} onCityChange={setSelectedCity}
                onCategoryChange={setSelectedCategoryId} onSearch={fetchJobs}
                getLang={getLang} getCatName={getCatName} />}
        </div>
      </section>
      <HowItWorks />
      <HomeFooter />
    </div>
  )
}
