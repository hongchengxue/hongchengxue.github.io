import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Giscus, type GiscusSorting } from '@/components/Giscus'
import { Icon } from '@/components/Icon'
import { LikeButton } from '@/components/LikeButton'
import { PageViews } from '@/components/PageViews'
import { ShareBar } from '@/components/ShareBar'
import { TocCard } from '@/components/AsideCards'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'
import { categoryUrl } from '@/lib/categories'
import { formatDate, formatDateTime } from '@/lib/date'
import { extractToc, highlightCodeBlocks, renderMarkdown } from '@/lib/markdown'
import { getAdjacentPosts, getPost } from '@/lib/posts'
import { LICENSE, SITE } from '@/lib/site'
import type { Post } from '@/types/post'
import NotFoundPage from '@/pages/NotFoundPage'

/**
 * 文章详情页（懒加载：marked / DOMPurify / highlight.js 只在此页进入时下载）。
 * 布局：横幅标题（含阅读数）+ 正文 + 分享栏 + 版权声明 + 评论（排序/点赞）+ 上下篇。
 */
export default function PostPage() {
  const { year, month, day, slug } = useParams()
  const post = getPost(year ?? '', month ?? '', day ?? '', slug ?? '')
  useTitle(post?.meta.title)

  if (!post) return <NotFoundPage />
  return <PostContent post={post} />
}

function PostContent({ post }: { post: Post }) {
  const { t } = useLang()
  const { prev, next } = getAdjacentPosts(post)
  const contentRef = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [sorting, setSorting] = useState<GiscusSorting>('newest')
  const [activeToc, setActiveToc] = useState('')

  const LICENSE_NAME = LICENSE.name
  const LICENSE_URL = LICENSE.url

  // Markdown 渲染结果与目录（渲染期间派生，不做状态，避免多余渲染）
  const html = useMemo(() => renderMarkdown(post.raw), [post])
  const toc = useMemo(() => extractToc(html), [html])

  // 代码高亮：异步按需加载 highlight.js
  useEffect(() => {
    if (contentRef.current) void highlightCodeBlocks(contentRef.current)
  }, [html])

  // 目录滚动高亮（scrollspy）：顶部观察带内的标题为当前章节
  useEffect(() => {
    const el = contentRef.current
    if (!el || !toc.length) return
    const headings = toc
      .map((item) => el.querySelector(`#${CSS.escape(item.id)}`))
      .filter((h): h is HTMLElement => h !== null)
    if (!headings.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
        if (visible.length) setActiveToc(visible[0].id)
      },
      { rootMargin: '-72px 0px -72% 0px', threshold: 0 },
    )
    headings.forEach((h) => io.observe(h))
    return () => io.disconnect()
  }, [toc, html])

  // 正文图片：懒加载 + 点击放大（lightbox，容器级事件委托）
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    el.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
      img.loading = 'lazy'
    })
    const onClick = (e: Event) => {
      const img = (e.target as HTMLElement).closest('img')
      if (img) setLightbox(img.src)
    }
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [html])

  // Esc 关闭 lightbox
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox])

  const cats = post.meta.categories
  const tags = post.meta.tags

  return (
    <div className="post-page">
      <div className="post-banner">
        <div className="container">
          <h1 className="post-banner-title">{post.meta.title}</h1>
          <div className="post-banner-meta">
            <span>
              <Icon name="clock" size={13} /> {t('publishedOn')} {formatDate(post.date)}
            </span>
            {post.meta.updated ? (
              <span>
                <Icon name="clock" size={13} /> {t('updatedOn')} {formatDateTime(new Date(post.meta.updated))}
              </span>
            ) : null}
            <PageViews path={post.url} />
          </div>
        </div>
      </div>

      <div className="container layout">
        <div className="page-main">
          <article className="card post-article">
            <div className="post-tags">
              {cats.length > 0
                ? cats.map((cat) => (
                    <Link
                      key={cat.join('/')}
                      className="post-cat"
                      to={categoryUrl(cat.join('/'))}
                    >
                      <Icon name="folder" size={12} /> {cat.join(' / ')}
                    </Link>
                  ))
                : null}
              {tags.map((tag) => (
                <Link key={tag} className="post-tag" to={`/tags/${encodeURIComponent(tag)}/`}>
                  # {tag}
                </Link>
              ))}
            </div>

            <div
              ref={contentRef}
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {post.meta.description ? <p className="post-desc-note">{post.meta.description}</p> : null}

            <ShareBar url={post.url} title={post.meta.title} />
          </article>

          {/* 版权声明 */}
          <section className="card post-copyright">
            <div className="post-section-title">
              <Icon name="link" size={15} /> {t('copyrightNotice')}
            </div>
            <div className="post-copyright-row">
              <span className="post-copyright-label">{t('articleAuthor')}</span>
              <span>{SITE.author}</span>
            </div>
            <div className="post-copyright-row">
              <span className="post-copyright-label">{t('articleLink')}</span>
              <a href={post.url} target="_blank" rel="noopener noreferrer">
                {post.url}
              </a>
            </div>
            <div className="post-copyright-row">
              <span className="post-copyright-label">{t('copyrightNotice')}</span>
              <span>
                {t('licenseText', { license: LICENSE_NAME })}
                {'（'}
                <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer">
                  {LICENSE_NAME}
                </a>
                {'）'}
              </span>
            </div>
          </section>

          {/* 评论区：右上角点赞 + 排序切换 */}
          <section className="card post-comments">
            <div className="post-comments-head">
              <div className="post-section-title">
                <Icon name="comments" size={15} /> {t('comments')}
              </div>
              <div className="post-comments-tools">
                <div className="comment-sort" role="group" aria-label="评论排序">
                  <button
                    type="button"
                    className={sorting === 'newest' ? 'active' : ''}
                    onClick={() => setSorting('newest')}
                  >
                    {t('sortNewest')}
                  </button>
                  <button
                    type="button"
                    className={sorting === 'oldest' ? 'active' : ''}
                    onClick={() => setSorting('oldest')}
                  >
                    {t('sortOldest')}
                  </button>
                </div>
                <span className="comment-sort-tip" title={t('commentSortTip')}>
                  ⓘ
                </span>
                <LikeButton path={post.url} />
              </div>
            </div>
            <Giscus sorting={sorting} />
          </section>

          <nav className="post-pagination" aria-label="pagination">
            {prev ? (
              <Link className="post-pager" to={prev.url}>
                <span className="post-pager-label">
                  <Icon name="arrow-left" size={13} /> {t('prev')}
                </span>
                <span className="post-pager-title">{prev.meta.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link className="post-pager post-pager-next" to={next.url}>
                <span className="post-pager-label">
                  {t('next')} <Icon name="arrow-right" size={13} />
                </span>
                <span className="post-pager-title">{next.meta.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>

        <aside className="aside-content">
          {toc.length > 0 ? <TocCard title={t('toc')} items={toc} activeId={activeToc} /> : null}
        </aside>
      </div>

      {lightbox ? (
        <div className="lightbox" role="dialog" aria-label="图片预览" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" />
          <span className="lightbox-close" aria-hidden="true">
            ✕
          </span>
        </div>
      ) : null}
    </div>
  )
}
