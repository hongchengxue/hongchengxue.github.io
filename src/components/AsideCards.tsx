import { Link } from 'react-router-dom'
import { Icon, type IconName } from '@/components/Icon'

/** 侧边栏卡片容器 */
export function AsideCard({
  icon,
  title,
  children,
}: {
  icon: IconName
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="card-widget">
      <div className="item-headline">
        <Icon name={icon} size={14} />
        <span>{title}</span>
      </div>
      {children}
    </div>
  )
}

/** 公告卡 */
export function AnnouncementCard({ title, content }: { title: string; content: string }) {
  return (
    <AsideCard icon="comments" title={title}>
      <p className="card-text">{content}</p>
    </AsideCard>
  )
}

/** 最近作品卡 */
export function RecentWorksCard({
  title,
  items,
}: {
  title: string
  items: { title: string; url: string; date: string }[]
}) {
  return (
    <AsideCard icon="list" title={title}>
      <ul className="card-list">
        {items.map((item) => (
          <li key={item.url}>
            <Link to={item.url} className="card-link">
              <span className="card-link-title">{item.title}</span>
              <span className="card-link-date">{item.date}</span>
            </Link>
          </li>
        ))}
      </ul>
    </AsideCard>
  )
}

/** 分类卡（标题可点击跳转分类页） */
export function CategoriesCard({
  title,
  items,
}: {
  title: string
  items: { name: string; count: number }[]
}) {
  return (
    <AsideCard icon="folder" title={title}>
      <ul className="card-list">
        {items.map((item) => (
          <li key={item.name}>
            <Link to={`/categories/${encodeURIComponent(item.name)}/`} className="card-link">
              <span className="card-link-title">{item.name}</span>
              <span className="card-link-count">{item.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </AsideCard>
  )
}

/** 归档卡（按月） */
export function ArchivesCard({
  title,
  items,
}: {
  title: string
  items: { label: string; count: number; to: string }[]
}) {
  return (
    <AsideCard icon="archive" title={title}>
      <ul className="card-list">
        {items.map((item) => (
          <li key={item.label}>
            <Link to={item.to} className="card-link">
              <span className="card-link-title">{item.label}</span>
              <span className="card-link-count">{item.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </AsideCard>
  )
}

/** 目录卡（文章页） */
export function TocCard({ title, items }: { title: string; items: { id: string; depth: number; text: string }[] }) {
  return (
    <AsideCard icon="list" title={title}>
      <nav className="card-toc">
        {items.map((item) => (
          <a key={item.id} href={`#${item.id}`} className={`toc-link toc-level-${item.depth}`}>
            {item.text}
          </a>
        ))}
      </nav>
    </AsideCard>
  )
}
