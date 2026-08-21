import { Link } from 'react-router-dom'
import type { Post } from '@/types/post'

interface TreeItem {
  post: Post
  year: string
  month: string
  day: string
}

/** 归档侧边栏「全部文章」折叠树：年 → 月 → 日 → 文章 */
export function ArticleTree({ all }: { all: TreeItem[] }) {
  // 用 Map 分组建树，避免多次 filter（js-index-maps）
  const byYear = new Map<string, Map<string, Map<string, Post[]>>>()
  for (const item of all) {
    let byMonth = byYear.get(item.year)
    if (!byMonth) {
      byMonth = new Map()
      byYear.set(item.year, byMonth)
    }
    let byDay = byMonth.get(item.month)
    if (!byDay) {
      byDay = new Map()
      byMonth.set(item.month, byDay)
    }
    const list = byDay.get(item.day) ?? []
    list.push(item.post)
    byDay.set(item.day, list)
  }

  const years = [...byYear.keys()].sort((a, b) => b.localeCompare(a))

  return (
    <div className="all-articles-tree">
      {years.map((year) => {
        const byMonth = byYear.get(year)!
        const months = [...byMonth.keys()].sort((a, b) => b.localeCompare(a))
        const yearCount = [...byMonth.values()].reduce(
          (sum, m) => sum + [...m.values()].reduce((s, list) => s + list.length, 0),
          0,
        )
        return (
          <details key={year} className="aa-year" open>
            <summary>
              {year}年 <span className="aa-count">{yearCount}</span>
            </summary>
            {months.map((month) => {
              const byDay = byMonth.get(month)!
              const days = [...byDay.keys()].sort((a, b) => b.localeCompare(a))
              const monthCount = [...byDay.values()].reduce((s, list) => s + list.length, 0)
              return (
                <details key={month} className="aa-month" open>
                  <summary>
                    {Number(month)}月 <span className="aa-count">{monthCount}</span>
                  </summary>
                  {days.map((day) => {
                    const list = byDay.get(day)!
                    return (
                      <details key={day} className="aa-day">
                        <summary>
                          {Number(day)}日 <span className="aa-count">{list.length}</span>
                        </summary>
                        {list.map((p) => (
                          <Link key={p.url} className="aa-item" to={p.url}>
                            {p.meta.title}
                          </Link>
                        ))}
                      </details>
                    )
                  })}
                </details>
              )
            })}
          </details>
        )
      })}
    </div>
  )
}
