import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser, unauthorizedResponse } from '@/lib/auth-middleware'
import { errorResponse, successResponse } from '@/lib/api-response'
import { v4 as uuidv4 } from 'uuid'

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'proservice-uploads'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']

export async function POST(req: NextRequest) {
  const payload = await getAuthUser(req)
  if (!payload) return unauthorizedResponse()

  const formData = await req.formData().catch(() => null)
  if (!formData) return errorResponse('Invalid form data', 400)

  const file = formData.get('file') as File | null
  if (!file) return errorResponse('No file provided', 400)

  if (file.size > MAX_SIZE) return errorResponse('File too large (max 10 MB)', 413)
  if (!ALLOWED_TYPES.includes(file.type)) return errorResponse('File type not allowed', 415)

  const ext = file.name.split('.').pop() || 'bin'
  const path = `${payload.userId}/${uuidv4()}.${ext}`

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) return errorResponse(error.message, 500)

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return successResponse({ url: publicUrl, path }, 201)
}
