/**
 * GitHub Contents API 客户端（写作台使用）。
 * 由 token 鉴权，所有操作仅作用于站点仓库内的 markdown 文件。
 * 注意：API 默认操作仓库的「默认分支」，本站内容在 V2 分支，
 *       因此所有读写都必须显式携带 branch 参数，否则会 404 或写错分支。
 */
import { GITHUB_REPO } from '@/lib/site'

const API = `https://api.github.com/repos/${GITHUB_REPO.repo}/contents/`

export class GitHubError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'GitHubError'
    this.status = status
  }
}

export interface GitHubFileMeta {
  name: string
  path: string
  sha: string
}

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
  }
}

async function request(path: string, token: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(API + path, { ...init, headers: { ...headers(token), ...(init?.headers ?? {}) } })
  const json: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = (json as { message?: string } | null)?.message ?? `HTTP ${res.status}`
    throw new GitHubError(msg, res.status)
  }
  return json
}

/** 列出目录下的文件（指定分支） */
export async function listDir(dir: string, token: string): Promise<GitHubFileMeta[]> {
  const json = await request(`${dir}?ref=${encodeURIComponent(GITHUB_REPO.branch)}`, token)
  return (json as GitHubFileMeta[]).filter((f) => f.name.endsWith('.md'))
}

/** 读取文件（指定分支；返回 base64 内容与 sha） */
export async function getFile(path: string, token: string): Promise<{ content: string; sha: string }> {
  const json = (await request(`${path}?ref=${encodeURIComponent(GITHUB_REPO.branch)}`, token)) as {
    content?: string
    sha: string
  }
  return { content: json.content ?? '', sha: json.sha }
}

/** 创建或更新文件（content 为 base64；写入指定分支） */
export async function putFile(
  path: string,
  token: string,
  content: string,
  message: string,
  sha?: string,
): Promise<void> {
  const body: Record<string, string> = { message, content, branch: GITHUB_REPO.branch }
  if (sha) body.sha = sha
  await request(path, token, { method: 'PUT', body: JSON.stringify(body) })
}

/** 删除文件（指定分支） */
export async function deleteFile(path: string, token: string, sha: string, message: string): Promise<void> {
  await request(path, token, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch: GITHUB_REPO.branch }),
  })
}

/** 文件最近提交时间（指定分支；用于列表显示「更新于 …」） */
export async function getLastCommitTime(path: string, token: string): Promise<string | null> {
  const url = `https://api.github.com/repos/${GITHUB_REPO.repo}/commits?sha=${encodeURIComponent(GITHUB_REPO.branch)}&path=${encodeURIComponent(path)}&per_page=1`
  const res = await fetch(url, { headers: headers(token) })
  if (!res.ok) return null
  const arr = (await res.json()) as { commit?: { committer?: { date?: string } } }[]
  const t = arr[0]?.commit?.committer?.date
  return t ?? null
}

/** 最近一次 CI 构建状态（指定分支；用于「已保存，正在构建上线」提示） */
export async function getLatestRun(token: string): Promise<{ status: string; conclusion: string | null } | null> {
  const url = `https://api.github.com/repos/${GITHUB_REPO.repo}/actions/runs?branch=${encodeURIComponent(GITHUB_REPO.branch)}&per_page=1`
  const res = await fetch(url, { headers: headers(token) })
  if (res.status === 403 || res.status === 401) return null
  if (!res.ok) return null
  const json = (await res.json()) as { workflow_runs?: { status: string; conclusion: string | null }[] }
  const run = json.workflow_runs?.[0]
  return run ? { status: run.status, conclusion: run.conclusion } : null
}

/** UTF-8 安全的 base64 编解码 */
export function b64encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

export function b64decode(b64: string): string {
  return decodeURIComponent(escape(atob(b64)))
}
