'use client'

import { memo } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, STATIC_LINKS } from '@/config/navigation'
import { useLanguageSwitch } from '@/hooks/useLanguageSwitch'
import { NotificationBell } from './NotificationBell'
import type { NavCategory, NavUser } from '@/types/navigation'

interface Props {
  user: NavUser | null
  categories: NavCategory[]
  getCatName: (cat: NavCategory) => string
  onLogout: () => void
  onClose: () => void
}

export const MobileMenu = memo(function MobileMenu({ user, categories, getCatName, onLogout, onClose }: Props) {
  const { t } = useTranslation()
  const { currentLang, changeLanguage } = useLanguageSwitch()

  return (
    <div className="md:hidden py-4 border-t border-gray-100 space-y-2 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Language switcher */}
      <div className="flex space-x-2 pb-3">
        {LANGUAGES.map(lang => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
              currentLang === lang
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Masters list */}
      <div className="pb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          {t('nav.masters')}
        </p>
        <div className="space-y-1">
          {categories.map(cat => (
            <div key={cat.id}>
              <Link
                href={`/masters/${cat.slug}`}
                onClick={onClose}
                className="flex items-center gap-1.5 py-1 text-sm font-medium text-gray-700"
              >
                {cat.icon_url && <span>{cat.icon_url}</span>}
                {getCatName(cat)}
              </Link>
              {cat.children?.map(child => (
                <Link
                  key={child.id}
                  href={`/masters/${child.slug}`}
                  onClick={onClose}
                  className="block pl-5 py-0.5 text-xs text-gray-500"
                >
                  {getCatName(child)}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Static links */}
      {STATIC_LINKS.map(link => (
        <Link key={link.href} href={link.href} onClick={onClose} className="block py-2 text-sm text-gray-700">
          {t(link.labelKey)}
        </Link>
      ))}

      {/* Auth section */}
      {user ? (
        <>
          <div className="flex items-center justify-between py-2">
            <Link
              href={user.role === 'client' ? '/dashboard/client' : '/dashboard/pro'}
              onClick={onClose}
              className="text-gray-700"
            >
              {t('nav.dashboard')}
            </Link>
            <NotificationBell />
          </div>
          {user.role === 'client' && (
            <Link href="/jobs/create" onClick={onClose} className="block py-2 text-blue-600 font-medium">
              {t('nav.postJob')}
            </Link>
          )}
          <button onClick={onLogout} className="block py-2 text-red-500">
            {t('nav.logout')}
          </button>
        </>
      ) : (
        <>
          <Link href="/auth/login" onClick={onClose} className="block py-2 text-gray-700">
            {t('nav.login')}
          </Link>
          <Link href="/auth/register" onClick={onClose} className="block py-2 text-blue-600 font-medium">
            {t('nav.register')}
          </Link>
        </>
      )}
    </div>
  )
})
