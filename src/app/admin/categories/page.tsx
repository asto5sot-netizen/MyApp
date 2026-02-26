'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLang } from '@/hooks/useLang'

interface SubCategory {
  id: string
  name_en: string
  name_ru: string
  name_th: string
  slug: string
  is_active: boolean
  sort_order: number
  icon_url?: string
}

interface Category extends SubCategory {
  children: SubCategory[]
}

function getName(cat: SubCategory, lang: string) {
  if (lang === 'ru') return cat.name_ru || cat.name_en
  if (lang === 'th') return cat.name_th || cat.name_en
  return cat.name_en
}

export default function AdminCategoriesPage() {
  const lang = useLang()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Add subcategory form state
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newSub, setNewSub] = useState({ name_en: '', name_ru: '', name_th: '', slug: '' })
  const [addError, setAddError] = useState('')
  const [addingLoading, setAddingLoading] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name_en: '', name_ru: '', name_th: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.success) setCategories(data.data.categories)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    load()
  }

  const startEdit = (cat: SubCategory) => {
    setEditingId(cat.id)
    setEditForm({ name_en: cat.name_en, name_ru: cat.name_ru, name_th: cat.name_th })
    setEditError('')
  }

  const saveEdit = async (id: string) => {
    setEditLoading(true)
    setEditError('')
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!data.success) { setEditError(data.error || 'Error'); return }
      setEditingId(null)
      load()
    } finally {
      setEditLoading(false)
    }
  }

  const addSubcategory = async (parentId: string) => {
    setAddingLoading(true)
    setAddError('')
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSub, parent_id: parentId }),
      })
      const data = await res.json()
      if (!data.success) { setAddError(data.error || 'Error'); return }
      setAddingTo(null)
      setNewSub({ name_en: '', name_ru: '', name_th: '', slug: '' })
      load()
    } finally {
      setAddingLoading(false)
    }
  }

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!data.success) alert(data.error || 'Error deleting')
    else load()
  }

  if (loading) return (
    <div className="p-8 text-gray-400">Loading categories...</div>
  )

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <p className="text-gray-400 text-sm mt-1">Manage subcategories in the Masters menu — toggle visibility, rename, or add new ones.</p>
      </div>

      <div className="space-y-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {/* Parent category header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                {cat.icon_url && <span className="text-xl">{cat.icon_url}</span>}
                <div>
                  <span className="font-semibold text-white">{getName(cat, lang)}</span>
                </div>
              </div>
              <span className="text-xs text-gray-500 font-mono">{cat.slug}</span>
            </div>

            {/* Subcategories */}
            <div className="divide-y divide-gray-800/60">
              {cat.children.length === 0 && (
                <div className="px-5 py-3 text-gray-600 text-sm italic">No subcategories</div>
              )}
              {cat.children.map(sub => (
                <div key={sub.id} className="px-5 py-3">
                  {editingId === sub.id ? (
                    /* Edit form */
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        {(['name_en', 'name_ru', 'name_th'] as const).map(field => (
                          <input
                            key={field}
                            type="text"
                            value={editForm[field]}
                            onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                            placeholder={field === 'name_en' ? 'English' : field === 'name_ru' ? 'Russian' : 'Thai'}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        ))}
                      </div>
                      {editError && <p className="text-red-400 text-xs">{editError}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(sub.id)} disabled={editLoading}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {editLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 bg-gray-700 text-gray-300 text-xs rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal row */
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Active toggle */}
                        <button
                          onClick={() => toggleActive(sub.id, sub.is_active)}
                          className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${sub.is_active ? 'bg-green-500' : 'bg-gray-600'}`}
                          title={sub.is_active ? 'Active — click to hide' : 'Hidden — click to show'}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${sub.is_active ? 'translate-x-4' : ''}`} />
                        </button>

                        <div className="min-w-0">
                          <span className={`text-sm font-medium ${sub.is_active ? 'text-white' : 'text-gray-500 line-through'}`}>
                            {getName(sub, lang)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 font-mono flex-shrink-0">{sub.slug}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <button onClick={() => startEdit(sub)}
                          className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                        >
                          Rename
                        </button>
                        <button onClick={() => deleteCategory(sub.id, sub.name_en)}
                          className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add subcategory row */}
              {addingTo === cat.id ? (
                <div className="px-5 py-4 bg-gray-800/40">
                  <p className="text-xs text-gray-400 mb-2 font-medium">New subcategory in {cat.name_en}</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={newSub.name_en}
                      onChange={e => setNewSub(f => ({ ...f, name_en: e.target.value }))}
                      placeholder="English name"
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={newSub.slug}
                      onChange={e => setNewSub(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                      placeholder="slug (latin, hyphens)"
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={newSub.name_ru}
                      onChange={e => setNewSub(f => ({ ...f, name_ru: e.target.value }))}
                      placeholder="Russian name"
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={newSub.name_th}
                      onChange={e => setNewSub(f => ({ ...f, name_th: e.target.value }))}
                      placeholder="Thai name"
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {addError && <p className="text-red-400 text-xs mb-2">{addError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => addSubcategory(cat.id)}
                      disabled={addingLoading || !newSub.name_en || !newSub.slug}
                      className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {addingLoading ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      onClick={() => { setAddingTo(null); setAddError(''); setNewSub({ name_en: '', name_ru: '', name_th: '', slug: '' }) }}
                      className="px-3 py-1.5 bg-gray-700 text-gray-300 text-xs rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-2">
                  <button
                    onClick={() => { setAddingTo(cat.id); setAddError(''); setNewSub({ name_en: '', name_ru: '', name_th: '', slug: '' }) }}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 py-1"
                  >
                    <span className="text-base leading-none">+</span> Add subcategory
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
