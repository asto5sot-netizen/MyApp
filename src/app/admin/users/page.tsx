'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { RoleBadge } from '../_components/AdminBadges'

interface UserRow {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  is_verified: boolean
  phone: string | null
  city: string | null
  created_at: string
  pro_profile: {
    verification_status: string
    rating: number | null
    reviews_count: number
    completed_jobs: number
  } | null
}

interface UsersResponse {
  users: UserRow[]
  total: number
  page: number
  pages: number
}

// useSearchParams() requires a Suspense boundary in Next.js 14 App Router
export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500 animate-pulse text-sm">Loading…</div>}>
      <UsersContent />
    </Suspense>
  )
}

function UsersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const page = parseInt(searchParams.get('page') || '1')
  const role = searchParams.get('role') || 'all'
  const status = searchParams.get('status') || 'all'
  const search = searchParams.get('search') || ''

  const [searchInput, setSearchInput] = useState(search)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    const q = new URLSearchParams({ page: String(page), role, status, search })
    fetch(`/api/admin/users?${q}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data) })
      .finally(() => setLoading(false))
  }, [page, role, status, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    p.set(key, value)
    if (key !== 'page') p.set('page', '1')
    router.push(`/admin/users?${p.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setParam('search', searchInput)
  }

  const toggleActive = async (user: UserRow) => {
    setActionLoading(user.id)
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !user.is_active }),
    })
    setActionLoading(null)
    fetchUsers()
  }

  const promoteToAdmin = async (user: UserRow) => {
    if (!confirm(`Make ${user.email} an admin?`)) return
    setActionLoading(user.id)
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' }),
    })
    setActionLoading(null)
    fetchUsers()
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {data ? `${data.total.toLocaleString()} total` : '—'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by name or email…"
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 w-64 focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            Search
          </button>
        </form>

        {/* Role filter */}
        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          {['all', 'client', 'pro', 'admin'].map(r => (
            <button
              key={r}
              onClick={() => setParam('role', r)}
              className={`text-sm px-3 py-2 transition-colors ${role === r ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          {[['all', 'All'], ['active', 'Active'], ['inactive', 'Inactive']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setParam('status', v)}
              className={`text-sm px-3 py-2 transition-colors ${status === v ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Phone</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">City</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4" colSpan={7}>
                      <div className="h-4 bg-gray-800 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : data?.users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-600">
                    No users found
                  </td>
                </tr>
              ) : (
                data?.users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-800/50 transition-colors">
                    {/* Name + email */}
                    <td className="px-5 py-3.5">
                      <div className="text-white font-medium truncate max-w-[180px]">{u.full_name || '—'}</div>
                      <div className="text-gray-500 text-xs truncate max-w-[180px]">{u.email}</div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <RoleBadge role={u.role} />
                      {u.pro_profile && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          {u.pro_profile.verification_status}
                        </div>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3.5 hidden md:table-cell text-gray-400 text-xs">
                      {u.phone || '—'}
                    </td>

                    {/* City */}
                    <td className="px-4 py-3.5 hidden lg:table-cell text-gray-400 text-xs">
                      {u.city || '—'}
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3.5 hidden lg:table-cell text-gray-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.is_active ? 'bg-green-900/60 text-green-400' : 'bg-red-900/60 text-red-400'}`}>
                        {u.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={actionLoading === u.id}
                          className={`text-xs px-2.5 py-1 rounded-md transition-colors disabled:opacity-40 ${
                            u.is_active
                              ? 'bg-red-900/50 text-red-400 hover:bg-red-800/60'
                              : 'bg-green-900/50 text-green-400 hover:bg-green-800/60'
                          }`}
                        >
                          {u.is_active ? 'Block' : 'Unblock'}
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => promoteToAdmin(u)}
                            disabled={actionLoading === u.id}
                            className="text-xs px-2.5 py-1 rounded-md bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-40"
                          >
                            Make admin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page {data.page} of {data.pages} · {data.total} users
            </span>
            <div className="flex gap-2">
              {data.page > 1 && (
                <button
                  onClick={() => setParam('page', String(data.page - 1))}
                  className="text-xs px-3 py-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-md transition-colors"
                >
                  ← Prev
                </button>
              )}
              {data.page < data.pages && (
                <button
                  onClick={() => setParam('page', String(data.page + 1))}
                  className="text-xs px-3 py-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-md transition-colors"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

