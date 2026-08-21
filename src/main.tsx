import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import { LangProvider } from '@/contexts/LangContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import '@/styles/global.css'

// GitHub Pages SPA 回退：public/404.html 会把原始路径暂存到 sessionStorage 后跳转首页，
// 这里在渲染前恢复路径，保证深链接（如直接访问某篇文章）可用。
const redirect = sessionStorage.getItem('redirect')
if (redirect) {
  sessionStorage.removeItem('redirect')
  window.history.replaceState(null, '', redirect)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </LangProvider>
  </StrictMode>,
)
