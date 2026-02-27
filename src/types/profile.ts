export type Role = 'client' | 'pro' | 'admin'
export type Language = 'en' | 'th' | 'ru'
export type VerificationStatus = 'unverified' | 'pending' | 'verified'

export interface ProProfile {
  bio?: string
  bio_translated?: Record<string, string>
  experience_years: number
  hourly_rate?: number
  service_radius_km?: number
  city: string
  rating: number
  reviews_count: number
  completed_jobs: number
  verification_status: VerificationStatus
  is_available: boolean
  whatsapp?: string
  telegram?: string
  line_id?: string
  facebook?: string
  instagram?: string
  tiktok?: string
  youtube?: string
  website?: string
  categories?: Array<{
    category: { name_en: string; name_ru: string; name_th: string }
    price_from?: number
    description?: string
  }>
  photos?: Array<{ id: string; url: string; caption?: string }>
}

export interface User {
  id: string
  email?: string
  full_name: string
  phone?: string
  avatar_url?: string
  preferred_language?: Language
  city?: string
  role?: Role
  pro_profile?: ProProfile
}
