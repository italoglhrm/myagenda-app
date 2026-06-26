import { createContext, useContext, useState, useEffect } from 'react'
import { translations, type Lang, type TranslationKey } from '../lib/i18n'

interface LanguageContextValue {
  lang: Lang
  toggle: () => void
  t: (key: TranslationKey) => string
}

export const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  toggle: () => {},
  t: (key) => translations.en[key] as string,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('lang') as Lang) ?? 'en'
  })

  useEffect(() => {
    localStorage.setItem('lang', lang)
  }, [lang])

  function toggle() {
    setLang((l) => (l === 'en' ? 'pt' : 'en'))
  }

  function t(key: TranslationKey): string {
    const val = translations[lang][key]
    // arrays (months/weekDays) should not be used via t() — access directly
    return Array.isArray(val) ? '' : (val as string)
  }

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
