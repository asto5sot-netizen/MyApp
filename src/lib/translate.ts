/**
 * Helpers for programmatic Google Translate widget control.
 *
 * Google Translate is loaded globally in layout.tsx and uses a hidden
 * <select class="goog-te-combo"> to switch languages. We manipulate that
 * element directly so the entire DOM (including dynamic React content) gets
 * translated without a full page reload.
 *
 * The `googtrans` cookie (/en/<lang>) persists the chosen language across
 * Next.js client-side navigations. Clearing the cookie + reloading is the
 * only reliable way to restore the original English text.
 */

/** Read the currently active language from the googtrans cookie or localStorage. */
export function getCurrentLang(): string {
  if (typeof document === 'undefined') return 'en'
  const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/)
  return match ? match[1] : (localStorage.getItem('lang') || 'en')
}

/** Switch the site language via Google Translate. */
export function triggerGoogleTranslate(lang: string): void {
  if (lang === 'en') {
    // Remove the googtrans cookie on both the root path and the domain
    document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = `googtrans=; path=/; domain=${location.hostname}; expires=Thu, 01 Jan 1970 00:00:01 GMT`
    // Notify reactive hooks before reloading
    window.dispatchEvent(new Event('langchange'))
    // A reload is required because Google Translate has no "undo" API
    window.location.reload()
    return
  }

  // Set cookie so the language persists on next navigation
  document.cookie = `googtrans=/en/${lang}; path=/`
  document.cookie = `googtrans=/en/${lang}; path=/; domain=${location.hostname}`

  // Notify reactive hooks immediately (before DOM translation)
  window.dispatchEvent(new Event('langchange'))

  // Trigger translation via the widget's hidden <select>
  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null
  if (select) {
    select.value = lang
    select.dispatchEvent(new Event('change'))
  } else {
    // Widget not initialised yet — reload so the cookie is applied on startup
    window.location.reload()
  }
}
