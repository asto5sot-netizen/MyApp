'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/Navbar'
import { toast } from '@/lib/toast'

interface Job {
  id: string; title: string; status: string; proposals_count: number; city: string
  created_at: string; category: { name_en: string }
  proposals: { pro_id: string }[]
}
interface Notification {
  id: string; title: string; body: string; is_read: boolean; created_at: string; type: string
  data?: { job_id?: string; conversation_id?: string }
}

export default function ClientDashboard() {
  const { t } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; full_name: string; role: string } | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/profile/me').then(r => r.json()),
      fetch('/api/jobs/my').then(r => r.json()),
      fetch('/api/notifications').then(r => r.json()),
    ]).then(([meData, jobsData, notifData]) => {
      if (!meData.success || meData.data.user.role !== 'client') {
        router.push('/auth/login')
        return
      }
      setUser(meData.data.user)
      if (jobsData.success) setJobs(jobsData.data.jobs)
      if (notifData.success) {
        setNotifications(notifData.data.notifications)
        const hasUnread = notifData.data.notifications.some((n: Notification) => !n.is_read)
        if (hasUnread) fetch('/api/notifications', { method: 'PATCH' })
      }
    }).finally(() => setLoading(false))
  }, [router])

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-64"><div className="text-gray-500">{t('common.loading')}</div></div>
    </div>
  )

  const activeJobs = jobs.filter(j => j.status === 'open' || j.status === 'in_progress')
  const unreadCount = notifications.filter(n => !n.is_read).length

  const markDone = async (jobId: string) => {
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    })
    const data = await res.json()
    if (data.success) {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'done' } : j))
      toast.success('Job marked as completed!')
    } else {
      toast.error(data.error || 'Failed to update job')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name} 👋</h1>
            <p className="text-gray-500 text-sm mt-1">{t('nav.dashboard')}</p>
          </div>
          <Link
            href="/jobs/create"
            className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            + {t('jobs.post')}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Jobs', value: activeJobs.length, color: 'blue' },
            { label: 'Total Jobs', value: jobs.length, color: 'gray' },
            { label: 'Notifications', value: unreadCount, color: unreadCount > 0 ? 'red' : 'gray' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* My Jobs */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t('jobs.myJobs')}</h2>
              <Link href="/jobs/my" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
            {jobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 mb-4">{t('jobs.noJobs')}</p>
                <Link href="/jobs/create" className="text-blue-600 font-medium hover:underline">{t('jobs.createNew')}</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 5).map(job => {
                  const acceptedProId = job.proposals[0]?.pro_id
                  const canReview = (job.status === 'in_progress' || job.status === 'done') && acceptedProId
                  return (
                    <div key={job.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                      <Link href={`/jobs/${job.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{job.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{job.category.name_en} · {job.city}</p>
                          </div>
                          <div className="ml-3 flex-shrink-0 text-right">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              job.status === 'open' ? 'bg-green-100 text-green-700' :
                              job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {t(`jobs.status.${job.status}`)}
                            </span>
                            {job.proposals_count > 0 && (
                              <p className="text-xs text-blue-600 mt-1 font-medium">{job.proposals_count} {t('jobs.proposals')}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                      {(job.status === 'in_progress' || canReview) && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                          {job.status === 'in_progress' && (
                            <button
                              onClick={() => markDone(job.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              ✓ Mark as Done
                            </button>
                          )}
                          {canReview && (
                            <Link
                              href={`/pro/${acceptedProId}?review_job=${job.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors"
                            >
                              ⭐ Leave a review
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Notifications</h2>
            {notifications.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center text-gray-400 text-sm">
                No notifications
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 6).map(n => {
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
