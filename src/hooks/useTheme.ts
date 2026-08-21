import { useContext } from 'react'
import { ThemeContext, type ThemeContextValue } from '@/contexts/theme-context'

/** 主题 hook（必须在 <ThemeProvider> 内使用） */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme 必须在 <ThemeProvider> 内使用')
  return ctx
}
