'use client'

import { memo } from 'react'
import { LANGUAGES } from '@/config/navigation'
import { useLanguageSwitch } from '@/hooks/useLanguageSwitch'

export const LanguageSwitcher = memo(function LanguageSwitcher() {
  const { currentLang, changeLanguage } = useLanguageSwitch()

  return (
    <div className="flex items-center space-x-1 border border-gray-200 rounded-lg px-2 py-1">
      {LANGUAGES.map(lang => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          className={`text-xs px-2 py-1 rounded-md transition-colors ${
            currentLang === lang
              ? 'bg-blue-600 text-white'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
})
