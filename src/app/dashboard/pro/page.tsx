'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/Navbar'

interface Job {
  id: string; title: string; status: string; proposals_count: number; city: string
  created_at: string; budget_min?: number; budget_max?: number
  category: { name_en: string }
  client: { id: string; full_name: string }
}
interface Proposal { id: string; job: Job; price: number; status: string; created_at: string }
interface ProProfile { rating: number; reviews_count: number; completed_jobs: number; is_available: boolean; city: string; verification_status: string }

export default function ProDashboard() {
  const { t } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; full_name: string; role: string; pro_profile: ProProfile } | null>(null)
  const [feedJobs, setFeedJobs] = useState<Job[]>([])
  const [myProposals, setMyProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profile/me').then(r => r.json()).then(meData => {
      if (!meData.success || meData.data.user.role !== 'pro') {
        router.push('/auth/login')
        return
      }
      setUser(meData.data.user)

      Promise.all([
        fetch('/api/jobs').then(r => r.json()),
        fetch('/api/proposals/my').then(r => r.json()),
      ]).then(([jobsData, proposalsData]) => {
        if (jobsData.success) setFeedJobs(jobsData.data.jobs)
        if (proposalsData.success) setMyProposals(proposalsData.data.proposals)
      }).finally(() => setLoading(false))
    })
  }, [router])

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-64"><div className="text-gray-500">{t('common.loading')}</div></div>
    </div>
  )

  const profile = user?.pro_profile
  const acceptedProposals = myProposals.filter(p => p.status === 'accepted')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name} 🔧</h1>
            <p className="text-gray-500 text-sm mt-1">{profile?.city} · {t('profile.rating')}: ⭐ {profile?.rating?.toFixed(1) || '—'}</p>
          </div>
          <Link href="/profile/edit" className="border border-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 text-sm">
            {t('profile.edit')}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: t('profile.rating'), value: profile?.rating?.toFixed(1) || '—', icon: '⭐' },
            { label: t('profile.reviews'), value: profile?.reviews_count || 0, icon: '💬' },
            { label: t('profile.completedJobs'), value: profile?.completed_jobs || 0, icon: '✅' },
            { label: 'Active jobs', value: acceptedProposals.length, icon: '🔥' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Verification banner */}
        {profile?.verification_status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-semibold text-yellow-800 text-sm">Get Verified to build trust</p>
              <p className="text-xs text-yellow-600">Verified professionals get 3x more proposals accepted</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Job Feed */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Available Jobs in Thailand</h2>
            {feedJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400">No jobs available right now</p>
              </div>
            ) : (
              <div className="space-y-3">
                {feedJobs.slice(0, 8).map(job => (
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

          {/* My Proposals */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">My Proposals</h2>
            {myProposals.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center text-gray-400 text-sm">
                No proposals yet
              </div>
            ) : (
              <div className="space-y-2">
                {myProposals.slice(0, 6).map(p => (
                  <Link key={p.id} href={`/jobs/${p.job.id}`}>
                    <div className="bg-white rounded-xl border border-gray-100 p-3 hover:shadow-sm transition-shadow">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.job.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {t(`proposals.status.${p.status}`)}
                        </span>
                        <span className="text-xs text-gray-500">฿{p.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Link href="/chat" className="block mt-4">
              <div className="bg-blue-600 text-white text-center py-3 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">
                💬 {t('chat.title')}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
