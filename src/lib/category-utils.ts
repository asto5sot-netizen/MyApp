interface CategoryBase {
  name_en: string
  name_ru: string
  name_th: string
}

interface CategoryWithChildren extends CategoryBase {
  id: string
  children?: CategoryWithChildren[]
}

export function getCategoryName(cat: CategoryBase, lang: string): string {
  if (lang === 'ru') return cat.name_ru || cat.name_en
  if (lang === 'th') return cat.name_th || cat.name_en
  return cat.name_en
}

export function flattenCategories<T extends CategoryWithChildren>(categories: T[]): T[] {
  const result: T[] = []
  for (const cat of categories) {
    result.push(cat)
    if (cat.children?.length) {
      result.push(...flattenCategories(cat.children as T[]))
    }
  }
  return result
}
