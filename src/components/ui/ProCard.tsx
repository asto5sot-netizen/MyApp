import Link from 'next/link'
import { StarRating } from './StarRating'

interface ProCardProps {
  id: string
  fullName: string
  avatarUrl?: string | null
  city: string
  rating: number
  reviewsCount: number
  completedJobs: number
  isAvailable: boolean
  verificationStatus: string
  hourlyRate?: string | number | null
  categoryName?: string
  priceFrom?: string | number | null
}

export function ProCard({ id, fullName, avatarUrl, city, rating, reviewsCount, completedJobs, isAvailable, verificationStatus, hourlyRate, categoryName, priceFrom }: ProCardProps) {
  return (
    <Link href={`/pro/${id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-violet-400 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
          {avatarUrl ? <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" /> : fullName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-gray-900 truncate">{fullName}</p>
            {verificationStatus === 'verified' && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">Verified</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-1.5">📍 {city}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <StarRating rating={rating} />
              <span className="font-medium text-gray-700">{rating > 0 ? rating.toFixed(1) : '—'}</span>
              <span>({reviewsCount})</span>
            </div>
            <span>{completedJobs} completed</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {(priceFrom || hourlyRate) && (
            <p className="text-sm font-bold text-gray-900">from ฿{priceFrom || hourlyRate}</p>
          )}
          {!isAvailable && <p className="text-xs text-gray-400 mt-1">Busy</p>}
        </div>
      </div>
    </Link>
  )
}
