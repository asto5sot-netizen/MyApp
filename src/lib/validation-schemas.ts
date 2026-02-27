import { z } from 'zod'

// ── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// ── Jobs ────────────────────────────────────────────────────────────────────

export const createJobSchema = z.object({
  category_id: z.string().uuid(),
  title: z.string().min(5).max(500),
  description: z.string().min(10),
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
  location_address: z.string().optional(),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
  district: z.string().optional(),
  city: z.string().default('Bangkok'),
  preferred_date: z.string().datetime().optional(),
}).refine(
  data => !(data.budget_min && data.budget_max && data.budget_min > data.budget_max),
  { message: 'budget_min must not exceed budget_max', path: ['budget_min'] }
)

// ── Proposals ───────────────────────────────────────────────────────────────

export const proposalSchema = z.object({
  message: z.string().min(10).max(2000),
  price: z.number().positive(),
  price_type: z.enum(['fixed', 'per_hour', 'negotiable']).default('fixed'),
  estimated_days: z.number().int().positive().optional(),
})

// ── Messages ────────────────────────────────────────────────────────────────

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  message_type: z.enum(['text', 'image', 'file']).default('text'),
  attachment_url: z.string().url().optional(),
})

// ── Reviews ─────────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  job_id: z.string().uuid(),
  pro_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(2000).optional(),
})

// ── Profile ─────────────────────────────────────────────────────────────────

const urlOrEmpty = z.string().url().optional().or(z.literal(''))

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  preferred_language: z.enum(['en', 'th', 'ru']).optional(),
  avatar_url: z.string().url().optional(),
  city: z.string().optional(),
  // Pro-specific
  bio: z.string().max(2000).optional(),
  experience_years: z.number().int().min(0).max(50).optional(),
  hourly_rate: z.number().positive().optional(),
  service_radius_km: z.number().int().positive().optional(),
  is_available: z.boolean().optional(),
  category_ids: z.array(z.string().uuid()).optional(),
  // Social media (pro only)
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),
  line_id: z.string().optional(),
  facebook: urlOrEmpty,
  instagram: urlOrEmpty,
  tiktok: urlOrEmpty,
  youtube: urlOrEmpty,
  website: urlOrEmpty,
})
