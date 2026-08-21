import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { PostCard } from '@/components/PostCard'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'
import { posts } from '@/lib/posts'

/** 标签详情页：/tags/教程/ → 该标签下的文章 */
export default function TagDetailPage() {
  const { t } = useLang()
  const { name = '' } = useParams()
  const tagName = decodeURIComponent(name)
  useTitle(tagName || t('tags'))

  const tagPosts = tagName ? posts.filter((p) => p.meta.tags.includes(tagName)) : []

  return (
    <div className="container">
      <PageHeader title={tagName ? `# ${tagName}` : t('tags')} icon="tag" />
      <section className="post-list">
        {tagPosts.map((post) => (
          <PostCard key={post.url} post={post} />
        ))}
        {tagPosts.length === 0 ? <p className="page-empty">{t('searchEmpty')}</p> : null}
      </section>
    </div>
  )
}
