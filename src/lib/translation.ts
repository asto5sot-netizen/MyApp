const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY
const SUPPORTED_LANGUAGES = ['en', 'th', 'ru']

export interface TranslationMap {
  en?: string
  th?: string
  ru?: string
  [key: string]: string | undefined
}

export async function detectLanguage(text: string): Promise<string> {
  if (!GOOGLE_TRANSLATE_API_KEY) return 'en'

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2/detect?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text }),
      }
    )
    const data = await response.json()
    return data.data?.detections?.[0]?.[0]?.language || 'en'
  } catch {
    return 'en'
  }
}

export async function translateText(text: string, targetLang: string, sourceLang?: string): Promise<string> {
  if (!GOOGLE_TRANSLATE_API_KEY) return text
  if (sourceLang === targetLang) return text

  try {
    const params = new URLSearchParams({
      q: text,
      target: targetLang,
      key: GOOGLE_TRANSLATE_API_KEY,
      format: 'text',
    })
    if (sourceLang) params.append('source', sourceLang)

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?${params}`,
      { method: 'POST' }
    )
    const data = await response.json()
    return data.data?.translations?.[0]?.translatedText || text
  } catch {
    return text
  }
}

export async function translateToAllLanguages(
  text: string,
  sourceLang: string
): Promise<TranslationMap> {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    return { [sourceLang]: text }
  }

  const translations: TranslationMap = { [sourceLang]: text }

  const targets = SUPPORTED_LANGUAGES.filter(lang => lang !== sourceLang)
  await Promise.all(
    targets.map(async (lang) => {
      translations[lang] = await translateText(text, lang, sourceLang)
    })
  )

  return translations
}

export function getTranslation(
  translationMap: TranslationMap | null | undefined,
  original: string,
  userLang: string
): string {
  if (!translationMap) return original
  return translationMap[userLang] || translationMap['en'] || original
}

/**
 * Detects language and translates text to all supported languages in one call.
 * Replaces the common 2-line pattern:
 *   const originalLanguage = await detectLanguage(text)
 *   const translated = await translateToAllLanguages(text, originalLanguage)
 */
export async function translateContent(text: string): Promise<{
  originalLanguage: string
  translated: TranslationMap
}> {
  const originalLanguage = await detectLanguage(text)
  const translated = await translateToAllLanguages(text, originalLanguage)
  return { originalLanguage, translated }
}
