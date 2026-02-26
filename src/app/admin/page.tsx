'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Stats {
  users: { total: number; clients: number; pros: number; newToday: number; newWeek: number; newMonth: number }
  jobs: { total: number; open: number; inProgress: number; done: number; cancelled: number }
  engagement: { proposals: number; reviews: number; conversations: number; messages: number }
  pendingVerification: number
  registrationTrend: { day: string; count: number }[]
  pageviews: { day: string; count: number }[]
  recentUsers: { id: string; full_name: string; email: string; role: string; is_active: boolean; created_at: string; city: string | null }[]
  recentJobs: { id: string; title: string; status: string; city: string | null; created_at: string; proposals_count: number; budget_min: number | null; budget_max: number | null }[]
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 animate-pulse text-sm">Loading stats…</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-400 text-sm">Failed to load statistics</div>
      </div>
    )
  }

  const todayViews = stats.pageviews.at(-1)?.count ?? 0
  const weekViews = stats.pageviews.slice(-7).reduce((s, d) => s + d.count, 0)
  const monthViews = stats.pageviews.reduce((s, d) => s + d.count, 0)

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link href="/admin/users" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Manage Users →
        </Link>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Users" value={stats.users.total} sub={`${stats.users.clients} clients · ${stats.users.pros} pros`} color="blue" icon="👥" />
        <MetricCard label="New Today" value={stats.users.newToday} sub={`+${stats.users.newWeek} this week`} color="green" icon="🆕" />
        <MetricCard label="Page Views Today" value={todayViews} sub={`${weekViews} this week · ${monthViews} this month`} color="purple" icon="👁️" />
        <MetricCard label="Pending Verification" value={stats.pendingVerification} sub="Pro profiles awaiting review" color={stats.pendingVerification > 0 ? 'amber' : 'gray'} icon="⚠️" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Jobs" value={stats.jobs.total} sub={`${stats.jobs.open} open · ${stats.jobs.inProgress} in progress`} color="blue" icon="📋" />
        <MetricCard label="Completed Jobs" value={stats.jobs.done} sub={`${stats.jobs.cancelled} cancelled`} color="green" icon="✅" />
        <MetricCard label="Proposals" value={stats.engagement.proposals} sub="Total proposals sent" color="purple" icon="📨" />
        <MetricCard label="Messages" value={stats.engagement.messages} sub={`${stats.engagement.conversations} conversations`} color="teal" icon="💬" />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Registrations — last 30 days" data={stats.registrationTrend} color="#3b82f6" />
        <ChartCard title="Page Views — last 30 days" data={stats.pageviews} color="#8b5cf6" />
      </div>

      {/* ── Job status breakdown ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Job Status Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatusPill label="Open" count={stats.jobs.open} color="bg-green-500" />
          <StatusPill label="In Progress" count={stats.jobs.inProgress} color="bg-blue-500" />
          <StatusPill label="Completed" count={stats.jobs.done} color="bg-gray-500" />
          <StatusPill label="Cancelled" count={stats.jobs.cancelled} color="bg-red-500" />
        </div>
        {stats.jobs.total > 0 && (
          <div className="mt-4 flex h-2 rounded-full overflow-hidden">
            <div className="bg-green-500 transition-all" style={{ width: pct(stats.jobs.open, stats.jobs.total) }} />
            <div className="bg-blue-500 transition-all" style={{ width: pct(stats.jobs.inProgress, stats.jobs.total) }} />
            <div className="bg-gray-500 transition-all" style={{ width: pct(stats.jobs.done, stats.jobs.total) }} />
            <div className="bg-red-500 transition-all" style={{ width: pct(stats.jobs.cancelled, stats.jobs.total) }} />
          </div>
        )}
      </div>

      {/* ── Tables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Registrations</h2>
            <Link href="/admin/users" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
          </div>
          <div className="divide-y divide-gray-800">
            {stats.recentUsers.map(u => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm text-white truncate">{u.full_name || '—'}</div>
                  <div className="text-xs text-gray-500 truncate">{u.email}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <RoleBadge role={u.role} />
                  <span className="text-xs text-gray-600">{timeAgo(u.created_at)}</span>
                </div>
              </div>
            ))}
            {stats.recentUsers.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-600 text-sm">No users yet</div>
            )}
          </div>
        </div>

        {/* Recent jobs */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-white">Recent Jobs</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {stats.recentJobs.map(j => (
              <div key={j.id} className="px-5 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm text-white truncate">{j.title}</div>
                  <div className="text-xs text-gray-500">{j.city || '—'} · {j.proposals_count} proposals</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <JobStatusBadge status={j.status} />
                  <span className="text-xs text-gray-600">{timeAgo(j.created_at)}</span>
                </div>
              </div>
            ))}
            {stats.recentJobs.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-600 text-sm">No jobs yet</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Engagement summary ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Platform Engagement</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <EngagementStat label="Total Proposals" value={stats.engagement.proposals} />
          <EngagementStat label="Reviews Left" value={stats.engagement.reviews} />
          <EngagementStat label="Conversations" value={stats.engagement.conversations} />
          <EngagementStat label="Messages Sent" value={stats.engagement.messages} />
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

const colorMap: Record<string, string> = {
  blue: 'border-blue-800 bg-blue-950',
  green: 'border-green-800 bg-green-950',
  purple: 'border-purple-800 bg-purple-950',
  amber: 'border-amber-800 bg-amber-950',
  teal: 'border-teal-800 bg-teal-950',
  gray: 'border-gray-800 bg-gray-900',
}

function MetricCard({ label, value, sub, color, icon }: { label: string; value: number; sub: string; color: string; icon: string }) {
  return (
    <div className={`border rounded-xl p-5 ${colorMap[color] || colorMap.gray}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</div>
          <div className="text-3xl font-bold text-white mt-1">{value.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">{sub}</div>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

function ChartCard({ title, data, color }: { title: string; data: { day: string; count: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <span className="text-xs text-gray-500">Total: {total.toLocaleString()}</span>
      </div>
      {total === 0 ? (
        <div className="h-20 flex items-center justify-center text-gray-600 text-sm">No data yet</div>
      ) : (
        <div className="flex items-end gap-0.5 h-20">
          {data.map(d => (
            <div
              key={d.day}
              title={`${d.day}: ${d.count}`}
              className="flex-1 rounded-sm min-w-0 transition-all hover:opacity-80 cursor-default"
              style={{
                height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 0)}%`,
                backgroundColor: color,
                opacity: d.count === 0 ? 0.15 : 0.85,
              }}
            />
          ))}
        </div>
      )}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <span>{data.at(0)?.day?.slice(5) ?? ''}</span>
        <span>{data.at(-1)?.day?.slice(5) ?? ''}</span>
      </div>
    </div>
  )
}

function StatusPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
      <div>
        <div className="text-white font-semibold">{count}</div>
        <div className="text-gray-500 text-xs">{label}</div>
      </div>
    </div>
  )
}

function EngagementStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
      <div className="text-gray-500 text-xs mt-0.5">{label}</div>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    client: 'bg-blue-900 text-blue-300',
    pro: 'bg-purple-900 text-purple-300',
    admin: 'bg-red-900 text-red-300',
  }
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors[role] ?? 'bg-gray-800 text-gray-400'}`}>
      {role}
    </span>
  )
}

function JobStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: 'bg-green-900 text-green-300',
    in_progress: 'bg-blue-900 text-blue-300',
    done: 'bg-gray-800 text-gray-400',
    cancelled: 'bg-red-900 text-red-300',
  }
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors[status] ?? 'bg-gray-800 text-gray-400'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function pct(n: number, total: number) {
  return total > 0 ? `${((n / total) * 100).toFixed(1)}%` : '0%'
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
