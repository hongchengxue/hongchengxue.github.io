/** 标题 → 文件名 slug（用于写作台生成文件名） */
export function slugify(title: string): string {
  const s = title
    .trim()
    .replace(/[\\/:*?"<>|#\s]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || 'untitled'
}
