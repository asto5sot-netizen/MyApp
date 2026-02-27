'use client'
import Link from 'next/link'
import type { Language } from '@/types/profile'

const FEATURED_CATS = [
  { slug: 'repair', name: { en: 'Repair & Home', ru: 'Ремонт', th: 'ซ่อมแซม' }, tags: { en: ['Plumbing', 'Electrical', 'Construction'], ru: ['Сантехника', 'Электрика', 'Стройка'], th: ['ประปา', 'ไฟฟ้า', 'ก่อสร้าง'] }, bg: 'bg-blue-50', border: 'border-blue-200', accent: 'text-blue-600', tagBg: 'bg-blue-100/70 text-blue-700', watermark: '🔧' },
  { slug: 'beauty', name: { en: 'Beauty & Care', ru: 'Красота и уход', th: 'ความงาม' }, tags: { en: ['Hair', 'Nails', 'Massage'], ru: ['Волосы', 'Ногти', 'Массаж'], th: ['ผม', 'เล็บ', 'นวด'] }, bg: 'bg-pink-50', border: 'border-pink-200', accent: 'text-pink-600', tagBg: 'bg-pink-100/70 text-pink-700', watermark: '💅' },
  { slug: 'auto', name: { en: 'Auto & Moto Service', ru: 'Авто / Мотосервис', th: 'ศูนย์บริการรถยนต์ / มอเตอร์ไซค์' }, tags: { en: ['Auto Service', 'Moto Service'], ru: ['Автосервис', 'Мотосервис'], th: ['ศูนย์บริการรถยนต์', 'ศูนย์บริการมอเตอร์ไซค์'] }, bg: 'bg-orange-50', border: 'border-orange-200', accent: 'text-orange-600', tagBg: 'bg-orange-100/70 text-orange-700', watermark: '🚗' },
  { slug: 'digital', name: { en: 'Digital & IT', ru: 'Диджитал и IT', th: 'ดิจิทัลและไอที' }, tags: { en: ['Phone Repair', 'Web Dev', 'Design', 'Tech Setup'], ru: ['Ремонт сотовых', 'Сайты', 'Дизайн', 'Настройка техники'], th: ['ซ่อมโทรศัพท์', 'เว็บไซต์', 'ออกแบบ', 'ตั้งค่า'] }, bg: 'bg-violet-50', border: 'border-violet-200', accent: 'text-violet-600', tagBg: 'bg-violet-100/70 text-violet-700', watermark: '💻' },
] as const

export function HomeFeaturedCats({ lang }: { lang: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {FEATURED_CATS.map(cat => {
        const l = (lang as Language) in cat.name ? (lang as Language) : 'en'
        const name = cat.name[l]
        const tags = cat.tags[l]
        return (
          <Link key={cat.slug} href={`/masters/${cat.slug}`} className={`group relative overflow-hidden rounded-2xl border ${cat.bg} ${cat.border} p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
            <span className="absolute -right-2 -bottom-2 text-[48px] opacity-[0.08] select-none pointer-events-none leading-none">{cat.watermark}</span>
            <div className={`w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-base mb-3 border ${cat.border}`}>{cat.watermark}</div>
            <h3 className={`text-sm font-extrabold ${cat.accent} mb-1.5`}>{name}</h3>
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 2).map(tag => (
                <span key={tag} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cat.tagBg}`}>{tag}</span>
              ))}
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-bold ${cat.accent} group-hover:gap-2 transition-all duration-150`}>
              {lang === 'ru' ? 'Смотреть' : lang === 'th' ? 'ดูเพิ่มเติม' : 'Browse'} →
            </span>
          </Link>
        )
      })}
    </div>
  )
}
