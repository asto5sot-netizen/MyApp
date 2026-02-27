'use client'

import { memo, useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useNavData } from '@/hooks/useNavData'
import { useLang } from '@/hooks/useLang'
import { DROPDOWNS, STATIC_LINKS } from '@/config/navigation'
import { NavLogo } from './nav/NavLogo'
import { CategoryDropdown } from './nav/CategoryDropdown'
import { LanguageSwitcher } from './nav/LanguageSwitcher'
import { UserMenu } from './nav/UserMenu'
import { MobileMenu } from './nav/MobileMenu'
import { NotificationBell } from './nav/NotificationBell'
import type { NavCategory } from '@/types/navigation'

export default memo(function Navbar() {
  const { t } = useTranslation()
  const router = useRouter()
  const lang = useLang()
  const { user, setUser, categories } = useNavData()
  const [menuOpen, setMenuOpen] = useState(false)

  const getCatName = useCallback((cat: NavCategory) => {
    if (lang === 'ru') return cat.name_ru
    if (lang === 'th') return cat.name_th
    return cat.name_en
  }, [lang])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
  }, [setUser, router])

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <NavLogo />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-6">
            {DROPDOWNS.map(dropdown => (
              <CategoryDropdown
                key={dropdown.labelKey}
                label={t(dropdown.labelKey)}
                categories={categories}
                getHref={dropdown.getHref}
                getCatName={getCatName}
              />
            ))}

            {STATIC_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                {t(link.labelKey)}
              </Link>
            ))}

            <LanguageSwitcher />
            {user && <NotificationBell />}
            <UserMenu user={user} onLogout={logout} />
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {menuOpen && (
          <MobileMenu
            user={user}
            categories={categories}
            getCatName={getCatName}
            onLogout={logout}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </div>
    </nav>
  )
})
