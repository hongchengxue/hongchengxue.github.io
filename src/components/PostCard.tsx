import { Link } from 'react-router-dom'
import { Icon } from '@/components/Icon'
import { useLang } from '@/hooks/useLang'
import { formatDate } from '@/lib/date'
import type { Post } from '@/types/post'

/** 文章卡片（首页 / 归档列表使用） */
export function PostCard({ post }: { post: Post }) {
  const { t } = useLang()
  const firstCat = post.meta.categories[0]?.[0]

  return (
    <article className="post-card">
      <div className="post-card-meta">
        <time dateTime={post.meta.date}>
          <Icon name="clock" size={13} /> {formatDate(post.date)}
        </time>
        {firstCat ? (
          <Link to={`/categories/${encodeURIComponent(firstCat)}/`} className="post-card-cat">
            <Icon name="folder" size={12} /> {firstCat}
          </Link>
        ) : null}
      </div>
      <h2 className="post-card-title">
        <Link to={post.url}>{post.meta.title}</Link>
      </h2>
      {post.meta.description ? <p className="post-card-desc">{post.meta.description}</p> : null}
      <Link className="post-card-more" to={post.url}>
        {t('readMore')} <Icon name="arrow-right" size={13} />
      </Link>
    </article>
  )
}
