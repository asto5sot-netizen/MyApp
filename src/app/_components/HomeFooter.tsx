'use client'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export function HomeFooter() {
  const { t } = useTranslation()
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-white font-bold text-lg">ProService Thailand</div>
        <div className="text-sm">{t('footer.rights')}</div>
        <div className="flex gap-4 text-sm">
          <Link href="/privacy" className="hover:text-white">{t('footer.privacy')}</Link>
          <Link href="/terms" className="hover:text-white">{t('footer.terms')}</Link>
        </div>
      </div>
    </footer>
  )
}
