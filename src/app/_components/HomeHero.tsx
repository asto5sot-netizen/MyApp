'use client'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export function HomeHero() {
  const { t } = useTranslation()
  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
          <span className="text-sm font-medium">🇹🇭 {t('hero.location')}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{t('hero.title')}</h1>
        <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">{t('hero.subtitle')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/jobs/create" className="bg-white text-blue-600 font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-50 transition-colors shadow-lg">
            {t('hero.cta')}
          </Link>
          <Link href="/auth/register?role=pro" className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/10 transition-colors">
            {t('hero.ctaPro')}
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {['🇬🇧 English', '🇹🇭 ภาษาไทย', '🇷🇺 Русский', '+ Auto-translate all languages'].map(l => (
            <span key={l} className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">{l}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
