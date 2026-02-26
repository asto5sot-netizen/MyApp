'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { NavCategory } from '@/types/navigation'

interface Props {
  label: string
  categories: NavCategory[]
  getHref: (slug: string) => string
  getCatName: (cat: NavCategory) => string
}

const ChevronIcon = memo(function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
})

interface CategoryGroupProps {
  cat: NavCategory
  getHref: (slug: string) => string
  getCatName: (cat: NavCategory) => string
  onClose: () => void
}

const CategoryGroup = memo(function CategoryGroup({ cat, getHref, getCatName, onClose }: CategoryGroupProps) {
  return (
    <div>
      <Link
        href={getHref(cat.slug)}
        onClick={onClose}
        className="flex items-center gap-2 font-semibold text-gray-800 text-sm hover:text-blue-600 mb-2"
      >
        {cat.icon_url && <span>{cat.icon_url}</span>}
        {getCatName(cat)}
      </Link>
      {cat.children?.map(child => (
        <Link
          key={child.id}
          href={getHref(child.slug)}
          onClick={onClose}
          className="block text-xs text-gray-500 hover:text-blue-600 py-0.5 pl-2"
        >
          {getCatName(child)}
        </Link>
      ))}
    </div>
  )
})

export const CategoryDropdown = memo(function CategoryDropdown({ label, categories, getHref, getCatName }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
      >
        {label}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-[640px] bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50 grid grid-cols-3 gap-4">
          {categories.length === 0 ? (
            // Skeleton while API fetch is in-flight
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))
          ) : (
            categories.map(cat => (
              <CategoryGroup key={cat.id} cat={cat} getHref={getHref} getCatName={getCatName} onClose={close} />
            ))
          )}
        </div>
      )}
    </div>
  )
})
