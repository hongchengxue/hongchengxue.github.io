import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { LangContext } from '@/contexts/lang-context'
import { translate, type I18nKey, type Lang } from '@/lib/i18n'
import { getStorage, setStorage, STORAGE_KEYS } from '@/lib/storage'

/** 语言 Provider：语言偏好持久化到 localStorage（site-lang，沿用旧站键名） */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    getStorage(STORAGE_KEYS.lang) === 'en' ? 'en' : 'zh',
  )

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setStorage(STORAGE_KEYS.lang, l)
    setLangState(l)
  }, [])

  const t = useCallback(
    (key: I18nKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}
