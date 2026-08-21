import { posts } from '@/lib/posts'
import type { Post } from '@/types/post'

/**
 * 站内搜索：运行时从文章数据构建索引（替代旧站 hexo-generator-search 生成的 search.xml）。
 * 索引构建为一次性成本，用 requestIdleCallback 延迟到浏览器空闲时执行（js-request-idle-callback）。
 */

interface SearchEntry {
  post: Post
  title: string
  /** 纯文本正文（去除 Markdown 语法） */
  text: string
  categories: string[]
}

function toPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/[*_>~\-|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const entries: SearchEntry[] = posts.map((post) => ({
  post,
  title: post.meta.title,
  text: toPlainText(post.raw),
  categories: post.meta.categories.map((c) => c.join('/')),
}))

export interface SearchHit {
  post: Post
  /** 是否标题命中 */
  titleHit: boolean
  /** 摘要（命中位置附近 ±60 字符） */
  snippet: string
}

/** 搜索：标题/正文/分类 不区分大小写匹配 */
export function searchPosts(keyword: string): SearchHit[] {
  const kw = keyword.trim()
  if (!kw) return []
  const k = kw.toLowerCase()
  const hits: SearchHit[] = []
  for (const e of entries) {
    const titleIdx = e.title.toLowerCase().indexOf(k)
    const textIdx = e.text.toLowerCase().indexOf(k)
    const catHit = e.categories.some((c) => c.toLowerCase().includes(k))
    if (titleIdx < 0 && textIdx < 0 && !catHit) continue
    let snippet = ''
    if (textIdx >= 0) {
      const start = Math.max(0, textIdx - 60)
      snippet = (start > 0 ? '…' : '') + e.text.slice(start, start + 140) + (start + 140 < e.text.length ? '…' : '')
    } else {
      snippet = e.text.slice(0, 140) + (e.text.length > 140 ? '…' : '')
    }
    hits.push({ post: e.post, titleHit: titleIdx >= 0, snippet })
  }
  return hits
}
