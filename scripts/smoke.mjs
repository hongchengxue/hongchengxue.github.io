/**
 * 冒烟测试：在 Node 中用 Vite 的 SSR 模块加载器验证核心纯逻辑。
 * 运行：node scripts/smoke.mjs
 * 覆盖：文章加载（glob + frontmatter）、URL 生成、统计、搜索、分类树。
 */
import { createServer } from 'vite'

const server = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

let failed = 0
const assert = (cond, msg) => {
  if (cond) {
    console.log(`  PASS  ${msg}`)
  } else {
    console.error(`  FAIL  ${msg}`)
    failed += 1
  }
}

try {
  const { posts } = await server.ssrLoadModule('/src/lib/posts.ts')
  const { siteStats } = await server.ssrLoadModule('/src/lib/stats.ts')
  const { searchPosts } = await server.ssrLoadModule('/src/lib/search.ts')
  const { buildCategoryTree } = await server.ssrLoadModule('/src/lib/categories.ts')
  const { videoEmbedHtml } = await server.ssrLoadModule('/src/lib/markdown.ts')

  console.log('posts:')
  assert(posts.length === 5, `共加载 ${posts.length} 篇文章`)
  // Hexo 约定：slug = 文件名主干（含日期前缀），旧站 URL 即 /2026/08/15/2026-08-15-AI/
  const ai = posts.find((p) => p.slug === '2026-08-15-AI')
  assert(ai?.meta.categories[0].join('/') === '技术文章/AI', `AI 多级分类解析: ${ai?.meta.categories[0]?.join('/')}`)
  assert(ai?.url === '/2026/08/15/2026-08-15-AI/', `AI URL 兼容旧永久链接: ${ai?.url}`)
  const hello = posts.find((p) => p.slug === 'hello-world')
  assert(hello?.url === '/2026/08/15/hello-world/', `hello-world URL: ${hello?.url}`)
  const cn = posts.find((p) => p.slug === '2026-8-15-相同主题模板')
  assert(cn?.meta.tags.includes('个人主页') && cn?.meta.title === '相同主题模板', '中文文件名文章解析正常')

  console.log('stats:')
  assert(siteStats.total === 5, `total=${siteStats.total}`)
  const tech = siteStats.categories.find((c) => c.name === '技术文章')
  assert(tech?.count === 4, `技术文章分类计数=${tech?.count}（含多级分类子项）`)
  const tutorial = siteStats.tags.find((t) => t.name === '教程')
  assert(tutorial?.count === 3, `教程标签计数=${tutorial?.count}`)
  assert(siteStats.catPaths.includes('技术文章/AI'), 'catPaths 含父子路径 技术文章/AI')
  assert(siteStats.lastUpdated.length === 10, `最近更新日期=${siteStats.lastUpdated}`)

  console.log('search:')
  const hits = searchPosts('AI')
  assert(hits.length >= 1, `搜索 "AI" 命中 ${hits.length} 篇`)
  assert(searchPosts('不存在的关键词xyz').length === 0, '无关关键词 0 命中')
  const cnHit = searchPosts('PCB')
  assert(cnHit.some((h) => h.post.slug.includes('PCB')), '搜索 PCB 命中 PCB 文章')

  console.log('categories tree:')
  const tree = buildCategoryTree(siteStats.catPaths)
  const techNode = tree.find((n) => n.name === '技术文章')
  assert(!!techNode?.children.find((c) => c.name === 'AI'), '分类树包含 技术文章/AI 层级')

  console.log('video embed:')
  assert(
    videoEmbedHtml('https://www.bilibili.com/video/BV1GJ411x7h7').includes(
      'player.bilibili.com/player.html?bvid=BV1GJ411x7h7',
    ),
    'B站视频链接 → 播放器 iframe',
  )
  assert(
    videoEmbedHtml('https://www.youtube.com/watch?v=dQw4w9WgXcQ').includes(
      'youtube.com/embed/dQw4w9WgXcQ',
    ),
    'YouTube 链接 → embed iframe',
  )
  assert(videoEmbedHtml('https://example.com/video.mp4').includes('<video'), 'mp4 直链 → video 标签')
  assert(videoEmbedHtml('https://example.com/page').includes('<iframe'), '未知站点 → iframe 嵌入')

  console.log(failed === 0 ? '\n✅ 全部通过' : `\n❌ ${failed} 项失败`)
} finally {
  await server.close()
}

process.exit(failed === 0 ? 0 : 1)
