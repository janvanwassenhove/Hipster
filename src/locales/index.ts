import { createI18n } from 'vue-i18n'
import type { Language } from '@/types'

import en from './en'
import nl from './nl'
import fr from './fr'
import de from './de'

const messages = {
  en,
  nl,
  fr,
  de
}

// Detect browser language or fallback to English
function getDefaultLocale(): Language {
  const browserLang = navigator.language.slice(0, 2) as Language
  return Object.keys(messages).includes(browserLang) ? browserLang : 'en'
}

// Get saved language from localStorage or use default
function getSavedLocale(): Language {
  const saved = localStorage.getItem('hitster-language') as Language
  return saved && Object.keys(messages).includes(saved) ? saved : getDefaultLocale()
}

export const i18n = createI18n({
  locale: getSavedLocale(),
  fallbackLocale: 'en',
  messages,
  legacy: false,
  globalInjection: true
})

export function setLanguage(lang: Language) {
  i18n.global.locale.value = lang
  localStorage.setItem('hitster-language', lang)
  document.documentElement.lang = lang
}

export type { Language }
