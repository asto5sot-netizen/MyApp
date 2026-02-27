'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/Navbar'
import { useLang } from '@/hooks/useLang'
import { ProProfileCard } from './_components/ProProfileCard'
import { ProContactsCard } from './_components/ProContactsCard'
import { ProReviewList } from './_components/ProReviewList'
import { ReviewModal } from './_components/ReviewModal'

interface ProProfile {
  bio?: string; bio_translated?: Record<string, string>
  experience_years: number; hourly_rate?: number; city: string
  rating: number; reviews_count: number; completed_jobs: number
  verification_status: string; is_available: boolean
  whatsapp?: string; telegram?: string; line_id?: string
  facebook?: string; instagram?: string; tiktok?: string; youtube?: string; website?: string
  categories: Array<{ category: { name_en: string; name_ru: string; name_th: string }; price_from?: number }>
  photos: Array<{ id: string; url: string; caption?: string }>
}
interface Review {
  id: string; rating: number; comment?: string; comment_translated?: Record<string, string>
  original_language: string; created_at: string
  reviewer: { id: string; full_name: string }
}
interface Pro {
  id: string; full_name: string; phone?: string; avatar_url?: string
  pro_profile: ProProfile
  reviews_received: Review[]
}

const waLink = (n: string) => `https://wa.me/${n.replace(/\D/g, '')}`
const tgLink = (h: string) => `https://t.me/${h.replace(/^@/, '')}`

export default function ProPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50"><Navbar /></div>}>
      <ProPageContent />
    </Suspense>
  )
}

function ProPageContent() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const lang = useLang()
  const router = useRouter()
  const [pro, setPro] = useState<Pro | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewOpen, setReviewOpen] = useState(false)

  const reviewJobId = searchParams.get('review_job')

  const loadPro = () =>
    fetch(`/api/pros/${id}`).then(r => r.json()).then(d => {
      if (d.success) {
        setPro(d.data.pro)
        setReviews(d.data.pro.reviews_received)
      }
    })

  useEffect(() => { loadPro() }, [id])

  // Auto-open review modal if param present
  useEffect(() => {
    if (reviewJobId && pro) setReviewOpen(true)
  }, [reviewJobId, pro])

  const getTranslated = (map?: Record<string, string>, original?: string) =>
    map ? (map[lang] || map['en'] || original || '') : (original || '')

  const getCatName = (cat: { name_en: string; name_ru: string; name_th: string }) =>
    lang === 'ru' ? cat.name_ru : lang === 'th' ? cat.name_th : cat.name_en

  if (!pro) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-64"><div className="text-gray-500">{t('common.loading')}</div></div>
    </div>
  )

  const profile = pro.pro_profile
  const socialLinks = [
    profile.whatsapp && { key: 'whatsapp', label: 'WhatsApp', icon: '💬', href: waLink(profile.whatsapp), display: `+${profile.whatsapp}`, color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' },
    profile.telegram && { key: 'telegram', label: 'Telegram', icon: '✈️', href: tgLink(profile.telegram), display: profile.telegram.startsWith('@') ? profile.telegram : `@${profile.telegram}`, color: 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100' },
    profile.line_id && { key: 'line', label: 'LINE', icon: '🟢', href: `https://line.me/ti/p/~${profile.line_id}`, display: profile.line_id, color: 'bg-lime-50 border-lime-200 text-lime-700 hover:bg-lime-100' },
    profile.instagram && { key: 'instagram', label: 'Instagram', icon: '📸', href: profile.instagram, display: profile.instagram.replace('https://instagram.com/', '@').replace('https://www.instagram.com/', '@'), color: 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100' },
    profile.facebook && { key: 'facebook', label: 'Facebook', icon: '👤', href: profile.facebook, display: 'Facebook', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
    profile.tiktok && { key: 'tiktok', label: 'TikTok', icon: '🎵', href: profile.tiktok, display: 'TikTok', color: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100' },
    profile.youtube && { key: 'youtube', label: 'YouTube', icon: '▶️', href: profile.youtube, display: 'YouTube', color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' },
    profile.website && { key: 'website', label: 'Website', icon: '🌐', href: profile.website, display: profile.website.replace(/^https?:\/\//, ''), color: 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100' },
  ].filter(Boolean) as Array<{ key: string; label: string; icon: string; href: string; display: string; color: string }>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="text-blue-600 text-sm flex items-center gap-1 mb-4 hover:underline">
          ← {t('common.back')}
        </button>

        {/* CTA: Leave a review banner */}
        {reviewJobId && !reviewOpen && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <p className="text-blue-800 text-sm font-medium">How was your experience? Share a review for this pro.</p>
            <button
              onClick={() => setReviewOpen(true)}
              className="ml-4 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Leave review
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <ProProfileCard pro={pro} profile={profile} getCatName={getCatName} />
            <ProContactsCard phone={pro.phone} socialLinks={socialLinks} />
          </div>
          <div className="md:col-span-2 space-y-4">
            {profile.bio && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-3">{t('profile.bio')}</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{getTranslated(profile.bio_translated, profile.bio)}</p>
              </div>
            )}
            {profile.photos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-3">{t('profile.photos')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {profile.photos.map(photo => (
                    <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <ProReviewList reviews={reviews} getTranslated={getTranslated} />
          </div>
        </div>
      </div>

      {reviewOpen && reviewJobId && (
        <ReviewModal
          proId={pro.id}
          jobId={reviewJobId}
          onClose={() => setReviewOpen(false)}
          onSubmitted={() => {
            setReviewOpen(false)
            loadPro()
          }}
        />
      )}
    </div>
  )
}
