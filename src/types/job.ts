import type { User, ProProfile } from './profile'

export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type ProposalStatus = 'pending' | 'accepted' | 'rejected'
export type PriceType = 'fixed' | 'hourly' | 'negotiable'

export interface Category {
  id: string
  slug: string
  name_en: string
  name_ru: string
  name_th: string
  icon_url?: string
  children?: Category[]
}

export interface Job {
  id: string
  title: string
  description: string
  title_translated?: Record<string, string>
  description_translated?: Record<string, string>
  original_language?: string
  budget_min?: number
  budget_max?: number
  city: string
  district?: string
  location_address?: string
  preferred_date?: string
  status: JobStatus
  proposals_count: number
  created_at: string
  category: Pick<Category, 'name_en' | 'name_ru' | 'name_th'>
  client?: User
  proposals?: Proposal[]
}

export interface Proposal {
  id: string
  message: string
  message_translated?: Record<string, string>
  price: number
  price_type: PriceType
  estimated_days?: number
  status: ProposalStatus
  created_at: string
  job?: Job
  pro?: User & { pro_profile: ProProfile }
}
