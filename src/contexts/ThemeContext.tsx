import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext, type Theme } from '@/contexts/theme-context'
import { getStorage, setStorage, STORAGE_KEYS } from '@/lib/storage'

/** 初始主题：本地保存值优先，否则跟随系统（index.html 内联脚本已先行设置，避免闪烁） */
function initialTheme(): Theme {
  const saved = getStorage(STORAGE_KEYS.theme)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** 主题 Provider：data-theme 属性 + localStorage（hxc:theme） */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      setStorage(STORAGE_KEYS.theme, next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
