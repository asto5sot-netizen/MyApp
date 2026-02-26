'use client'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import ruCommon from './locales/ru/common.json'
import thCommon from './locales/th/common.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      ru: { common: ruCommon },
      th: { common: thCommon },
    },
    defaultNS: 'common',
    fallbackLng: 'en',
    lng: 'en', // always start with 'en' to match SSR — client switches after mount
    interpolation: { escapeValue: false },
  })

export default i18n
