'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/Navbar'
import { useLang } from '@/hooks/useLang'

interface ProProfile {
  bio?: string; bio_translated?: Record<string, string>
  experience_years: number; hourly_rate?: number; city: string
  rating: number; reviews_count: number; completed_jobs: number
  verification_status: string; is_available: boolean
  whatsapp?: string; telegram?: string; line_id?: string
  facebook?: string; instagram?: string; tiktok?: string
  youtube?: string; website?: string
  categories: Array<{ category: { name_en: string; name_ru: string; name_th: string }; price_from?: number; description?: string }>
  photos: Array<{ id: string; url: string; caption?: string }>
}
interface Review {
  id: string; rating: number; comment?: string; comment_translated?: Record<string, string>
  original_language: string; created_at: string
  reviewer: { id: string; full_name: string; avatar_url?: string }
}
interface Pro {
  id: string; full_name: string; phone?: string; avatar_url?: string; created_at: string
  pro_profile: ProProfile
  reviews_received: Review[]
}

function waLink(num: string) {
  return `https://wa.me/${num.replace(/\D/g, '')}`
}
function tgLink(handle: string) {
  const clean = handle.replace(/^@/, '')
  return `https://t.me/${clean}`
}

export default function ProPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const lang = useLang()
  const router = useRouter()
  const [pro, setPro] = useState<Pro | null>(null)

  useEffect(() => {
    fetch(`/api/pros/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setPro(d.data.pro) })
  }, [id])

  const getTranslated = (map?: Record<string, string>, original?: string) => {
    if (!map) return original || ''
    return map[lang] || map['en'] || original || ''
  }

  const getCatName = (cat: { name_en: string; name_ru: string; name_th: string }) => {
    return lang === 'ru' ? cat.name_ru : lang === 'th' ? cat.name_th : cat.name_en
  }

  if (!pro) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-64"><div className="text-gray-500">{t('common.loading')}</div></div>
    </div>
  )

  const profile = pro.pro_profile
  const stars = Math.round(profile.rating)

  const socialLinks = [
    profile.whatsapp && {
      key: 'whatsapp', label: 'WhatsApp', icon: '💬',
      href: waLink(profile.whatsapp),
      display: `+${profile.whatsapp}`,
      color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
    },
    profile.telegram && {
      key: 'telegram', label: 'Telegram', icon: '✈️',
      href: tgLink(profile.telegram),
      display: profile.telegram.startsWith('@') ? profile.telegram : `@${profile.telegram}`,
      color: 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100',
    },
    profile.line_id && {
      key: 'line', label: 'LINE', icon: '🟢',
      href: `https://line.me/ti/p/~${profile.line_id}`,
      display: profile.line_id,
      color: 'bg-lime-50 border-lime-200 text-lime-700 hover:bg-lime-100',
    },
    profile.instagram && {
      key: 'instagram', label: 'Instagram', icon: '📸',
      href: profile.instagram,
      display: profile.instagram.replace('https://instagram.com/', '@').replace('https://www.instagram.com/', '@'),
      color: 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100',
    },
    profile.facebook && {
      key: 'facebook', label: 'Facebook', icon: '👤',
      href: profile.facebook,
      display: 'Facebook',
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    },
    profile.tiktok && {
      key: 'tiktok', label: 'TikTok', icon: '🎵',
      href: profile.tiktok,
      display: 'TikTok',
      color: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
    },
    profile.youtube && {
      key: 'youtube', label: 'YouTube', icon: '▶️',
      href: profile.youtube,
      display: 'YouTube',
      color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
    },
    profile.website && {
      key: 'website', label: 'Website', icon: '🌐',
      href: profile.website,
      display: profile.website.replace(/^https?:\/\//, ''),
      color: 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100',
    },
  ].filter(Boolean) as Array<{ key: string; label: string; icon: string; href: string; display: string; color: string }>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="text-blue-600 text-sm flex items-center gap-1 mb-4 hover:underline">
          ← {t('common.back')}
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="md:col-span-1 space-y-4">
            {/* Profile card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl mx-auto mb-4">
                {pro.avatar_url
                  ? <img src={pro.avatar_url} alt={pro.full_name} className="w-full h-full rounded-full object-cover" />
                  : pro.full_name[0]
                }
              </div>
              <h1 className="text-xl font-bold text-gray-900">{pro.full_name}</h1>
              <p className="text-gray-500 text-sm mt-1">{profile.city}</p>
              {profile.verification_status === 'verified' && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full mt-2">
                  ✓ {t('profile.verified')}
                </span>
              )}

              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
                <div>
                  <p className="text-lg font-bold text-gray-900">{'⭐'.repeat(Math.min(stars, 5))}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{Number(profile.rating).toFixed(1)}/5</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{profile.reviews_count}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('profile.reviews')}</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{profile.completed_jobs}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Jobs done</p>
                </div>
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

            {/* Contacts */}
            {(pro.phone || socialLinks.length > 0) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">📞 Contacts</h3>
                <div className="space-y-2">
                  {pro.phone && (
                    <a href={`tel:${pro.phone}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700 font-medium"
                    >
                      <span>📱</span>
                      <span>{pro.phone}</span>
                    </a>
                  )}
                  {socialLinks.map(link => (
                    <a key={link.key}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors text-sm font-medium ${link.color}`}
                    >
                      <span>{link.icon}</span>
                      <span className="flex-1">{link.label}</span>
                      <span className="text-xs opacity-70 truncate max-w-[100px]">{link.display}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
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

          {/* Right column */}
          <div className="md:col-span-2 space-y-4">
            {/* About */}
            {profile.bio && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-3">{t('profile.bio')}</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {getTranslated(profile.bio_translated as Record<string, string>, profile.bio)}
                </p>
              </div>
            )}

            {/* Photos */}
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

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">{t('profile.reviews')} ({pro.reviews_received.length})</h2>
              {pro.reviews_received.length === 0 ? (
                <p className="text-gray-400 text-sm">{t('reviews.noReviews')}</p>
              ) : (
                <div className="space-y-4">
                  {pro.reviews_received.map(review => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
                          {review.reviewer.full_name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 text-sm">{review.reviewer.full_name}</p>
                            <div className="flex items-center gap-1">
                              {'⭐'.repeat(review.rating)}
                              <span className="text-xs text-gray-500 ml-1">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-600 mt-1">
                              {getTranslated(review.comment_translated as Record<string, string>, review.comment)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
