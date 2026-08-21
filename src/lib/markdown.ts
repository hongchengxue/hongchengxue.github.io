import { Marked, Renderer, type Token } from 'marked'
import DOMPurify, { type Config as DOMPurifyConfig } from 'dompurify'

/**
 * Markdown → HTML 渲染（教程友好增强）。
 * - 标题自动生成 id（供目录 TOC 锚点使用）
 * - 扩展语法：
 *   · :::video <链接> → 视频嵌入（B站 / YouTube / mp4 直链 / 任意 iframe）
 *   · :::tip|info|warning|danger [标题] → 提示框（教程常用的强调容器）
 * - 允许在正文中直接嵌入 HTML（iframe/details/video 等，经白名单消毒）
 * - 渲染结果经 DOMPurify 消毒，防止 XSS
 */

/** 属性值 HTML 转义 */
function escAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

/**
 * 把视频链接解析为可嵌入 HTML（纯函数，可在 Node 中测试）。
 * 支持：B站（bilibili.com/video/BV…、b23.tv、player.bilibili.com）、
 *       YouTube（watch?v=、youtu.be）、mp4/webm 直链、其他站点 iframe。
 */
export function videoEmbedHtml(url: string): string {
  const u = url.trim()
  if (!u) return ''

  // 直链视频文件
  if (/\.(mp4|webm|ogg|mov)([?#]|$)/i.test(u)) {
    return `<video src="${escAttr(u)}" controls playsinline preload="metadata"></video>`
  }

  // B 站视频页 → 播放器
  const bv = u.match(/(?:bilibili\.com\/video\/|b23\.tv\/)(BV[\w]+)/i)
  if (bv) {
    return `<iframe src="https://player.bilibili.com/player.html?bvid=${bv[1]}&page=1&high_quality=1&danmaku=0" allowfullscreen loading="lazy"></iframe>`
  }

  // B 站播放器直链（含 //player.bilibili.com 协议相对地址）
  if (u.includes('player.bilibili.com')) {
    const src = u.startsWith('//') ? `https:${u}` : u
    return `<iframe src="${escAttr(src)}" allowfullscreen loading="lazy"></iframe>`
  }

  // YouTube
  const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/)
  if (yt) {
    return `<iframe src="https://www.youtube.com/embed/${yt[1]}" allowfullscreen loading="lazy"></iframe>`
  }

  // 其他站点：按 iframe 嵌入（由 DOMPurify 协议白名单把关）
  return `<iframe src="${escAttr(u)}" allowfullscreen loading="lazy"></iframe>`
}

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

/* ---------- 扩展：提示框 :::tip / :::info / :::warning / :::danger ---------- */
interface CalloutToken {
  type: 'callout'
  raw: string
  kind: 'tip' | 'info' | 'warning' | 'danger'
  title: string
  tokens: Token[]
}

const calloutExtension = {
  name: 'callout',
  level: 'block' as const,
  start(src: string) {
    return /^:::(?:tip|info|warning|danger)\b/.exec(src)?.index
  },
  tokenizer(this: { lexer: { blockTokens(text: string): Token[] } }, src: string) {
    const rule = /^:::(tip|info|warning|danger)\s*([^\n]*)\n([\s\S]*?)\n:::\s*(?:\n|$)/
    const match = rule.exec(src)
    if (!match) return undefined
    const token: CalloutToken = {
      type: 'callout',
      raw: match[0],
      kind: match[1] as CalloutToken['kind'],
      title: match[2].trim(),
      tokens: [],
    }
    token.tokens = this.lexer.blockTokens(match[3])
    return token as unknown as Token
  },
  renderer(this: { parser: { parse(tokens: Token[]): string } }, token: CalloutToken) {
    const head = token.title ? `<div class="callout-title">${token.title}</div>` : ''
    return (
      `<div class="callout callout-${token.kind}">` +
      head +
      `<div class="callout-body">${this.parser.parse(token.tokens)}</div>` +
      `</div>`
    )
  },
}

/* ---------- 扩展：视频 :::video <链接> ---------- */
interface VideoToken {
  type: 'video'
  raw: string
  url: string
}

const videoExtension = {
  name: 'video',
  level: 'block' as const,
  start(src: string) {
    return /^:::video\b/.exec(src)?.index
  },
  tokenizer(this: unknown, src: string) {
    const rule = /^:::video\s+(\S+)\s*\n?:::\s*(?:\n|$)/
    const match = rule.exec(src)
    if (!match) return undefined
    const token: VideoToken = { type: 'video', raw: match[0], url: match[1].trim() }
    return token as unknown as Token
  },
  renderer(this: unknown, token: VideoToken) {
    return `<div class="video-container">${videoEmbedHtml(token.url)}</div>`
  },
}

const marked = new Marked({
  renderer,
  gfm: true,
  breaks: false,
  extensions: [calloutExtension, videoExtension],
})

/** DOMPurify 白名单：允许教程常用的嵌入标签与属性 */
const PURIFY_OPTS: DOMPurifyConfig = {
  ADD_TAGS: ['iframe', 'video', 'source', 'details', 'summary'],
  ADD_ATTR: ['allowfullscreen', 'frameborder', 'scrolling', 'playsinline', 'controls'],
}

/** 渲染 Markdown 为消毒后的 HTML 字符串 */
export function renderMarkdown(md: string): string {
  const html = marked.parse(md, { async: false }) as string
  return DOMPurify.sanitize(html, PURIFY_OPTS) as string
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
