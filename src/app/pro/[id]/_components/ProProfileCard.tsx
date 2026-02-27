'use client'
import { useTranslation } from 'react-i18next'

interface ProProfile {
  city: string; rating: number; reviews_count: number; completed_jobs: number
  experience_years: number; hourly_rate?: number; is_available: boolean; verification_status: string
  categories: Array<{ category: { name_en: string; name_ru: string; name_th: string }; price_from?: number }>
}
interface Pro { full_name: string; avatar_url?: string }

interface Props {
  pro: Pro
  profile: ProProfile
  getCatName: (cat: { name_en: string; name_ru: string; name_th: string }) => string
}

export function ProProfileCard({ pro, profile, getCatName }: Props) {
  const { t } = useTranslation()
  const stars = Math.round(profile.rating)
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl mx-auto mb-4">
          {pro.avatar_url
            ? <img src={pro.avatar_url} alt={pro.full_name} className="w-full h-full rounded-full object-cover" />
            : pro.full_name[0]}
        </div>
        <h1 className="text-xl font-bold text-gray-900">{pro.full_name}</h1>
        <p className="text-gray-500 text-sm mt-1">{profile.city}</p>
        {profile.verification_status === 'verified' && (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full mt-2">
            ✓ {t('profile.verified')}
          </span>
        )}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
          <div><p className="text-lg font-bold text-gray-900">{'⭐'.repeat(Math.min(stars, 5))}</p><p className="text-xs text-gray-500 mt-0.5">{Number(profile.rating).toFixed(1)}/5</p></div>
          <div><p className="text-lg font-bold text-gray-900">{profile.reviews_count}</p><p className="text-xs text-gray-500 mt-0.5">{t('profile.reviews')}</p></div>
          <div><p className="text-lg font-bold text-gray-900">{profile.completed_jobs}</p><p className="text-xs text-gray-500 mt-0.5">Jobs done</p></div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-left">
          <div className="flex justify-between">
            <span className="text-gray-500">{t('profile.experience')}</span>
            <span className="font-medium text-gray-900">{profile.experience_years} yrs</span>
          </div>
          {profile.hourly_rate && (
            <div className="flex justify-between">
              <span className="text-gray-500">Rate</span>
              <span className="font-medium text-gray-900">฿{Number(profile.hourly_rate).toLocaleString()}/hr</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className={`font-medium ${profile.is_available ? 'text-green-600' : 'text-gray-400'}`}>
              {profile.is_available ? '● Available' : '● Busy'}
            </span>
          </div>
        </div>
      </div>

      {profile.categories.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">{t('profile.categories')}</h3>
          <div className="space-y-2">
            {profile.categories.map((pc, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{getCatName(pc.category)}</span>
                {pc.price_from && <span className="text-xs text-blue-600 font-medium">from ฿{pc.price_from.toLocaleString()}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
