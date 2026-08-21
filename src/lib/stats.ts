import { posts } from '@/lib/posts'
import type { CountItem, SiteStats } from '@/types/post'

/**
 * 全站统计：由文章数据在运行时推导（替代旧站点构建期生成的 site-stats.json）。
 * 模块级一次性计算，初始化后不再变化。
 */

function countItems(pick: (p: (typeof posts)[number]) => string[]): CountItem[] {
  const map = new Map<string, number>()
  for (const p of posts) {
    for (const name of pick(p)) {
      map.set(name, (map.get(name) ?? 0) + 1)
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'))
}

/** 全部分类路径（含父子层级，如 技术文章/AI） */
function collectCatPaths(): string[] {
  const set = new Set<string>()
  for (const p of posts) {
    for (const cat of p.meta.categories) set.add(cat.join('/'))
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'zh'))
}

function buildTime(): string {
  const d = new Date(__BUILD_TIME__)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((x) => x.type === t)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

export const siteStats: SiteStats = {
  total: posts.length,
  tags: countItems((p) => p.meta.tags),
  // 与旧站一致：多级分类的每一级都计入统计
  categories: countItems((p) => p.meta.categories.flatMap((c) => c)),
  catPaths: collectCatPaths(),
  recent: posts.slice(0, 5),
  all: posts.map((post) => ({ post, year: post.year, month: post.month, day: post.day })),
  lastUpdated: buildTime(),
}
