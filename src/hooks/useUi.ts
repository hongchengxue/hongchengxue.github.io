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

/** 顶栏滚动显隐：向下滚动（超过阈值）收起，向上滚动弹出 */
export function useNavHidden(threshold = 120): boolean {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const scrollingDown = y > lastY
      lastY = y
      setHidden(scrollingDown && y > threshold)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return hidden
}
