'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { THAI_CITIES, REGION_LABELS } from '@/lib/cities'
import { toast } from '@/lib/toast'

const regions = ['central', 'north', 'south', 'northeast'] as const

interface Category { id: string; name_en: string; name_ru: string; name_th: string; parent_id?: string }
interface ProProfile {
  bio?: string; experience_years: number; hourly_rate?: number
  service_radius_km: number; city: string; is_available: boolean
  whatsapp?: string; telegram?: string; line_id?: string
  facebook?: string; instagram?: string; tiktok?: string; youtube?: string; website?: string
  categories?: Array<{ category: Category }>
}
interface User {
  id: string; email: string; role: string; full_name: string
  phone?: string; avatar_url?: string; preferred_language: string; city?: string
  pro_profile?: ProProfile
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; caption?: string }>>([])
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    full_name: '', phone: '', city: 'Bangkok', preferred_language: 'en' as 'en' | 'th' | 'ru',
    avatar_url: '',
  })
  const [proForm, setProForm] = useState({
    bio: '', experience_years: 0, hourly_rate: '', service_radius_km: 20, is_available: true,
  })
  const [socialForm, setSocialForm] = useState({
    whatsapp: '', telegram: '', line_id: '',
    facebook: '', instagram: '', tiktok: '', youtube: '', website: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/profile/me').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/photos').then(r => r.json()).catch(() => null),
    ]).then(([d, catData, photoData]) => {
      if (!d.success) { router.push('/auth/login'); return }
      const u: User = d.data.user
      setUser(u)
      setForm({
        full_name: u.full_name || '',
        phone: u.phone || '',
        city: u.city || u.pro_profile?.city || 'Bangkok',
        preferred_language: (u.preferred_language as 'en' | 'th' | 'ru') || 'en',
        avatar_url: u.avatar_url || '',
      })
      if (u.pro_profile) {
        const p = u.pro_profile
        setProForm({
          bio: p.bio || '',
          experience_years: p.experience_years || 0,
          hourly_rate: p.hourly_rate ? String(p.hourly_rate) : '',
          service_radius_km: p.service_radius_km || 20,
          is_available: p.is_available ?? true,
        })
        setSocialForm({
          whatsapp: p.whatsapp || '',
          telegram: p.telegram || '',
          line_id: p.line_id || '',
          facebook: p.facebook || '',
          instagram: p.instagram || '',
          tiktok: p.tiktok || '',
          youtube: p.youtube || '',
          website: p.website || '',
        })
        if (p.categories) {
          setSelectedCategoryIds(p.categories.map((c: { category: Category }) => c.category.id))
        }
      }
      if (photoData?.success) setPhotos(photoData.data.photos)
      // Flatten categories
      if (catData.data?.categories) {
        const flat: Category[] = []
        catData.data.categories.forEach((cat: Category & { children?: Category[] }) => {
          flat.push(cat)
          ;(cat as { children?: Category[] }).children?.forEach((child: Category) => flat.push(child))
        })
        setAllCategories(flat)
      }
    }).finally(() => setLoading(false))
  }, [router])

  const uploadAvatar = async (file: File) => {
    setAvatarUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.success) { toast.error('Upload failed: ' + data.error); return }
      const url = data.data.url
      setForm(f => ({ ...f, avatar_url: url }))
      // Save immediately
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: url }),
      })
      toast.success('Photo updated!')
    } catch {
      toast.error('Upload failed')
    } finally {
      setAvatarUploading(false)
    }
  }

  const uploadPhoto = async (file: File) => {
    if (photos.length >= 12) { toast.error('Maximum 12 photos allowed'); return }
    setPhotoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.success) { toast.error('Upload failed: ' + data.error); return }
      const addRes = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.data.url }),
      })
      const addData = await addRes.json()
      if (addData.success) {
        setPhotos(prev => [...prev, addData.data.photo])
        toast.success('Photo added!')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setPhotoUploading(false)
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }

  const deletePhoto = async (photoId: string) => {
    const res = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      toast.success('Photo removed')
    } else {
      toast.error(data.error || 'Failed to remove photo')
    }
  }

  const save = async () => {
    setSaving(true); setError('')
    const body: Record<string, unknown> = {
      ...form,
      ...(user?.role === 'pro' ? {
        ...proForm,
        hourly_rate: proForm.hourly_rate ? Number(proForm.hourly_rate) : undefined,
        category_ids: selectedCategoryIds,
        ...socialForm,
      } : {})
    }
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Error saving'); return }
      toast.success('Changes saved!')
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
    </div>
  )

  const isPro = user?.role === 'pro'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-6">
          <Link href={isPro ? '/dashboard/pro' : '/dashboard/client'} className="text-blue-600 text-sm hover:underline">
            ← Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900">Profile Settings</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
        )}

        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">📷 Profile Photo</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              {form.avatar_url
                ? <img src={form.avatar_url} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-gray-100" />
                : <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl border-2 border-gray-100">
                    {user?.full_name?.[0] || '?'}
                  </div>
              }
              {avatarUploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {avatarUploading ? 'Uploading...' : 'Change photo'}
              </button>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP, max 10 MB</p>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f) }}
              />
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">👤 Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} placeholder="+66 80 000 0000"
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📍 City in Thailand</label>
              <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
              >
                {regions.map(region => (
                  <optgroup key={region} label={REGION_LABELS[region]}>
                    {THAI_CITIES.filter(c => c.region === region).map(city => (
                      <option key={city.value} value={city.value}>{city.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interface Language</label>
              <select value={form.preferred_language}
                onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value as 'en' | 'th' | 'ru' }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
              >
                <option value="en">🇬🇧 English</option>
                <option value="th">🇹🇭 ภาษาไทย</option>
                <option value="ru">🇷🇺 Русский</option>
              </select>
            </div>
            <div className="pt-1 text-xs text-gray-400">
              Email: <span className="text-gray-600">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Social media (pro only) */}
        {isPro && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
            <h2 className="font-bold text-gray-900 mb-1">📲 Contacts & Social Media</h2>
            <p className="text-xs text-gray-400 mb-4">Displayed on your profile page for clients</p>
            <div className="space-y-3">
              {[
                { key: 'whatsapp', label: '💬 WhatsApp', placeholder: '79226885688', hint: 'Digits only, no + or spaces' },
                { key: 'telegram', label: '✈️ Telegram', placeholder: '@username', hint: '@username or t.me/... link' },
                { key: 'line_id', label: '🟢 LINE ID', placeholder: 'your_line_id', hint: 'Your LINE ID' },
                { key: 'instagram', label: '📸 Instagram', placeholder: 'https://instagram.com/username', hint: '' },
                { key: 'facebook', label: '👤 Facebook', placeholder: 'https://facebook.com/page', hint: '' },
                { key: 'tiktok', label: '🎵 TikTok', placeholder: 'https://tiktok.com/@username', hint: '' },
                { key: 'youtube', label: '▶️ YouTube', placeholder: 'https://youtube.com/@channel', hint: '' },
                { key: 'website', label: '🌐 Website', placeholder: 'https://example.com', hint: '' },
              ].map(({ key, label, placeholder, hint }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text"
                    value={socialForm[key as keyof typeof socialForm]}
                    placeholder={placeholder}
                    onChange={e => setSocialForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                  />
                  {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pro settings */}
        {isPro && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
            <h2 className="font-bold text-gray-900 mb-4">🔧 Professional Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">About me (bio)</label>
                <textarea rows={4} value={proForm.bio}
                  onChange={e => setProForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell clients about your experience, specialization and guarantees..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                  <input type="number" min={0} max={50} value={proForm.experience_years}
                    onChange={e => setProForm(f => ({ ...f, experience_years: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate (฿/hr)</label>
                  <input type="number" min={0} value={proForm.hourly_rate} placeholder="300"
                    onChange={e => setProForm(f => ({ ...f, hourly_rate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service radius (km)</label>
                <input type="number" min={1} max={200} value={proForm.service_radius_km}
                  onChange={e => setProForm(f => ({ ...f, service_radius_km: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                />
              </div>
              <div className="flex items-center gap-3">
                <button type="button"
                  onClick={() => setProForm(f => ({ ...f, is_available: !f.is_available }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${proForm.is_available ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${proForm.is_available ? 'translate-x-5' : ''}`} />
                </button>
                <span className={`text-sm font-medium ${proForm.is_available ? 'text-green-600' : 'text-gray-400'}`}>
                  {proForm.is_available ? '● Available for orders' : '● Temporarily unavailable'}
                </span>
              </div>

              {/* Categories */}
              {allCategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    My service categories
                    <span className="text-gray-400 font-normal ml-1">({selectedCategoryIds.length} selected)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                    {allCategories.map(cat => {
                      const selected = selectedCategoryIds.includes(cat.id)
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategoryIds(ids =>
                            selected ? ids.filter(id => id !== cat.id) : [...ids, cat.id]
                          )}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            selected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {cat.name_en}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Portfolio photos (pro only) */}
        {isPro && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900">🖼️ Portfolio Photos</h2>
                <p className="text-xs text-gray-400 mt-0.5">{photos.length}/12 photos uploaded</p>
              </div>
              {photos.length < 12 && (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={photoUploading}
                  className="border border-blue-200 text-blue-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {photoUploading ? 'Uploading...' : '+ Add photo'}
                </button>
              )}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f) }}
              />
            </div>
            {photos.length === 0 ? (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={photoUploading}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 text-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
              >
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm font-medium">Upload portfolio photos</p>
                <p className="text-xs mt-1">Show your work to clients</p>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {photos.map(photo => (
                  <div key={photo.id} className="relative group aspect-square">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Portfolio photo'}
                      className="w-full h-full object-cover rounded-xl border border-gray-100"
                    />
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-700"
                      title="Remove photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {photos.length < 12 && (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={photoUploading}
                    className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
                  >
                    {photoUploading ? (
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-2xl">+</span>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <button onClick={save} disabled={saving}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

      </div>
    </div>
  )
}
