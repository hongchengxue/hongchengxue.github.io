/**
 * 文章点赞（iine 后端，自研客户端）。
 * 访客免登录、免注册、无跟踪；记录存于 localStorage，计数由 Supabase RPC 提供。
 */
const API = 'https://vhiweeypifbwacashxjz.supabase.co'
const KEY = 'sb_publishable_EoB7MFJhCmb6PiAk-GPJ4w_PGhQ44Ru'

async function rpc<T>(fn: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`rpc ${fn} failed: ${res.status}`)
  return (await res.json()) as T
}

/** 查询多个页面路径的点赞数 */
export async function getHits(pageSlugs: string[]): Promise<Record<string, number>> {
  const data = await rpc<Record<string, number>>('get_hits', { page_slugs: pageSlugs })
  return data ?? {}
}

/** 点赞 +1 */
export async function incrementHits(pageSlug: string): Promise<void> {
  await rpc('increment_hits', { page_slug: pageSlug })
}
