import { useEffect, useState } from 'react'
import { WALINE } from '@/lib/site'

/**
 * 阅读数统计（复现 esyka.top 的技术：Waline 评论系统的 pageview 计数）。
 * - 依赖一个 Waline 服务端（serverURL 配置见 src/lib/site.ts）
 * - 未配置 serverURL 时不渲染任何内容，不影响页面
 * - 部署指南见 README「阅读数统计」
 */
export function PageViews({ path }: { path: string }) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const server = WALINE.serverURL
    if (!server) return
    let cancelled = false

    // 1) 记录本次访问（+1）
    fetch(`${server}/article`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, type: 'pageview', action: 'inc' }),
    })
      .catch(() => {})
      .finally(() => {
        // 2) 读取最新计数
        fetch(`${server}/article?path=${encodeURIComponent(path)}&type=pageview`)
          .then((r) => r.json())
          .then((data) => {
            if (!cancelled && typeof data === 'object' && data !== null) {
              const n = Number((data as { count?: number }).count ?? 0)
              if (n > 0) setCount(n)
            }
          })
          .catch(() => {})
      })

    return () => {
      cancelled = true
    }
  }, [path])

  if (count === null) return null
  return <span className="page-views" title="阅读数">👁 {count}</span>
}
