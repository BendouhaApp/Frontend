import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import fr from './locales/fr.json'
import ar from './locales/ar.json'

// Language configuration
export const languages = [
  { code: 'fr', name: 'Francais', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', dir: 'rtl' },
] as const

export type LanguageCode = (typeof languages)[number]['code']

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
    },
    lng: 'fr', // Default language
    fallbackLng: 'fr',
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

// Helper function to get current language direction
export function getLanguageDir(lang?: string): 'ltr' | 'rtl' {
  const currentLang = lang || i18n.language
  const langConfig = languages.find((l) => l.code === currentLang)
  return langConfig?.dir || 'ltr'
}

// Helper function to change language and update document direction
export function changeLanguage(lang: LanguageCode) {
  i18n.changeLanguage(lang)
  const dir = getLanguageDir(lang)
  document.documentElement.setAttribute('dir', dir)
  document.documentElement.setAttribute('lang', lang)
}

export default i18n
