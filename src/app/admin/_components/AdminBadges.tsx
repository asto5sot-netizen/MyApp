'use client'

export function RoleBadge({ role }: { role: string }) {
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

export function JobStatusBadge({ status }: { status: string }) {
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

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function pct(n: number, total: number) {
  return total > 0 ? `${((n / total) * 100).toFixed(1)}%` : '0%'
}
