'use client'

import Link from 'next/link'

export interface NotifItem {
  id: string
  title: string
  body: string
  is_read: boolean
  created_at: string
  data?: { job_id?: string; conversation_id?: string }
}

interface Props {
  notifications: NotifItem[]
  emptyLabel?: string
  limit?: number
}

export function NotificationList({ notifications, emptyLabel = 'No notifications', limit = 6 }: Props) {
  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 text-center text-gray-400 text-sm">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.slice(0, limit).map(n => {
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
  )
}
