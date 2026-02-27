'use client'
import Link from 'next/link'
import { RoleBadge, JobStatusBadge, timeAgo } from './AdminBadges'

interface RecentUser { id: string; full_name: string; email: string; role: string; created_at: string }
interface RecentJob { id: string; title: string; status: string; city: string | null; proposals_count: number; created_at: string }

export function RecentUsersTable({ users }: { users: RecentUser[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Recent Registrations</h2>
        <Link href="/admin/users" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
      </div>
      <div className="divide-y divide-gray-800">
        {users.map(u => (
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
        {users.length === 0 && <div className="px-5 py-8 text-center text-gray-600 text-sm">No users yet</div>}
      </div>
    </div>
  )
}

export function RecentJobsTable({ jobs }: { jobs: RecentJob[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-white">Recent Jobs</h2>
      </div>
      <div className="divide-y divide-gray-800">
        {jobs.map(j => (
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
        {jobs.length === 0 && <div className="px-5 py-8 text-center text-gray-600 text-sm">No jobs yet</div>}
      </div>
    </div>
  )
}
