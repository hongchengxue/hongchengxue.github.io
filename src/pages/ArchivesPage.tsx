import { ArticleTree } from '@/components/ArticleTree'
import { AnnouncementCard, ArchivesCard, CategoriesCard, RecentWorksCard } from '@/components/AsideCards'
import { PageHeader } from '@/components/PageHeader'
import { PostCard } from '@/components/PostCard'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'
import { formatDate } from '@/lib/date'
import { posts } from '@/lib/posts'
import { siteStats } from '@/lib/stats'

/** 文章归档页：全部文章 + 侧边栏（公告/最近作品/分类/归档/全部文章树） */
export default function ArchivesPage() {
  const { t } = useLang()
  useTitle(t('articles'))

  const recentItems = siteStats.recent.map((p) => ({ title: p.meta.title, url: p.url, date: formatDate(p.date) }))

  // 按月归档统计
  const monthMap = new Map<string, number>()
  for (const p of posts) {
    const key = `${p.year}-${p.month}`
    monthMap.set(key, (monthMap.get(key) ?? 0) + 1)
  }
  const monthItems = [...monthMap.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, count]) => ({ label: `${key.slice(0, 4)}-${key.slice(5)}`, count, to: '/archives/' }))

  return (
    <div className="container">
      <PageHeader title={t('articles')} icon="archive" />
      <div className="layout">
        <div className="page-main">
          <section className="post-list">
            {posts.map((post) => (
              <PostCard key={post.url} post={post} />
            ))}
          </section>
        </div>
        <aside className="aside-content">
          <AnnouncementCard title={t('announcement')} content="欢迎来到我的知识库 🎉" />
          <RecentWorksCard title={t('recentWorks')} items={recentItems} />
          <CategoriesCard
            title={t('categories')}
            items={siteStats.categories.map((c) => ({ name: c.name, count: c.count }))}
          />
          <ArchivesCard title={t('archives')} items={monthItems} />
          <div className="card-widget">
            <div className="item-headline">
              <span>{t('allArticles')}</span>
            </div>
            <ArticleTree all={siteStats.all} />
          </div>
        </aside>
      </div>
    </div>
  )
}
