/**
 * 站点全局配置：把"会变的东西"集中在这里，改配置不动代码逻辑。
 */

export const SITE = {
  title: 'hong 的知识库',
  author: 'hong',
  since: 2026,
  description: 'hong 的个人主页与博客：分享技术文章和生活随笔',
  /** 首页英雄区大搜索框占位文案（用户指定，中英文一致） */
  heroSearchPlaceholder: 'Attention Is All You Need',
  /** 首页英雄区副标题 */
  heroSub: ['持续学习，保持好奇'],
  /** 联系与社交链接 */
  contact: {
    github: 'https://github.com/hongchengxue',
    email: 'mailto:your-email@example.com',
  },
} as const

/** Giscus 评论配置（与旧站主题配置一致） */
export const GISCUS = {
  repo: 'hongchengxue/hongchengxue.github.io',
  repoId: 'R_kgDOT441Lg',
  category: 'General',
  categoryId: 'DIC_kwDOT441Ls4DDkT6',
  mapping: 'pathname' as const,
  lang: 'zh-CN',
}

/** 写作台操作的目标仓库与目录（写入后触发 CI 自动构建上线） */
export const GITHUB_REPO = {
  repo: 'hongchengxue/hongchengxue.github.io',
  /** 内容所在分支：V1 保留在 main，V2 是当前线上版本 */
  branch: 'V2',
  postsDir: 'src/content/posts',
  draftsDir: 'src/content/_drafts',
} as const
