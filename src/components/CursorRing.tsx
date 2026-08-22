import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * MiMo 光圈自定义光标：
 * - 外环 + 中心点跟随鼠标，requestAnimationFrame 缓动（lerp 0.2）
 * - 悬停链接/按钮/输入框等可交互元素时放大（24px → 56px）
 * - 鼠标移出窗口隐藏、移入恢复
 * - 触屏设备（pointer: coarse）不启用，保留原生交互
 * - 写作页（Vditor 编辑器）禁用：编辑场景保留原生光标与文本插入符
 */
export function CursorRing() {
  const { pathname } = useLocation()
  const ringRef = useRef<HTMLDivElement>(null)
  const disabled = pathname.startsWith('/write')

  useEffect(() => {
    const ring = ringRef.current
    if (!ring || disabled) return
    // 触屏设备不启用
    if (window.matchMedia('(pointer: coarse)').matches) return

    // 隐藏原生光标（写作台等编辑场景仍保留文本插入符）
    document.documentElement.classList.add('cursor-custom')

    let mouseX = 0
    let mouseY = 0
    let curX = 0
    let curY = 0
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const update = () => {
      curX += (mouseX - curX) * 0.2
      curY += (mouseY - curY) * 0.2
      ring.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(update)
    }

    // 悬停可交互元素 → 放大光圈
    const INTERACTIVE = 'a, button, input, textarea, select, summary, [contenteditable="true"], .nav-inner'
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // iframe（如 Giscus 评论）内部事件无法穿透：进入 iframe 区域时隐藏光圈，
      // 避免光圈残影停在评论区
      if (target instanceof HTMLIFrameElement) {
        ring.style.opacity = '0'
        return
      }
      ring.style.opacity = '1'
      if (target.closest?.(INTERACTIVE)) ring.classList.add('cursor-hover')
      else ring.classList.remove('cursor-hover')
    }

    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target instanceof HTMLIFrameElement) ring.style.opacity = '1'
    }

    const onLeaveDoc = () => {
      ring.style.opacity = '0'
    }
    const onEnterDoc = () => {
      ring.style.opacity = '1'
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    document.documentElement.addEventListener('mouseleave', onLeaveDoc)
    document.documentElement.addEventListener('mouseenter', onEnterDoc)
    raf = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.documentElement.removeEventListener('mouseleave', onLeaveDoc)
      document.documentElement.removeEventListener('mouseenter', onEnterDoc)
      document.documentElement.classList.remove('cursor-custom')
    }
  }, [disabled])

  if (disabled) return null
  return <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
}
