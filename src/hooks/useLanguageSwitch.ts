'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCurrentLang, triggerGoogleTranslate } from '@/lib/translate'

/**
 * Shared hook for language switching logic.
 * Deduplicates identical code in LanguageSwitcher and MobileMenu.
 */
export function useLanguageSwitch() {
  const [currentLang, setCurrentLang] = useState('en')

  useEffect(() => {
    setCurrentLang(getCurrentLang())
  }, [])

  const changeLanguage = useCallback((lang: string) => {
    setCurrentLang(lang)
    localStorage.setItem('lang', lang)
    triggerGoogleTranslate(lang)
  }, [])

  return { currentLang, changeLanguage }
}
