import { Giscus } from '@/components/Giscus'
import { Icon } from '@/components/Icon'
import { PostCard } from '@/components/PostCard'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'
import { posts } from '@/lib/posts'

/** 首页：顶部横幅 + 文章列表 + 评论区（搜索统一在导航栏） */
export default function HomePage() {
  const { t } = useLang()
  useTitle()

  return (
    <>
      <section className="hero" aria-hidden="true" />

      <div className="container">
        <section className="post-list" aria-label={t('articles')}>
          {posts.map((post) => (
            <PostCard key={post.url} post={post} />
          ))}
        </section>

        <section className="home-comments">
          <div className="home-comments-head">
            <Icon name="comments" size={16} />
            <span>{t('comments')}</span>
          </div>
          <Giscus />
        </section>
      </div>
    </>
  )
}
