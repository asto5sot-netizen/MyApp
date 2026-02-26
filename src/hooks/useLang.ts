'use client'

import { useState, useEffect } from 'react'
import { getCurrentLang } from '@/lib/translate'

/**
 * Reactive hook that returns the currently active language.
 * Reads from the googtrans cookie / localStorage and re-renders when
 * the user switches languages (via the custom 'langchange' event).
 */
export function useLang(): string {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    setLang(getCurrentLang())
    const handler = () => setLang(getCurrentLang())
    window.addEventListener('langchange', handler)
    return () => window.removeEventListener('langchange', handler)
  }, [])

  return lang
}
