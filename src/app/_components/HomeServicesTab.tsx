'use client'
import Link from 'next/link'
import { THAI_CITIES, REGION_LABELS } from '@/lib/cities'
import type { Category } from '@/types/job'

const regions = ['central', 'north', 'south', 'northeast'] as const

interface Job {
  id: string; title: string; title_translated?: Record<string, string>
  city: string; budget_min?: number; budget_max?: number
  category: { name_en: string; name_ru: string; name_th: string }
  _count: { proposals: number }
}

interface Props {
  lang: string
  jobs: Job[]
  jobsTotal: number
  jobsLoading: boolean
  selectedCity: string
  selectedCategoryId: string
  allCategories: Category[]
  onCityChange: (v: string) => void
  onCategoryChange: (v: string) => void
  onSearch: () => void
  getLang: (obj: Record<string, string> | undefined, fallback: string) => string
  getCatName: (cat: { name_en: string; name_ru: string; name_th: string }) => string
}

export function HomeServicesTab({ lang, jobs, jobsTotal, jobsLoading, selectedCity, selectedCategoryId, allCategories, onCityChange, onCategoryChange, onSearch, getLang, getCatName }: Props) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">📍 City</label>
          <select value={selectedCity} onChange={e => onCityChange(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
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
          <select value={selectedCategoryId} onChange={e => onCategoryChange(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
            <option value="">All categories</option>
            {allCategories.map(cat => <option key={cat.id} value={cat.id}>{getCatName(cat)}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={onSearch} className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm">Search</button>
        </div>
      </div>

      {!jobsLoading && <p className="text-sm text-gray-500 mb-4">{jobsTotal} open {jobsTotal === 1 ? 'task' : 'tasks'} in <strong>{selectedCity}</strong></p>}

      {jobsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-3" /><div className="h-4 bg-gray-100 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 text-sm">No open tasks in {selectedCity} yet.</p>
          <Link href="/jobs/create" className="inline-block mt-4 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">Post a task</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{getCatName(job.category)}</span>
                  <span className="text-xs text-gray-400">📍 {job.city}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{getLang(job.title_translated, job.title)}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">{job._count.proposals} proposals</span>
                  {(job.budget_min || job.budget_max) && (
                    <span className="text-xs font-semibold text-gray-700">
                      {job.budget_min && job.budget_max ? `฿${job.budget_min}–${job.budget_max}` : job.budget_min ? `from ฿${job.budget_min}` : `up to ฿${job.budget_max}`}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {jobsTotal > 12 && (
            <div className="text-center mt-6">
              <Link href={`/jobs?city=${selectedCity}${selectedCategoryId ? `&category_id=${selectedCategoryId}` : ''}`} className="text-blue-600 text-sm font-semibold hover:underline">
                View all {jobsTotal} tasks →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
