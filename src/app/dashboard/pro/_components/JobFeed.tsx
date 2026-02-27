'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

interface Job {
  id: string; title: string; status: string; proposals_count: number; city: string
  created_at: string; budget_min?: number; budget_max?: number
  category: { name_en: string }
}

interface Props {
  jobs: Job[]
}

export function JobFeed({ jobs }: Props) {
  const { t } = useTranslation()
  const [categoryFilter, setCategoryFilter] = useState('')

  const categories = Array.from(new Set(jobs.map(j => j.category.name_en)))
  const filtered = categoryFilter ? jobs.filter(j => j.category.name_en === categoryFilter) : jobs

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="text-lg font-bold text-gray-900">Available Jobs in Thailand</h2>
        {categories.length > 1 && (
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-gray-400">
            {categoryFilter ? `No jobs in "${categoryFilter}"` : 'No jobs available right now'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.slice(0, 8).map(job => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{job.category.name_en} · {job.city}</p>
                    {(job.budget_min || job.budget_max) && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        Budget: ฿{job.budget_min?.toLocaleString() || '?'}{job.budget_max ? ` — ฿${job.budget_max.toLocaleString()}` : '+'}
                      </p>
                    )}
                  </div>
                  <div className="ml-3 flex-shrink-0 text-right">
                    <p className="text-xs text-gray-400">{new Date(job.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{job.proposals_count} {t('jobs.proposals')}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
