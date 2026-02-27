'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/Navbar'
import { toast } from '@/lib/toast'

interface Job {
  id: string; title: string; status: string; proposals_count: number; city: string
  created_at: string; budget_min?: number; budget_max?: number
  category: { name_en: string }
  client: { id: string; full_name: string }
}
interface Proposal { id: string; job: Job; price: number; status: string; created_at: string }
interface ProProfile { rating: number; reviews_count: number; completed_jobs: number; is_available: boolean; city: string; verification_status: string }
interface Notification { id: string; title: string; body: string; is_read: boolean; created_at: string; data?: { job_id?: string; conversation_id?: string } }

export default function ProDashboard() {
  const { t } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; full_name: string; role: string; pro_profile: ProProfile } | null>(null)
  const [feedJobs, setFeedJobs] = useState<Job[]>([])
  const [myProposals, setMyProposals] = useState<Proposal[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [availabilityLoading, setAvailabilityLoading] = useState(false)

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
        fetch('/api/notifications').then(r => r.json()),
      ]).then(([jobsData, proposalsData, notifData]) => {
        if (jobsData.success) setFeedJobs(jobsData.data.jobs)
        if (proposalsData.success) setMyProposals(proposalsData.data.proposals)
        if (notifData.success) {
          setNotifications(notifData.data.notifications)
          const hasUnread = notifData.data.notifications.some((n: Notification) => !n.is_read)
          if (hasUnread) fetch('/api/notifications', { method: 'PATCH' })
        }
      }).finally(() => setLoading(false))
    })
  }, [router])

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-64"><div className="text-gray-500">{t('common.loading')}</div></div>
    </div>
  )

  const toggleAvailability = async () => {
    if (!user) return
    const newVal = !user.pro_profile.is_available
    setAvailabilityLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newVal }),
      })
      const data = await res.json()
      if (data.success) {
        setUser(u => u ? { ...u, pro_profile: { ...u.pro_profile, is_available: newVal } } : u)
        toast.success(newVal ? 'Now available for orders' : 'Status set to unavailable')
      }
    } catch { toast.error('Failed to update status') }
    finally { setAvailabilityLoading(false) }
  }

  const profile = user?.pro_profile
  const acceptedProposals = myProposals.filter(p => p.status === 'accepted')

  // Get unique categories from feed jobs
  const feedCategories = Array.from(
    new Map(feedJobs.map(j => [j.category.name_en, j.category.name_en])).entries()
  ).map(([v]) => v)

  const filteredJobs = categoryFilter
    ? feedJobs.filter(j => j.category.name_en === categoryFilter)
    : feedJobs

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-8 gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name} 🔧</h1>
            <p className="text-gray-500 text-sm mt-1">{profile?.city} · {t('profile.rating')}: ⭐ {profile?.rating?.toFixed(1) || '—'}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={toggleAvailability}
              disabled={availabilityLoading}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-colors disabled:opacity-50 ${
                profile?.is_available
                  ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${profile?.is_available ? 'bg-green-500' : 'bg-gray-400'}`} />
              {profile?.is_available ? 'Available' : 'Unavailable'}
            </button>
            <Link href="/dashboard/settings" className="border border-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 text-sm">
              {t('profile.edit')}
            </Link>
          </div>
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
          <Link href="/dashboard/settings" className="block mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between hover:border-yellow-300 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="font-semibold text-yellow-800 text-sm">Get Verified to build trust</p>
                  <p className="text-xs text-yellow-600">Verified professionals get 3x more proposals accepted</p>
                </div>
              </div>
              <span className="text-xs font-medium text-yellow-700 bg-yellow-100 border border-yellow-300 px-3 py-1.5 rounded-lg whitespace-nowrap">
                Verify now →
              </span>
            </div>
          </Link>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Job Feed */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900">Available Jobs in Thailand</h2>
              {feedCategories.length > 1 && (
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All categories</option>
                  {feedCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400">{categoryFilter ? `No jobs in "${categoryFilter}"` : 'No jobs available right now'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.slice(0, 8).map(job => (
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

            {notifications.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Notifications</h2>
                <div className="space-y-2">
                  {notifications.slice(0, 5).map(n => {
                    const href = n.data?.conversation_id
                      ? `/chat?id=${n.data.conversation_id}`
                      : n.data?.job_id
                      ? `/jobs/${n.data.job_id}`
                      : null
                    const inner = (
                      <div className={`rounded-xl border p-3 transition-colors ${
                        n.is_read ? 'border-gray-100 bg-white' : 'border-blue-200 bg-blue-50'
                      } ${href ? 'hover:border-blue-300 cursor-pointer' : ''}`}>
                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{n.body}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                    )
                    return href
                      ? <Link key={n.id} href={href}>{inner}</Link>
                      : <div key={n.id}>{inner}</div>
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
