import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { createClient } from '@supabase/supabase-js'

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Supabase admin client (bypasses RLS, can create auth users)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const categories = [
  {
    slug: 'repair',
    name_th: 'ซ่อมแซมและบ้าน',
    name_en: 'Repair & Home',
    name_ru: 'Ремонт и дом',
    icon_url: '🔧',
    sort_order: 1,
    children: [
      { slug: 'plumbing', name_th: 'ประปา', name_en: 'Plumbing', name_ru: 'Сантехника', sort_order: 1 },
      { slug: 'electrical', name_th: 'ไฟฟ้า', name_en: 'Electrical', name_ru: 'Электрика', sort_order: 2 },
      { slug: 'ac', name_th: 'เครื่องปรับอากาศ', name_en: 'Air Conditioning', name_ru: 'Кондиционеры', sort_order: 3 },
      { slug: 'handyman', name_th: 'งานซ่อมทั่วไป', name_en: 'Handyman', name_ru: 'Мелкий ремонт', sort_order: 4 },
      { slug: 'cleaning', name_th: 'ทำความสะอาด', name_en: 'Cleaning', name_ru: 'Уборка', sort_order: 5 },
      { slug: 'moving', name_th: 'ขนย้าย', name_en: 'Moving', name_ru: 'Переезд', sort_order: 6 },
    ]
  },
  {
    slug: 'beauty',
    name_th: 'ความงามและการดูแล',
    name_en: 'Beauty & Care',
    name_ru: 'Красота и уход',
    icon_url: '💅',
    sort_order: 2,
    children: [
      { slug: 'nails', name_th: 'เล็บ', name_en: 'Nail Care', name_ru: 'Маникюр', sort_order: 1 },
      { slug: 'massage', name_th: 'นวด', name_en: 'Massage', name_ru: 'Массаж', sort_order: 2 },
      { slug: 'eyelashes', name_th: 'ต่อขนตา', name_en: 'Eyelash Extensions', name_ru: 'Наращивание ресниц', sort_order: 3 },
      { slug: 'haircut', name_th: 'ตัดผม', name_en: 'Haircut', name_ru: 'Парикмахер', sort_order: 4 },
      { slug: 'cosmetology', name_th: 'เสริมความงาม', name_en: 'Cosmetology', name_ru: 'Косметолог', sort_order: 5 },
    ]
  },
  {
    slug: 'digital',
    name_th: 'ดิจิทัลและไอที',
    name_en: 'Digital & IT',
    name_ru: 'Диджитал и IT',
    icon_url: '💻',
    sort_order: 3,
    children: [
      { slug: 'websites', name_th: 'สร้างเว็บไซต์', name_en: 'Web Development', name_ru: 'Создание сайтов', sort_order: 1 },
      { slug: 'smm', name_th: 'โซเชียลมีเดีย', name_en: 'Social Media', name_ru: 'SMM', sort_order: 2 },
      { slug: 'design', name_th: 'กราฟิกดีไซน์', name_en: 'Design', name_ru: 'Дизайн', sort_order: 3 },
      { slug: 'tech-setup', name_th: 'ตั้งค่าอุปกรณ์', name_en: 'Tech Setup', name_ru: 'Настройка техники', sort_order: 4 },
      { slug: 'photo-video', name_th: 'ถ่ายภาพ/วิดีโอ', name_en: 'Photo/Video', name_ru: 'Фото/видео', sort_order: 5 },
      { slug: 'phone-repair', name_th: 'ซ่อมโทรศัพท์', name_en: 'Phone Repair', name_ru: 'Ремонт сотовых', sort_order: 6 },
    ]
  },
  {
    slug: 'tutoring',
    name_th: 'การสอนพิเศษ',
    name_en: 'Tutoring',
    name_ru: 'Репетиторство',
    icon_url: '📚',
    sort_order: 4,
    children: [
      { slug: 'english', name_th: 'ภาษาอังกฤษ', name_en: 'English Language', name_ru: 'Английский язык', sort_order: 1 },
      { slug: 'thai', name_th: 'ภาษาไทย', name_en: 'Thai Language', name_ru: 'Тайский язык', sort_order: 2 },
      { slug: 'other-subjects', name_th: 'วิชาอื่นๆ', name_en: 'Other Subjects', name_ru: 'Другие предметы', sort_order: 3 },
      { slug: 'music', name_th: 'ดนตรี', name_en: 'Music', name_ru: 'Музыка', sort_order: 4 },
      { slug: 'exam-prep', name_th: 'เตรียมสอบ', name_en: 'Exam Preparation', name_ru: 'Подготовка к экзаменам', sort_order: 5 },
    ]
  },
  {
    slug: 'auto',
    name_th: 'ศูนย์บริการรถยนต์ / มอเตอร์ไซค์',
    name_en: 'Auto & Moto Service',
    name_ru: 'Авто / Мотосервис',
    icon_url: '🚗',
    sort_order: 5,
    children: [
      { slug: 'car-repair', name_th: 'ศูนย์บริการรถยนต์', name_en: 'Auto Service', name_ru: 'Автосервис', sort_order: 1 },
      { slug: 'moto-repair', name_th: 'ศูนย์บริการมอเตอร์ไซค์', name_en: 'Moto Service', name_ru: 'Мотосервис', sort_order: 2 },
    ]
  },
  {
    slug: 'entertainment',
    name_th: 'บันเทิงและอีเวนต์',
    name_en: 'Entertainment & Events',
    name_ru: 'Развлечения',
    icon_url: '🎉',
    sort_order: 55,
    children: [
      { slug: 'dj', name_th: 'ดีเจ', name_en: 'DJ', name_ru: 'DJ', sort_order: 1 },
      { slug: 'artists', name_th: 'ศิลปินแสดง', name_en: 'Artists & Performers', name_ru: 'Артисты', sort_order: 2 },
      { slug: 'event-planning', name_th: 'จัดงานอีเวนต์', name_en: 'Event Planning', name_ru: 'Организация мероприятий', sort_order: 3 },
      { slug: 'animation', name_th: 'แอนิเมเตอร์', name_en: 'Animators & Hosts', name_ru: 'Аниматоры и ведущие', sort_order: 4 },
      { slug: 'flowers', name_th: 'ดอกไม้และตกแต่ง', name_en: 'Flowers & Decor', name_ru: 'Цветы и декор', sort_order: 5 },
      { slug: 'gifts', name_th: 'ของขวัญและเซอร์ไพรส์', name_en: 'Gifts & Surprises', name_ru: 'Подарки и сюрпризы', sort_order: 6 },
      { slug: 'photo-event', name_th: 'ถ่ายภาพงาน', name_en: 'Event Photography', name_ru: 'Фото на мероприятиях', sort_order: 7 },
    ]
  },
  {
    slug: 'food',
    name_th: 'อาหารและการทำอาหาร',
    name_en: 'Food & Cooking',
    name_ru: 'Питание и кулинария',
    icon_url: '🍳',
    sort_order: 6,
    children: [
      { slug: 'home-chef', name_th: 'เชฟที่บ้าน', name_en: 'Home Chef', name_ru: 'Повар на дом', sort_order: 1 },
      { slug: 'catering', name_th: 'จัดเลี้ยง', name_en: 'Catering', name_ru: 'Кейтеринг', sort_order: 2 },
      { slug: 'culinary-classes', name_th: 'คลาสทำอาหาร', name_en: 'Culinary Classes', name_ru: 'Кулинарные мастерклассы', sort_order: 3 },
      { slug: 'baking', name_th: 'เบเกอรี่', name_en: 'Baking', name_ru: 'Выпечка', sort_order: 4 },
    ]
  },
  {
    slug: 'sports',
    name_th: 'กีฬาและฟิตเนส',
    name_en: 'Sports & Fitness',
    name_ru: 'Спорт и фитнес',
    icon_url: '💪',
    sort_order: 7,
    children: [
      { slug: 'yoga', name_th: 'โยคะ', name_en: 'Yoga', name_ru: 'Йога', sort_order: 1 },
      { slug: 'fitness', name_th: 'เทรนเนอร์', name_en: 'Personal Trainer', name_ru: 'Персональный тренер', sort_order: 2 },
      { slug: 'martial-arts', name_th: 'ศิลปะการต่อสู้', name_en: 'Martial Arts', name_ru: 'Единоборства', sort_order: 3 },
      { slug: 'swimming', name_th: 'ว่ายน้ำ', name_en: 'Swimming', name_ru: 'Плавание', sort_order: 4 },
    ]
  },
  {
    slug: 'other',
    name_th: 'บริการอื่นๆ',
    name_en: 'Other Services',
    name_ru: 'Другое',
    icon_url: '✨',
    sort_order: 8,
    children: []
  },
]

