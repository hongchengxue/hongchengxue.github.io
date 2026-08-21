import { useEffect, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Giscus } from '@/components/Giscus'
import { Icon } from '@/components/Icon'
import { LikeButton } from '@/components/LikeButton'
import { TocCard } from '@/components/AsideCards'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'
import { formatDate, formatDateTime } from '@/lib/date'
import { extractToc, highlightCodeBlocks, renderMarkdown } from '@/lib/markdown'
import { getAdjacentPosts, getPost } from '@/lib/posts'
import type { Post } from '@/types/post'
import NotFoundPage from '@/pages/NotFoundPage'

/**
 * 文章详情页（懒加载：marked / DOMPurify / highlight.js 只在此页进入时下载）。
 * 布局：横幅标题 + 正文 + 目录侧栏 + 点赞 + Giscus 评论 + 上下篇。
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

  // Markdown 渲染结果与目录（渲染期间派生，不做状态，避免多余渲染）
  const html = useMemo(() => renderMarkdown(post.raw), [post])
  const toc = useMemo(() => extractToc(html), [html])

  // 代码高亮：异步按需加载 highlight.js
  useEffect(() => {
    if (contentRef.current) void highlightCodeBlocks(contentRef.current)
  }, [html])

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
                      to={`/categories/${encodeURIComponent(cat.join('/'))}/`}
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
          </article>

          <LikeButton path={post.url} />

          <section className="card post-comments">
            <div className="post-section-title">
              <Icon name="comments" size={15} /> {t('comments')}
            </div>
            <Giscus />
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
          {toc.length > 0 ? <TocCard title={t('toc')} items={toc} /> : null}
        </aside>
      </div>
    </div>
  )
}
