import { createContext } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

/** 主题 Context 对象（Provider 见 ThemeContext.tsx，hook 见 src/hooks/useTheme.ts） */
export const ThemeContext = createContext<ThemeContextValue | null>(null)
