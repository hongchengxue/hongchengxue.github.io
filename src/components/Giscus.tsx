import { useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { useLang } from '@/hooks/useLang'
import { GISCUS } from '@/lib/site'

/**
 * Giscus 评论：按 pathname 映射讨论。
 * 主题/语言变化时重建 iframe；路由切换时随组件卸载自动清理。
 */
export function Giscus() {
  const { theme } = useTheme()
  const { lang } = useLang()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-repo', GISCUS.repo)
    script.setAttribute('data-repo-id', GISCUS.repoId)
    script.setAttribute('data-category', GISCUS.category)
    script.setAttribute('data-category-id', GISCUS.categoryId)
    script.setAttribute('data-mapping', GISCUS.mapping)
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-lang', lang === 'zh' ? 'zh-CN' : 'en')
    script.setAttribute('data-theme', theme)
    script.setAttribute('data-loading', 'lazy')
    el.appendChild(script)
    return () => {
      el.innerHTML = ''
    }
  }, [theme, lang])

  return <div className="giscus" ref={ref} />
}
