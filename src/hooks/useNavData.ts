'use client'

import { useState, useEffect } from 'react'
import type { NavCategory, NavUser } from '@/types/navigation'

// Module-level cache — survives re-renders, reset on full page reload
let cachedCategories: NavCategory[] | null = null

export function useNavData() {
  const [user, setUser] = useState<NavUser | null>(null)
  const [categories, setCategories] = useState<NavCategory[]>(cachedCategories ?? [])

  useEffect(() => {
    fetch('/api/profile/me')
      .then(r => r.json())
      .then(d => { if (d.success) setUser(d.data.user) })
      .catch(() => {})

    if (!cachedCategories) {
      fetch('/api/categories')
        .then(r => r.json())
        .then(d => {
          const cats: NavCategory[] = d.data?.categories ?? []
          cachedCategories = cats
          setCategories(cats)
        })
        .catch(() => {})
    }
  }, [])

  return { user, setUser, categories }
}
