import { useLocation } from 'react-router-dom'
import { CategoryBreadcrumb } from '@/components/CategoryBreadcrumb'
import { PageHeader } from '@/components/PageHeader'
import { PostCard } from '@/components/PostCard'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'
import { isInCategory } from '@/lib/categories'
import { posts } from '@/lib/posts'

/** 分类详情页：/categories/技术文章/AI/ → 该分类（含子分类）下的文章 */
export default function CategoryDetailPage() {
  const { t } = useLang()
  const { pathname } = useLocation()

  const segments = pathname
    .replace(/^\/categories\/?/, '')
    .split('/')
    .filter((s) => s && s !== 'index.html')
    .map((s) => {
      try {
        return decodeURIComponent(s)
      } catch {
        return s
      }
    })
  const catPath = segments.join('/')
  useTitle(catPath ? catPath : t('categories'))

  const catPosts = catPath ? posts.filter((p) => isInCategory(p.meta.categories, catPath)) : []

  return (
    <div className="container">
      <PageHeader title={catPath || t('categories')} icon="folder" />
      <CategoryBreadcrumb segments={segments} />
      <section className="post-list">
        {catPosts.map((post) => (
          <PostCard key={post.url} post={post} />
        ))}
        {catPosts.length === 0 ? <p className="page-empty">{t('searchEmpty')}</p> : null}
      </section>
    </div>
  )
}
