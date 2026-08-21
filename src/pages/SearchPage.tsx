import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Highlight } from '@/components/Highlight'
import { Icon } from '@/components/Icon'
import { PageHeader } from '@/components/PageHeader'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'
import { searchPosts } from '@/lib/search'

/** 搜索结果页：读取 ?q=，检索运行时索引，高亮关键词 */
export default function SearchPage() {
  const { t } = useLang()
  const [searchParams, setSearchParams] = useSearchParams()
  const [value, setValue] = useState(() => searchParams.get('q') ?? '')
  const q = searchParams.get('q') ?? ''
  useTitle(t('search'))

  const results = useMemo(() => searchPosts(q), [q])

  const submit = () => {
    const v = value.trim()
    if (!v) return
    setSearchParams({ q: v })
  }

  return (
    <div className="container">
      <PageHeader title={t('search')} icon="search" />
      <div className="search-page">
        <div className="search-page-input-wrap">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
            }}
            placeholder={t('searchInputPlaceholder')}
            aria-label={t('search')}
            autoComplete="off"
          />
          <button type="button" onClick={submit}>
            {t('searchBtn')}
          </button>
        </div>

        {!q ? (
          <p className="search-page-empty">{t('searchEmpty')}</p>
        ) : results.length === 0 ? (
          <p className="search-page-empty">{t('searchNoResult', { kw: q })}</p>
        ) : (
          <>
            <p className="search-page-stats">{t('searchStats', { n: results.length })}</p>
            <div className="search-page-list">
              {results.map((hit) => (
                <a key={hit.post.url} className="search-page-item" href={hit.post.url}>
                  <span className="search-page-title">
                    {hit.titleHit ? <Highlight text={hit.post.meta.title} keyword={q} /> : hit.post.meta.title}
                  </span>
                  {hit.snippet ? (
                    <span className="search-page-snippet">
                      <Highlight text={hit.snippet} keyword={q} />
                    </span>
                  ) : null}
                  {hit.post.meta.categories[0] ? (
                    <span className="search-page-cat">
                      <Icon name="folder" size={11} /> {hit.post.meta.categories[0].join('/')}
                    </span>
                  ) : null}
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
