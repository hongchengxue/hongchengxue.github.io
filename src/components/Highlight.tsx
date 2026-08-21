import { Fragment } from 'react'

/** 关键词高亮：不区分大小写，把命中片段包进 <mark> */
export function Highlight({ text, keyword }: { text: string; keyword: string }) {
  const k = keyword.trim()
  if (!k) return <>{text}</>
  const lower = text.toLowerCase()
  const target = k.toLowerCase()
  const parts: React.ReactNode[] = []
  let last = 0
  let idx = lower.indexOf(target)
  while (idx >= 0) {
    if (idx > last) parts.push(text.slice(last, idx))
    parts.push(<mark key={`${idx}-${text.slice(idx, idx + k.length)}`}>{text.slice(idx, idx + k.length)}</mark>)
    last = idx + k.length
    idx = lower.indexOf(target, last)
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>
}
