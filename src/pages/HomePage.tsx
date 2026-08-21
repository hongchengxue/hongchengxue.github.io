import { Giscus } from '@/components/Giscus'
import { Icon } from '@/components/Icon'
import { PostCard } from '@/components/PostCard'
import { SearchBar } from '@/components/SearchBar'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'
import { posts } from '@/lib/posts'

/** 首页：英雄区大搜索框 + 文章列表 + 评论区 */
export default function HomePage() {
  const { t } = useLang()
  useTitle()

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <SearchBar variant="hero" />
        </div>
      </section>

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
