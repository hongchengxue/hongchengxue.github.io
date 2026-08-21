import { Link } from 'react-router-dom'
import { Icon } from '@/components/Icon'
import { PageHeader } from '@/components/PageHeader'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'
import { buildCategoryTree, countSubtree, type CatNode } from '@/lib/categories'
import { siteStats } from '@/lib/stats'

function CatCard({ node }: { node: CatNode }) {
  return (
    <div className="cat-card">
      <Link to={`/categories/${encodeURIComponent(node.path)}/`} className="cat-card-head">
        <Icon name="folder" size={15} />
        <span className="cat-card-name">{node.name}</span>
        <span className="cat-card-count">{countSubtree(node)}</span>
      </Link>
      {node.children.length > 0 ? (
        <div className="cat-card-children">
          {node.children.map((child) => (
            <Link key={child.path} to={`/categories/${encodeURIComponent(child.path)}/`}>
              {child.name}
              <span className="cat-card-count">{countSubtree(child)}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** 分类总览页：按树形展示全部分类（含子分类） */
export default function CategoriesPage() {
  const { t } = useLang()
  useTitle(t('categories'))
  const tree = buildCategoryTree(siteStats.catPaths)

  return (
    <div className="container">
      <PageHeader title={t('categories')} icon="folder" />
      <div className="cat-grid">
        {tree.map((node) => (
          <CatCard key={node.path} node={node} />
        ))}
      </div>
    </div>
  )
}
