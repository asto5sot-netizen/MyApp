'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { THAI_CITIES, REGION_LABELS } from '@/lib/cities'
import { useLang } from '@/hooks/useLang'
import { StarRating } from '@/components/ui/StarRating'

interface Pro {
  id: string
  rating: number
  reviews_count: number
  completed_jobs: number
  experience_years: number
  hourly_rate: string | null
  city: string
  is_available: boolean
  verification_status: string
  user: {
    id: string
    full_name: string
    avatar_url: string | null
    city: string
  }
  categories: Array<{
    price_from: string | null
    category: { name_en: string; name_ru: string; name_th: string }
  }>
}

interface Category {
  id: string
  slug: string
  name_en: string
  name_ru: string
  name_th: string
  icon_url: string | null
}

const regions = ['central', 'north', 'south', 'northeast'] as const

export default function ProsPage() {
  const params = useParams()
  const router = useRouter()
  const lang = useLang()
  const slug = params.slug as string

  const [category, setCategory] = useState<Category | null>(null)
  const [pros, setPros] = useState<Pro[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')

  const getCatName = (cat: Category) => {
    if (lang === 'ru') return cat.name_ru
    if (lang === 'th') return cat.name_th
    return cat.name_en
  }

  const fetchPros = async (cityFilter = '') => {
    setLoading(true)
    const url = `/api/pros?category=${slug}${cityFilter ? `&city=${cityFilter}` : ''}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.success) {
      setCategory(data.data.category)
      setPros(data.data.pros)
    }
    setLoading(false)
  }

  useEffect(() => { fetchPros() }, [slug])

  const handleCityChange = (c: string) => {
    setCity(c)
    fetchPros(c)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="text-blue-600 text-sm flex items-center gap-1 mb-4 hover:underline">
          ← Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          {category?.icon_url && <span className="text-3xl">{category.icon_url}</span>}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {category ? getCatName(category) : '...'}
            </h1>
            <p className="text-gray-500 text-sm">{pros.length} specialists</p>
          </div>
        </div>

        {/* City filter */}
        <div className="mb-6">
          <select
            value={city}
            onChange={e => handleCityChange(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All cities</option>
            {regions.map(region => (
              <optgroup key={region} label={REGION_LABELS[region]}>
                {THAI_CITIES.filter(c => c.region === region).map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : pros.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium">No specialists yet</p>
            <p className="text-sm mt-1">Be the first to register as a professional in this category</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Professional</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4 hidden sm:table-cell">City</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Rating</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4 hidden md:table-cell">Jobs</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4 hidden md:table-cell">Price from</th>
                  <th className="px-4 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pros.map((pro, idx) => (
                  <tr key={pro.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {pro.user.avatar_url ? (
                            <img src={pro.user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                              {pro.user.full_name.charAt(0)}
                            </div>
                          )}
                          {idx < 3 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{pro.user.full_name}</p>
                          {pro.verification_status === 'verified' && (
                            <span className="text-[10px] text-blue-600 font-medium">✓ Verified</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 hidden sm:table-cell">{pro.city}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <StarRating rating={pro.rating} />
                        <span className="text-sm font-semibold text-gray-800">{Number(pro.rating).toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({pro.reviews_count})</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm font-semibold text-gray-800">{pro.completed_jobs}</span>
                      <span className="text-xs text-gray-400 ml-1">completed</span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-sm text-gray-700">
                      {pro.categories[0]?.price_from ? (
                        <span>from {Number(pro.categories[0].price_from).toLocaleString()} ฿</span>
                      ) : (
                        <span className="text-gray-400">by agreement</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/pro/${pro.user.id}`}
                        className="text-blue-600 text-sm font-medium hover:underline whitespace-nowrap"
                      >
                        Profile →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
