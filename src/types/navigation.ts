export interface NavCategory {
  id: string
  slug: string
  name_en: string
  name_ru: string
  name_th: string
  icon?: string
  icon_url?: string
  children?: NavCategory[]
}

export interface NavUser {
  id: string
  full_name: string
  role: string
  avatar_url?: string
}

export interface DropdownConfig {
  labelKey: string
  getHref: (slug: string) => string
}

export interface NavLink {
  labelKey: string
  href: string
}
