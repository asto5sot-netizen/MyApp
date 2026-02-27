'use client'

import { useTranslation } from 'react-i18next'

interface Props {
  rating?: number
  reviewsCount?: number
  completedJobs?: number
  activeJobs: number
}

export function ProStatsCards({ rating, reviewsCount, completedJobs, activeJobs }: Props) {
  const { t } = useTranslation()
  const stats = [
    { label: t('profile.rating'), value: rating?.toFixed(1) ?? '—', icon: '⭐' },
    { label: t('profile.reviews'), value: reviewsCount ?? 0, icon: '💬' },
    { label: t('profile.completedJobs'), value: completedJobs ?? 0, icon: '✅' },
    { label: 'Active jobs', value: activeJobs, icon: '🔥' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map(stat => (
        <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl mb-1">{stat.icon}</div>
          <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
