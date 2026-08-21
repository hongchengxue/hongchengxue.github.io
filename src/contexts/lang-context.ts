import { createContext } from 'react'
import type { I18nKey, Lang } from '@/lib/i18n'

export interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  /** 翻译：t('home') / t('searchStats', { n: 3 }) */
  t: (key: I18nKey, vars?: Record<string, string | number>) => string
}

/** 语言 Context 对象（Provider 见 LangContext.tsx，hook 见 src/hooks/useLang.ts） */
export const LangContext = createContext<LangContextValue | null>(null)
