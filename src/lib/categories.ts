/** 分类树：把分类路径列表（技术文章/AI）构建为树形结构 */
export interface CatNode {
  name: string
  /** 完整路径，如 技术文章/AI */
  path: string
  count: number
  children: CatNode[]
}

export function buildCategoryTree(paths: string[]): CatNode[] {
  const root: CatNode = { name: '', path: '', count: 0, children: [] }
  for (const p of paths) {
    const parts = p.split('/').filter(Boolean)
    let node = root
    let acc = ''
    for (const part of parts) {
      acc = acc ? `${acc}/${part}` : part
      let child = node.children.find((c) => c.name === part)
      if (!child) {
        child = { name: part, path: acc, count: 0, children: [] }
        node.children.push(child)
      }
      node = child
    }
    node.count += 1
  }
  const sort = (nodes: CatNode[]) => {
    nodes.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'))
    for (const n of nodes) sort(n.children)
  }
  sort(root.children)
  return root.children
}

/** 收集某分类下全部文章（含子分类） */
export function isInCategory(postCats: string[][], catPath: string): boolean {
  const target = catPath.replace(/\/+$/, '')
  return postCats.some((cats) => {
    const p = cats.join('/')
    return p === target || p.startsWith(target + '/')
  })
}

/** 节点及其子树下的文章总数 */
export function countSubtree(node: CatNode): number {
  let total = node.count
  for (const child of node.children) total += countSubtree(child)
  return total
}

/**
 * 分类 URL：每一级单独编码（不能用 encodeURIComponent 编码整个路径，
 * 否则斜杠会变成 %2F，导致面包屑无法识别层级）。
 * 例：技术文章/AI → /categories/%E6%8A%80%E6%9C%AF%E6%96%87%E7%AB%A0/AI/
 */
export function categoryUrl(path: string): string {
  const segs = path.split('/').filter(Boolean)
  if (!segs.length) return '/categories/'
  return `/categories/${segs.map(encodeURIComponent).join('/')}/`
}
