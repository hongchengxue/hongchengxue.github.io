import { nowStr } from '@/lib/date'
import { slugify } from '@/lib/slug'

/**
 * 组装文章 front matter（与旧站写作台输出格式一致，Hexo/Vite 内容层均兼容）。
 * 分类用 / 分隔路径，如 `技术文章/AI` → 多级分类数组。
 */
export function buildFrontmatter(opts: {
  title: string
  categoryPath: string
  tags: string[]
}): string {
  const { title, categoryPath, tags } = opts
  let fm = '---\n' + `title: ${title}\n` + `date: ${nowStr()}\n`
  const parts = categoryPath.split('/').filter(Boolean)
  if (parts.length) {
    if (parts.length > 1) {
      fm += `categories:\n  - [${parts.join(', ')}]\n`
    } else {
      fm += `categories:\n  - ${parts[0]}\n`
    }
  }
  if (tags.length) {
    fm += 'tags:\n'
    for (const t of tags) fm += `  - ${t}\n`
  }
  fm += '---\n\n'
  return fm
}

/** 生成新文章文件名：2026-08-15-标题-slug.md（与旧站一致，slug 取自文件名） */
export function postFileName(title: string, d = new Date()): string {
  return `${nowStr(d).slice(0, 10)}-${slugify(title)}.md`
}
