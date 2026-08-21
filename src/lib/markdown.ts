import { Marked, Renderer } from 'marked'
import DOMPurify from 'dompurify'

/**
 * Markdown → HTML 渲染。
 * - 标题自动生成 id（供目录 TOC 锚点使用）
 * - 渲染结果经 DOMPurify 消毒，防止 XSS
 * - 代码高亮按需加载（见 highlightCodeBlocks），避免拖累首屏体积
 */

function slugifyHeading(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
  return slug || 'heading'
}

const renderer = new Renderer()
renderer.heading = function ({ tokens, depth }) {
  const text = this.parser.parseInline(tokens)
  return `<h${depth} id="${slugifyHeading(text)}">${text}</h${depth}>`
}

const marked = new Marked({
  renderer,
  gfm: true,
  breaks: false,
})

/** 渲染 Markdown 为消毒后的 HTML 字符串 */
export function renderMarkdown(md: string): string {
  const html = marked.parse(md, { async: false }) as string
  return DOMPurify.sanitize(html)
}

/** 从渲染后的 HTML 提取目录（标题 id + 层级 + 文本） */
export interface TocItem {
  id: string
  depth: number
  text: string
}

export function extractToc(html: string): TocItem[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const items: TocItem[] = []
  doc.querySelectorAll('h2, h3').forEach((h) => {
    if (!h.id) return
    items.push({ id: h.id, depth: Number(h.tagName[1]), text: h.textContent ?? '' })
  })
  return items
}

/** 高亮容器内的代码块（highlight.js 按需加载，返回 Promise 便于页面等待） */
export async function highlightCodeBlocks(container: HTMLElement): Promise<void> {
  const blocks = container.querySelectorAll<HTMLElement>('pre code')
  if (!blocks.length) return
  const hljs = (await import('@/lib/highlight')).default
  blocks.forEach((el) => {
    try {
      hljs.highlightElement(el)
    } catch {
      // 单个代码块高亮失败不影响整页
    }
  })
}
