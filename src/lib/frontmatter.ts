/**
 * 极简 front matter 解析器（兼容 Hexo 文章格式）。
 * 支持字段：title / date / updated / categories / tags / description
 * 分类支持两种写法：
 *   categories:
 *     - 技术文章
 *     - [技术文章, AI]
 */

const FM_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?/

function parseListBlock(block: string): string[] {
  const items: string[] = []
  const re = /^\s*-\s*(.+)$/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(block)) !== null) items.push(m[1].trim())
  return items
}

/** 解析分类块：`- 技术文章` 或 `- [技术文章, AI]` */
function parseCategories(block: string): string[][] {
  return parseListBlock(block).map((line) => {
    const arr = line.match(/^\[([^\]]+)\]$/)
    if (arr) return arr[1].split(',').map((s) => s.trim()).filter(Boolean)
    return [line]
  })
}

export interface ParsedFrontmatter {
  meta: {
    title: string
    date: string
    updated?: string
    categories: string[][]
    tags: string[]
    description?: string
  }
  /** 正文（不含 front matter） */
  body: string
}

/** 解析 Markdown 文件内容，返回元信息与正文；无 front matter 时返回 null */
export function parseFrontmatter(raw: string): ParsedFrontmatter | null {
  const m = FM_RE.exec(raw)
  if (!m) return null

  const fm = m[1]
  const get = (key: string): string | undefined => {
    const line = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
    return line ? line[1].trim() : undefined
  }
  const block = (key: string): string | undefined => {
    const b = fm.match(new RegExp(`^${key}:([\\s\\S]*?)(?=^\\S|\\z)`, 'm'))
    return b ? b[1] : undefined
  }

  const title = get('title') ?? '无标题'
  const date = get('date') ?? '1970-01-01 00:00:00'
  const catBlock = block('categories')
  const tagBlock = block('tags')

  return {
    meta: {
      title,
      date,
      updated: get('updated'),
      categories: catBlock ? parseCategories(catBlock) : [],
      tags: tagBlock ? parseListBlock(tagBlock) : [],
      description: get('description'),
    },
    body: raw.slice(m[0].length),
  }
}

/** 解析日期字符串（兼容 2026-08-15 与 2026-8-15 等写法）为 Date */
export function parseDateStr(s: string): Date {
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/)
  if (!m) return new Date(s)
  return new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4] ?? 0),
    Number(m[5] ?? 0),
    Number(m[6] ?? 0),
  )
}
