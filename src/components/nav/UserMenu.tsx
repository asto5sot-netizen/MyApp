'use client'

import { memo } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import type { NavUser } from '@/types/navigation'

interface Props {
  user: NavUser | null
  onLogout: () => void
}

export const UserMenu = memo(function UserMenu({ user, onLogout }: Props) {
  const { t } = useTranslation()

  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
          {t('nav.login')}
        </Link>
        <Link
          href="/auth/register"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {t('nav.register')}
        </Link>
      </div>
    )
  }

  const dashboardHref = user.role === 'admin' ? '/admin' : user.role === 'client' ? '/dashboard/client' : '/dashboard/pro'

  return (
    <div className="flex items-center space-x-4">
      {user.role === 'admin' && (
        <Link href="/admin" className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg transition-colors">
          Admin Panel
        </Link>
      )}
      <Link href={dashboardHref} className="text-sm font-medium text-gray-700 hover:text-blue-600">
        {t('nav.dashboard')}
      </Link>
      {user.role === 'client' && (
        <Link
          href="/jobs/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {t('nav.postJob')}
        </Link>
      )}
      <Link href="/dashboard/settings" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
        Settings
      </Link>
      <button onClick={onLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors">
        {t('nav.logout')}
      </button>
    </div>
  )
})
