import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE } from '@/lib/site'

/** 路由切换后回到页顶 */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/** 设置页面标题（默认站点名） */
export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE.title}` : SITE.title
  }, [title])
}

/** 导航栏是否进入固定态（滚动超过阈值） */
export function useNavFixed(threshold = 10): boolean {
  const [fixed, setFixed] = useState(false)
  useEffect(() => {
    const onScroll = () => setFixed(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return fixed
}
