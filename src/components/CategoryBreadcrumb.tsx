import { Link } from 'react-router-dom'
import { useLang } from '@/hooks/useLang'
import { categoryUrl } from '@/lib/categories'

/** 分类页面包屑：全部分类 / 父级 / 当前 + 返回上一级按钮 */
export function CategoryBreadcrumb({ segments }: { segments: string[] }) {
  const { t } = useLang()
  if (!segments.length) return null

  const crumbs = []
  let path = ''
  for (let i = 0; i < segments.length - 1; i++) {
    path = path ? `${path}/${segments[i]}` : segments[i]
    crumbs.push(
      <span key={path} className="cat-bc-group">
        <span className="cat-bc-sep">/</span>
        <Link to={categoryUrl(path)}>{segments[i]}</Link>
      </span>,
    )
  }
  const current = segments[segments.length - 1]
  const parentPath = segments.length > 1 ? categoryUrl(segments.slice(0, -1).join('/')) : '/categories/'

  return (
    <div className="cat-breadcrumb">
      <Link to="/categories/">{t('allCategories')}</Link>
      {crumbs}
      <span className="cat-bc-group">
        <span className="cat-bc-sep">/</span>
        <span className="cat-bc-current">{current}</span>
      </span>
      <Link className="cat-bc-back" to={parentPath}>
        {segments.length > 1 ? `← ${t('back')}` : `← ${t('backAll')}`}
      </Link>
    </div>
  )
}