// Helper: create or get existing auth user, then upsert Profile
async function upsertAuthUser(email: string, password: string, profileData: {
  full_name: string
  role: 'client' | 'pro' | 'admin'
  preferred_language?: string
  is_verified?: boolean
  phone?: string
  city?: string
}) {
  // Try to find existing auth user
  const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
  const existing = listData?.users?.find(u => u.email === email)

  let authId: string
  if (existing) {
    authId = existing.id
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) throw new Error(`Auth create failed for ${email}: ${error.message}`)
    authId = data.user.id
  }

  // Upsert Profile record with the auth user's UUID
  const profile = await prisma.profile.upsert({
    where: { id: authId },
    update: profileData,
    create: { id: authId, email, ...profileData },
  })

  return profile
}

async function main() {
  console.log('🌱 Seeding database...')

  // Categories
  for (const cat of categories) {
    const { children, ...catData } = cat
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: catData,
      create: catData,
    })
    for (const child of children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: { ...child, parent_id: parent.id },
        create: { ...child, parent_id: parent.id },
      })
    }
  }
  console.log('✅ Categories created')

  // Test users (Supabase Auth + Profile)
  const adminProfile = await upsertAuthUser('admin@proservice.th', 'password123', {
    full_name: 'Admin',
    role: 'admin',
    preferred_language: 'en',
    is_verified: true,
  })

  const clientProfile = await upsertAuthUser('client@test.com', 'password123', {
    full_name: 'Alex Johnson',
    role: 'client',
    preferred_language: 'en',
    is_verified: true,
  })

  await upsertAuthUser('ivan@test.com', 'password123', {
    full_name: 'Иван Петров',
    role: 'client',
    preferred_language: 'ru',
    is_verified: true,
  })

  const proProfile = await upsertAuthUser('pro@test.com', 'password123', {
    full_name: 'Somchai Plumber',
    role: 'pro',
    phone: '+66801234567',
    preferred_language: 'th',
    is_verified: true,
    city: 'Bangkok',
  })

  // Pro profile for pro@test.com
  const proProf = await prisma.proProfile.upsert({
    where: { profile_id: proProfile.id },
    update: {},
    create: {
      profile_id: proProfile.id,
      bio: 'Master plumber with 10 years of experience in Bangkok. Leaks, pipes, fixtures — residential and commercial. Service across all Bangkok districts. Work guaranteed.',
      experience_years: 10,
      hourly_rate: 300,
      service_radius_km: 30,
      city: 'Bangkok',
      verification_status: 'verified',
      rating: 4.8,
      reviews_count: 24,
      completed_jobs: 30,
      whatsapp: '79226885688',
      telegram: '@somchai_plumber',
      line_id: 'somchai_fix',
    }
  })

  const plumbingCat = await prisma.category.findUnique({ where: { slug: 'plumbing' } })
  if (plumbingCat) {
    await prisma.proCategory.upsert({
      where: { pro_id_category_id: { pro_id: proProf.id, category_id: plumbingCat.id } },
      update: {},
      create: {
        pro_id: proProf.id,
        category_id: plumbingCat.id,
        price_from: 200,
        description: 'Plumbing repairs, pipe installation, faucet replacement',
      }
    })
  }

  console.log('✅ Test users created (Supabase Auth + Profiles):')
  console.log('   admin@proservice.th / password123')
  console.log('   client@test.com / password123 (client)')
  console.log('   ivan@test.com / password123 (client, Russian)')
  console.log('   pro@test.com / password123 (pro)')

  // Sample job
  const repairCat = await prisma.category.findUnique({ where: { slug: 'plumbing' } })
  if (repairCat) {
    await prisma.job.upsert({
      where: { id: 'sample-job-001' },
      update: {},
      create: {
        id: 'sample-job-001',
        client_id: clientProfile.id,
        category_id: repairCat.id,
        title: 'Fix leaking pipe under kitchen sink',
        description: 'There is a leaking pipe under my kitchen sink. I need someone to fix it ASAP.',
        original_language: 'en',
        budget_min: 300,
        budget_max: 800,
        location_address: 'Sukhumvit Soi 23, Watthana',
        district: 'Watthana',
        city: 'Bangkok',
        status: 'open',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    }).catch(() => {})
  }

  console.log('✅ Sample data created')
  console.log('\n🚀 Database seeded successfully!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
