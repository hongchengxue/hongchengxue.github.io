import { AnnouncementCard, RecentWorksCard } from '@/components/AsideCards'
import { AboutProfile } from '@/components/AboutProfile'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'
import { formatDate } from '@/lib/date'
import { siteStats } from '@/lib/stats'

/** 关于页：个人介绍 + 侧边栏（公告/最近作品） */
export default function AboutPage() {
  const { t } = useLang()
  useTitle('ABOUT')

  const recentItems = siteStats.recent.map((p) => ({ title: p.meta.title, url: p.url, date: formatDate(p.date) }))

  return (
    <div className="container">
      <div className="layout">
        <div className="page-main">
          <AboutProfile />
        </div>
        <aside className="aside-content">
          <AnnouncementCard title={t('announcement')} content="欢迎来到我的知识库 🎉" />
          <RecentWorksCard title={t('recentWorks')} items={recentItems} />
        </aside>
      </div>
    </div>
  )
}
