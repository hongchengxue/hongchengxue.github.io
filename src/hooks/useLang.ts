import { useContext } from 'react'
import { LangContext, type LangContextValue } from '@/contexts/lang-context'

/** 语言与翻译 hook（必须在 <LangProvider> 内使用） */
export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang 必须在 <LangProvider> 内使用')
  return ctx
}
