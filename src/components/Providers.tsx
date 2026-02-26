'use client'

import '@/i18n/config'
import { ReactNode } from 'react'

// i18n is still imported so pages that use t() continue to work.
// The language is intentionally kept at 'en' — Google Translate handles
// all UI translation globally, so we never call i18n.changeLanguage().

export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>
}
