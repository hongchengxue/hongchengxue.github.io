import { parseDateStr, parseFrontmatter } from '@/lib/frontmatter'
import type { Post, PostMeta } from '@/types/post'

/**
 * 文章加载：构建时由 Vite 将 src/content/posts/*.md 打包进应用。
 * - 新增文章 = 在 src/content/posts 下放一个 .md 文件，重新构建即上线
 * - slug 取自文件名主干，保证与旧站点永久链接（/:year/:month/:day/:slug/）兼容
 */
const rawModules = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

interface RawPost {
  slug: string
  meta: PostMeta
  raw: string
}

function buildPost(filePath: string, content: string): RawPost | null {
  const parsed = parseFrontmatter(content)
  if (!parsed) return null
  const slug = filePath.split('/').pop()?.replace(/\.md$/, '') ?? ''
  return { slug, meta: parsed.meta, raw: parsed.body }
}

function toPost(r: RawPost): Post {
  const date = parseDateStr(r.meta.date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    slug: r.slug,
    year: pad(date.getFullYear()),
    month: pad(date.getMonth() + 1),
    day: pad(date.getDate()),
    url: `/${pad(date.getFullYear())}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${encodeURIComponent(r.slug)}/`,
    meta: r.meta,
    raw: r.raw,
    date,
  }
}

/** 全部文章，按日期倒序（模块级一次性构建，仅初始化一次） */
export const posts: Post[] = Object.entries(rawModules)
  .map(([path, content]) => buildPost(path, content as string))
  .filter((p): p is RawPost => p !== null)
  .map(toPost)
  .sort((a, b) => b.date.getTime() - a.date.getTime())

/** 用 slug 查文章 */
const postBySlug = new Map(posts.map((p) => [p.slug, p]))

export function getPostBySlug(slug: string): Post | undefined {
  return postBySlug.get(slug)
}

/** 用年/月/日/slug 查文章（路由参数均为字符串） */
export function getPost(year: string, month: string, day: string, slug: string): Post | undefined {
  const post = postBySlug.get(decodeURIComponent(slug))
  if (!post || post.year !== year || post.month !== month || post.day !== day) return undefined
  return post
}

/** 上一篇 / 下一篇（按日期排序） */
export function getAdjacentPosts(post: Post): { prev?: Post; next?: Post } {
  const idx = posts.findIndex((p) => p.slug === post.slug)
  if (idx < 0) return {}
  return { prev: posts[idx - 1], next: posts[idx + 1] }
}
