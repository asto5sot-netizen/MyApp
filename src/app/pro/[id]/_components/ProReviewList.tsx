'use client'
import { useTranslation } from 'react-i18next'
import { StarRating } from '@/components/ui/StarRating'

interface Review {
  id: string; rating: number; comment?: string; comment_translated?: Record<string, string>
  created_at: string
  reviewer: { id: string; full_name: string }
}

interface Props {
  reviews: Review[]
  getTranslated: (map?: Record<string, string>, original?: string) => string
}

export function ProReviewList({ reviews, getTranslated }: Props) {
  const { t } = useTranslation()
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="font-bold text-gray-900 mb-4">{t('profile.reviews')} ({reviews.length})</h2>
      {reviews.length === 0 ? (
        <p className="text-gray-400 text-sm">{t('reviews.noReviews')}</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
                  {review.reviewer.full_name?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 text-sm">{review.reviewer.full_name}</p>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 mt-1">
                      {getTranslated(review.comment_translated, review.comment)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
