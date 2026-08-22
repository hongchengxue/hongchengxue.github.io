/**
 * 生成 RSS 订阅源（public/feed.xml）。
 * 构建时运行：node scripts/generate-rss.mjs（已挂入 npm run build）
 * 文章数据来源：src/content/posts/*.md（与前端 posts.ts 逻辑一致：slug=文件名主干）
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SITE_URL = 'https://hongchengxue.github.io'
const SITE_TITLE = 'hong 的知识库'
const SITE_DESC = 'hong 的个人主页与博客：分享技术文章和生活随笔'
const POSTS_DIR = join(process.cwd(), 'src/content/posts')

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function parseFrontmatter(raw) {
  const m = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(raw)
  if (!m) return { meta: {}, body: '' }
  const fm = m[1]
  const get = (key) => {
    const line = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
    return line ? line[1].trim() : undefined
  }
  const block = (key) => {
    const b = fm.match(new RegExp(`^${key}:([\\s\\S]*?)(?=^\\S|\\z)`, 'm'))
    return b ? b[1] : undefined
  }
  const tags = []
  const tb = block('tags')
  if (tb) {
    const re = /^\s*-\s*(.+)$/gm
    let t
    while ((t = re.exec(tb)) !== null) tags.push(t[1].trim())
  }
  return { meta: { title: get('title'), date: get('date'), description: get('description'), tags }, body: raw.slice(m[0].length) }
}

function parseDateStr(s) {
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/)
  if (!m) return new Date(s)
  return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0))
}

const items = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((file) => {
    const raw = readFileSync(join(POSTS_DIR, file), 'utf8')
    const { meta, body } = parseFrontmatter(raw)
    const slug = file.replace(/\.md$/, '')
    const date = parseDateStr(meta.date ?? '1970-01-01 00:00:00')
    const pad = (n) => String(n).padStart(2, '0')
    const url = `${SITE_URL}/${pad(date.getFullYear())}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${encodeURIComponent(slug)}/`
    // 正文转纯文本摘要（去掉 frontmatter 与 markdown 语法）
    const text = body
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[#>*_`-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300)
    return {
      title: meta.title ?? slug,
      url,
      date,
      description: meta.description || text,
      tags: meta.tags ?? [],
      content: body.trim().slice(0, 2000),
    }
  })
  .sort((a, b) => b.date - a.date)

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(SITE_TITLE)}</title>
  <link>${SITE_URL}</link>
  <description>${esc(SITE_DESC)}</description>
  <language>zh-CN</language>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
  ${items
    .map(
      (it) => `  <item>
    <title>${esc(it.title)}</title>
    <link>${it.url}</link>
    <guid>${it.url}</guid>
    <pubDate>${it.date.toUTCString()}</pubDate>
    ${it.description ? `<description>${esc(it.description)}</description>` : ''}
    ${it.tags.map((t) => `    <category>${esc(t)}</category>`).join('\n')}
  </item>`,
    )
    .join('\n')}
</channel>
</rss>
`

writeFileSync(join(process.cwd(), 'public/feed.xml'), rss, 'utf8')
console.log(`✅ feed.xml 已生成（${items.length} 篇文章）`)
