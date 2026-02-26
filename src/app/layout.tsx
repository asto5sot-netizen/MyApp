import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/components/Providers'
import { PageTracker } from '@/components/PageTracker'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'ProService — Find Trusted Professionals in Thailand',
  description: 'Marketplace for services in Thailand. Post a job, get proposals from verified professionals. Available in Thai, English, and Russian.',
  keywords: 'services Thailand, handyman Thailand, freelance Thailand, мастера Таиланд, ช่างไทย',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {/* Hidden Google Translate widget container */}
        <div id="google_translate_element" style={{ display: 'none' }} />
        <Providers>
          <PageTracker />
          {children}
        </Providers>

        {/* Google Translate initializer — runs after page is interactive */}
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,ru,th',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            `,
          }}
        />
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
