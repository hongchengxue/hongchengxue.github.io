import { Link } from 'react-router-dom'
import { AboutProfile } from '@/components/AboutProfile'
import { Giscus } from '@/components/Giscus'
import { Icon } from '@/components/Icon'
import { PostCard } from '@/components/PostCard'
import { Reveal } from '@/components/Reveal'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'
import { posts } from '@/lib/posts'

const HERO_POSTS = 3

/** 首页：mimo 式浅色 hero（渐变流光名字 + CTA）+ 个人介绍 + 最新文章 + 评论区 */
export default function HomePage() {
  const { t } = useLang()
  useTitle()
  const latest = posts.slice(0, HERO_POSTS)

  return (
    <>
      <section className="home-hero">
        <Reveal>
          <p className="home-hero-greet">{t('heroGreet')}</p>
        </Reveal>
        <Reveal delay={120}>
          <h1 className="home-hero-name gradient-text">hong</h1>
        </Reveal>
        <Reveal delay={240}>
          <p className="home-hero-sub">{t('heroSubLine')}</p>
        </Reveal>
        <Reveal delay={360}>
          <div className="home-hero-actions">
            <Link className="btn-primary" to="/archives/">
              {t('readArticles')} <Icon name="arrow-right" size={15} />
            </Link>
            <Link className="btn-ghost" to="/about/">
              {t('moreAboutMe')}
            </Link>
          </div>
        </Reveal>
      </section>

      <div className="container">
        <Reveal className="home-about">
          <AboutProfile />
        </Reveal>

        <section className="home-posts">
          <Reveal>
            <h2 className="home-section-title">{t('recentPosts')}</h2>
          </Reveal>
          {latest.map((post, i) => (
            <Reveal key={post.url} delay={i * 100}>
              <PostCard post={post} />
            </Reveal>
          ))}
          <Reveal delay={latest.length * 100}>
            <Link className="home-view-all" to="/archives/">
              {t('viewAll')} <Icon name="arrow-right" size={14} />
            </Link>
          </Reveal>
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
