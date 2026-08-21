/** 文章 front matter 元信息（与 Hexo 格式兼容） */
export interface PostMeta {
  /** 文章标题 */
  title: string
  /** 发布日期，格式 YYYY-MM-DD HH:mm:ss */
  date: string
  /** 更新日期（可选） */
  updated?: string
  /** 分类：支持多级，如 [['技术文章'], ['技术文章', 'AI']] */
  categories: string[][]
  /** 标签 */
  tags: string[]
  /** 一句话介绍（可选） */
  description?: string
}

/** 一篇文章（元信息 + 原始 Markdown 正文） */
export interface Post {
  /** URL slug，取自文件名主干（保证与旧站点永久链接兼容） */
  slug: string
  /** 年（两位） */
  year: string
  /** 月（补零） */
  month: string
  /** 日（补零） */
  day: string
  /** 文章 URL，如 /2026/08/15/hello-world/ */
  url: string
  meta: PostMeta
  /** 正文原始 Markdown（不含 front matter） */
  raw: string
  /** 按发布日期解析出的 Date */
  date: Date
}

/** 标签/分类统计项 */
export interface CountItem {
  name: string
  count: number
}

/** 全站统计（由文章数据在运行时推导，替代旧站构建期生成的 site-stats.json） */
export interface SiteStats {
  total: number
  tags: CountItem[]
  categories: CountItem[]
  /** 全部分类路径（含父子层级，如 技术文章/AI） */
  catPaths: string[]
  /** 最近 5 篇文章 */
  recent: Post[]
  /** 全部文章（含年月日，供归档侧边栏折叠树） */
  all: { post: Post; year: string; month: string; day: string }[]
  /** 构建时间（Asia/Shanghai，YYYY-MM-DD） */
  lastUpdated: string
}
