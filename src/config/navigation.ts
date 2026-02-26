import type { DropdownConfig, NavLink } from '@/types/navigation'

export const DROPDOWNS: DropdownConfig[] = [
  { labelKey: 'nav.masters', getHref: (slug) => `/masters/${slug}` },
]

export const STATIC_LINKS: NavLink[] = [
  { labelKey: 'nav.howItWorks', href: '/how-it-works' },
]

export const LANGUAGES = ['en', 'th', 'ru'] as const
export type Language = typeof LANGUAGES[number]
