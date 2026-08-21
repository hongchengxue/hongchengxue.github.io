import { Link } from 'react-router-dom'
import type { CountItem } from '@/types/post'

const TAG_COLORS = ['#4285f4', '#5b8cff', '#4a7dff', '#7db1ff', '#9ec5ff']

/** 标签云：字号按权重缩放，颜色循环取色 */
export function TagCloud({ tags }: { tags: CountItem[] }) {
  const max = tags[0]?.count ?? 1
  return (
    <div className="tag-cloud">
      {tags.map((tag, i) => (
        <Link
          key={tag.name}
          to={`/tags/${encodeURIComponent(tag.name)}/`}
          className="tag-item"
          style={{
            fontSize: `${(0.85 + (tag.count / max) * 0.9).toFixed(2)}rem`,
            color: TAG_COLORS[i % TAG_COLORS.length],
          }}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  )
}
