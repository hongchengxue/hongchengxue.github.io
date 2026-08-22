import { nowStr } from '@/lib/date'
import { slugify } from '@/lib/slug'

/**
 * 组装文章 front matter（与旧站写作台输出格式一致，Hexo/Vite 内容层均兼容）。
 * 分类用 / 分隔路径，如 `技术文章/AI` → 多级分类数组。
 * - date：新文章 = 当前时间；编辑已有文章时传入原始 date，避免发布时间被覆盖
 * - updated：编辑已发布文章时写入当前时间；新建 / 草稿不写
 */
export function buildFrontmatter(opts: {
  title: string
  categoryPath: string
  tags: string[]
  /** 已有文章的原始 date（编辑时保留，否则发布时间会变成保存时间） */
  origDate?: string
  /** 编辑已发布文章时的更新时间；新建 / 草稿转正不传 */
  updated?: string
  /** 已有文章的原始 description（写作台没有编辑入口，编辑时保留，避免丢失） */
  description?: string
}): string {
  const { title, categoryPath, tags, origDate, updated, description } = opts
  let fm = '---\n' + `title: ${title}\n` + `date: ${origDate ?? nowStr()}\n`
  if (updated) fm += `updated: ${updated}\n`
  if (description) fm += `description: ${description}\n`
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
