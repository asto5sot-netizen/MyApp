'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/Navbar'
import { toast } from '@/lib/toast'
import { NotificationList, type NotifItem } from '@/components/ui/NotificationList'
import { ProStatsCards } from './_components/ProStatsCards'
import { JobFeed } from './_components/JobFeed'
import { ProposalList } from './_components/ProposalList'

interface Job {
  id: string; title: string; status: string; proposals_count: number; city: string
  created_at: string; budget_min?: number; budget_max?: number
  category: { name_en: string }
}
interface Proposal { id: string; job: Job; price: number; status: string }
interface ProProfile {
  rating: number; reviews_count: number; completed_jobs: number
  is_available: boolean; city: string; verification_status: string
}

export default function ProDashboard() {
  const { t } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; full_name: string; role: string; pro_profile: ProProfile } | null>(null)
  const [feedJobs, setFeedJobs] = useState<Job[]>([])
  const [myProposals, setMyProposals] = useState<Proposal[]>([])
  const [notifications, setNotifications] = useState<NotifItem[]>([])
  const [loading, setLoading] = useState(true)
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
          const hasUnread = notifData.data.notifications.some((n: NotifItem) => !n.is_read)
          if (hasUnread) fetch('/api/notifications', { method: 'PATCH' })
        }
      }).finally(() => setLoading(false))
    })
  }, [router])

  const toggleAvailability = useCallback(async () => {
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
  }, [user])

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    </div>
  )

  const profile = user?.pro_profile
  const acceptedProposals = myProposals.filter(p => p.status === 'accepted')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name} 🔧</h1>
            <p className="text-gray-500 text-sm mt-1">
              {profile?.city} · {t('profile.rating')}: ⭐ {profile?.rating?.toFixed(1) || '—'}
            </p>
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
            <Link href="/dashboard/settings"
              className="border border-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 text-sm">
              {t('profile.edit')}
            </Link>
          </div>
        </div>

        {/* Stats */}
        <ProStatsCards
          rating={profile?.rating}
          reviewsCount={profile?.reviews_count}
          completedJobs={profile?.completed_jobs}
          activeJobs={acceptedProposals.length}
        />

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
          {/* Job Feed — 2/3 width */}
          <div className="md:col-span-2">
            <JobFeed jobs={feedJobs} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">My Proposals</h2>
              <ProposalList proposals={myProposals} />
            </div>

            <Link href="/chat" className="block">
              <div className="bg-blue-600 text-white text-center py-3 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">
                💬 {t('chat.title')}
              </div>
            </Link>

            {notifications.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Notifications</h2>
                <NotificationList notifications={notifications} limit={5} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
