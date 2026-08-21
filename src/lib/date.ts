/** 标题 → 文件名 slug（用于写作台生成文件名） */
export function slugify(title: string): string {
  const s = title
    .trim()
    .replace(/[\\/:*?"<>|#\s]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || 'untitled'
}

/** 当前时间字符串：YYYY-MM-DD HH:mm:ss */
export function nowStr(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/** 日期 → YYYY-MM-DD */
export function formatDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** 日期 → YYYY-MM-DD HH:mm */
export function formatDateTime(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${formatDate(d)} ${p(d.getHours())}:${p(d.getMinutes())}`
}
