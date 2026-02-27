'use client'
import { useTranslation } from 'react-i18next'

const Arrow = () => (
  <div className="hidden md:flex items-center justify-center px-2 mt-10 shrink-0">
    <svg width="40" height="14" viewBox="0 0 40 14">
      <line x1="0" y1="7" x2="30" y2="7" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 3"/>
      <polyline points="26,3 34,7 26,11" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  </div>
)

export function HowItWorks() {
  const { t } = useTranslation()
  return (
    <section className="bg-slate-50 py-20 px-4" id="how-it-works">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-black text-gray-900 text-center mb-16">{t('nav.howItWorks')}</h2>
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0">
          <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full border-2 border-blue-400 bg-white flex items-center justify-center mb-6 mx-auto text-blue-500">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
                <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-blue-600 mb-3 text-center">{t('howItWorks.step')} 1: {t('howItWorks.step1Title')}</h3>
            <p className="text-gray-500 text-sm text-center leading-relaxed">{t('howItWorks.step1Desc')}</p>
          </div>
          <Arrow />
          <div className="flex-1 bg-purple-50 border border-purple-100 rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full border-2 border-purple-400 bg-white flex items-center justify-center mb-6 mx-auto text-purple-500">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-purple-600 mb-3 text-center">{t('howItWorks.step')} 2: {t('howItWorks.step2Title')}</h3>
            <p className="text-gray-500 text-sm text-center leading-relaxed">{t('howItWorks.step2Desc')}</p>
          </div>
          <Arrow />
          <div className="flex-1 bg-green-50 border border-green-100 rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full border-2 border-green-400 bg-white flex items-center justify-center mb-6 mx-auto text-green-500">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9,12 11,14 15,10"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-green-600 mb-3 text-center">{t('howItWorks.step3Title')}</h3>
            <p className="text-gray-500 text-sm text-center leading-relaxed">{t('howItWorks.step3Desc')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
