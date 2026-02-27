'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { ProCard } from '@/components/ui/ProCard'
import { useLang } from '@/hooks/useLang'

interface Category {
  id: string; slug: string; name_en: string; name_ru: string; name_th: string
  parent_id?: string
}

interface ProResult {
  profile_id: string
  rating: number; reviews_count: number; completed_jobs: number
  is_available: boolean; verification_status: string
  hourly_rate?: number; city: string
  profile: { id: string; full_name: string; avatar_url?: string; city: string }
  categories: Array<{ category: Category; price_from?: number }>
}

const RATINGS = [
  { label: 'Any rating', value: '' },
  { label: '4+ stars', value: '4' },
  { label: '4.5+ stars', value: '4.5' },
]

export default function ProsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50"><Navbar /></div>}>
      <ProsContent />
    </Suspense>
  )
}

function ProsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const lang = useLang()

  const [categories, setCategories] = useState<Category[]>([])
  const [pros, setPros] = useState<ProResult[]>([])
  const [loading, setLoading] = useState(false)

  const [catSearch, setCatSearch] = useState('')
  const [catOpen, setCatOpen] = useState(false)
  const catRef = useRef<HTMLDivElement>(null)

  const categorySlug = searchParams.get('category') || ''
  const city = searchParams.get('city') || ''
  const minRating = searchParams.get('min_rating') || ''

  const getCatName = (cat: Category) =>
    lang === 'ru' ? cat.name_ru : lang === 'th' ? cat.name_th : cat.name_en

  // Load categories on mount
  useEffect(() => {
    fetch('/api/categories?flat=true')
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.data.categories) })
  }, [])

  // Search pros whenever filters change
  const fetchPros = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (categorySlug) params.set('category', categorySlug)
    if (city) params.set('city', city)
    if (minRating) params.set('min_rating', minRating)
    fetch(`/api/pros?${params}`)
      .then(r => r.json())
      .then(d => { if (d.success) setPros(d.data.pros) })
      .finally(() => setLoading(false))
  }, [categorySlug, city, minRating])

  useEffect(() => { fetchPros() }, [fetchPros])

  // Close category dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const updateFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    router.push(`/pros?${p}`)
  }

  const selectedCat = categories.find(c => c.slug === categorySlug)
  const filteredCats = categories.filter(c =>
    getCatName(c).toLowerCase().includes(catSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Find professionals</h1>
        <p className="text-gray-500 text-sm mb-6">Browse verified service providers in Thailand</p>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
          {/* Category dropdown */}
          <div className="relative flex-1 min-w-[180px]" ref={catRef}>
            <button
              onClick={() => { setCatOpen(o => !o); setCatSearch('') }}
              className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left bg-white hover:border-blue-400 transition-colors"
            >
              <span className={selectedCat ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                {selectedCat ? getCatName(selectedCat) : 'All categories'}
              </span>
              <span className="text-gray-400 ml-2">{catOpen ? '▲' : '▼'}</span>
            </button>
            {catOpen && (
              <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="p-2">
                  <input
                    autoFocus
                    value={catSearch}
                    onChange={e => setCatSearch(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="max-h-52 overflow-y-auto">
                  <button
                    onClick={() => { updateFilter('category', ''); setCatOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${!categorySlug ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                  >
                    All categories
                  </button>
                  {filteredCats.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { updateFilter('category', cat.slug); setCatOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${cat.slug === categorySlug ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700'} ${cat.parent_id ? 'pl-7' : ''}`}
                    >
                      {cat.parent_id ? '↳ ' : ''}{getCatName(cat)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* City filter */}
          <input
            value={city}
            onChange={e => updateFilter('city', e.target.value)}
            placeholder="City (e.g. Bangkok)"
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px] flex-1"
          />

          {/* Rating filter */}
          <select
            value={minRating}
            onChange={e => updateFilter('min_rating', e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {RATINGS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>

          {/* Clear filters */}
          {(categorySlug || city || minRating) && (
            <button
              onClick={() => router.push('/pros')}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-24 animate-pulse" />
            ))}
          </div>
        ) : pros.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg font-medium">No professionals found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">{pros.length} professional{pros.length !== 1 ? 's' : ''} found</p>
            <div className="space-y-3">
              {pros.map(pro => {
                const firstCat = pro.categories[0]
                return (
                  <ProCard
                    key={pro.profile_id}
                    id={pro.profile.id}
                    fullName={pro.profile.full_name}
                    avatarUrl={pro.profile.avatar_url}
                    city={pro.profile.city}
                    rating={pro.rating}
                    reviewsCount={pro.reviews_count}
                    completedJobs={pro.completed_jobs}
                    isAvailable={pro.is_available}
                    verificationStatus={pro.verification_status}
                    hourlyRate={pro.hourly_rate}
                    categoryName={firstCat ? getCatName(firstCat.category) : undefined}
                    priceFrom={firstCat?.price_from}
                  />
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
