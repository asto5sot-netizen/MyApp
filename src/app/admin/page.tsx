'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminMetricCard } from './_components/AdminMetricCard'
import { AdminChartCard } from './_components/AdminChartCard'
import { RecentUsersTable, RecentJobsTable } from './_components/AdminRecentTables'
import { pct } from './_components/AdminBadges'

interface Stats {
  users: { total: number; clients: number; pros: number; newToday: number; newWeek: number }
  jobs: { total: number; open: number; inProgress: number; done: number; cancelled: number }
  engagement: { proposals: number; reviews: number; conversations: number; messages: number }
  pendingVerification: number
  registrationTrend: { day: string; count: number }[]
  pageviews: { day: string; count: number }[]
  recentUsers: { id: string; full_name: string; email: string; role: string; is_active: boolean; created_at: string; city: string | null }[]
  recentJobs: { id: string; title: string; status: string; city: string | null; created_at: string; proposals_count: number; budget_min: number | null; budget_max: number | null }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json())
      .then(d => { if (d.success) setStats(d.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-gray-500 animate-pulse text-sm">Loading stats…</div></div>
  if (!stats) return <div className="flex items-center justify-center h-screen"><div className="text-red-400 text-sm">Failed to load statistics</div></div>

  const todayViews = stats.pageviews.at(-1)?.count ?? 0
  const weekViews = stats.pageviews.slice(-7).reduce((s, d) => s + d.count, 0)
  const monthViews = stats.pageviews.reduce((s, d) => s + d.count, 0)
  const { jobs } = stats

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link href="/admin/users" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Manage Users →</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricCard label="Total Users" value={stats.users.total} sub={`${stats.users.clients} clients · ${stats.users.pros} pros`} color="blue" icon="👥" />
        <AdminMetricCard label="New Today" value={stats.users.newToday} sub={`+${stats.users.newWeek} this week`} color="green" icon="🆕" />
        <AdminMetricCard label="Page Views Today" value={todayViews} sub={`${weekViews} this week · ${monthViews} this month`} color="purple" icon="👁️" />
        <AdminMetricCard label="Pending Verification" value={stats.pendingVerification} sub="Pro profiles awaiting review" color={stats.pendingVerification > 0 ? 'amber' : 'gray'} icon="⚠️" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricCard label="Total Jobs" value={jobs.total} sub={`${jobs.open} open · ${jobs.inProgress} in progress`} color="blue" icon="📋" />
        <AdminMetricCard label="Completed Jobs" value={jobs.done} sub={`${jobs.cancelled} cancelled`} color="green" icon="✅" />
        <AdminMetricCard label="Proposals" value={stats.engagement.proposals} sub="Total proposals sent" color="purple" icon="📨" />
        <AdminMetricCard label="Messages" value={stats.engagement.messages} sub={`${stats.engagement.conversations} conversations`} color="teal" icon="💬" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminChartCard title="Registrations — last 30 days" data={stats.registrationTrend} color="#3b82f6" />
        <AdminChartCard title="Page Views — last 30 days" data={stats.pageviews} color="#8b5cf6" />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Job Status Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[['Open', jobs.open, 'bg-green-500'], ['In Progress', jobs.inProgress, 'bg-blue-500'], ['Completed', jobs.done, 'bg-gray-500'], ['Cancelled', jobs.cancelled, 'bg-red-500']].map(([label, count, color]) => (
            <div key={label as string} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
              <div><div className="text-white font-semibold">{count}</div><div className="text-gray-500 text-xs">{label}</div></div>
            </div>
          ))}
        </div>
        {jobs.total > 0 && (
          <div className="mt-4 flex h-2 rounded-full overflow-hidden">
            <div className="bg-green-500" style={{ width: pct(jobs.open, jobs.total) }} />
            <div className="bg-blue-500" style={{ width: pct(jobs.inProgress, jobs.total) }} />
            <div className="bg-gray-500" style={{ width: pct(jobs.done, jobs.total) }} />
            <div className="bg-red-500" style={{ width: pct(jobs.cancelled, jobs.total) }} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentUsersTable users={stats.recentUsers} />
        <RecentJobsTable jobs={stats.recentJobs} />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Platform Engagement</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[['Total Proposals', stats.engagement.proposals], ['Reviews Left', stats.engagement.reviews], ['Conversations', stats.engagement.conversations], ['Messages Sent', stats.engagement.messages]].map(([label, value]) => (
            <div key={label as string}><div className="text-2xl font-bold text-white">{(value as number).toLocaleString()}</div><div className="text-gray-500 text-xs mt-0.5">{label}</div></div>
          ))}
        </div>
      </div>
    </div>
  )
}
