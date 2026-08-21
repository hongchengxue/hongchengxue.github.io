import { useMemo, useState } from 'react'
import { useLang } from '@/hooks/useLang'
import { buildCategoryTree, type CatNode } from '@/lib/categories'

/** 写作台：分类折叠树选择面板（支持点击选择 / 折叠 / 新建分类） */
export function WriteCatPanel({
  catPaths,
  onSelect,
}: {
  catPaths: string[]
  onSelect: (path: string) => void
}) {
  const { t } = useLang()
  const tree = useMemo(() => buildCategoryTree(catPaths), [catPaths])
  const [folded, setFolded] = useState<ReadonlySet<string>>(new Set())
  const [newCat, setNewCat] = useState('')

  const toggle = (path: string) => {
    setFolded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const renderNode = (node: CatNode) => {
    const isFolded = folded.has(node.path)
    return (
      <div key={node.path} className="write-cat-node">
        {node.children.length > 0 ? (
          <>
            <div className="write-cat-branch">
              <button
                type="button"
                className="write-cat-caret"
                onClick={() => toggle(node.path)}
                aria-label={isFolded ? 'expand' : 'collapse'}
              >
                {isFolded ? '▸' : '▾'}
              </button>
              <button type="button" className="write-cat-branch-name" onClick={() => onSelect(node.path)}>
                {node.name}
              </button>
            </div>
            {!isFolded ? <div className="write-cat-children">{node.children.map(renderNode)}</div> : null}
          </>
        ) : (
          <button type="button" className="write-cat-option" onClick={() => onSelect(node.path)}>
            {node.name}
          </button>
        )}
      </div>
    )
  }

  const submitNew = () => {
    const v = newCat.trim()
    if (!v) return
    onSelect(v)
    setNewCat('')
  }

  return (
    <div className="write-cat-panel" onClick={(e) => e.stopPropagation()}>
      <div className="write-cat-panel-head">{t('writeCatPanelHead')}</div>
      <div className="write-cat-options">
        {tree.length > 0 ? (
          tree.map(renderNode)
        ) : (
          <div className="write-cat-none">{t('searchEmpty')}</div>
        )}
      </div>
      <div className="write-cat-new-row">
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitNew()
          }}
          placeholder={t('writeNewCat')}
          autoComplete="off"
        />
        <button type="button" onClick={submitNew}>
          {t('writeNewCatBtn')}
        </button>
      </div>
    </div>
  )
}
