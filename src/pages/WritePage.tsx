import { useCallback, useEffect, useRef, useState } from 'react'
import { WriteCatPanel } from '@/components/WriteCatPanel'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'
import { buildFrontmatter, postFileName } from '@/lib/frontmatter-builder'
import { parseFrontmatter } from '@/lib/frontmatter'
import {
  b64decode,
  b64encode,
  deleteFile,
  getFile,
  getLastCommitTime,
  getLatestRun,
  GitHubError,
  listDir,
  putFile,
  type GitHubFileMeta,
} from '@/lib/github'
import { renderMarkdown } from '@/lib/markdown'
import { nowStr } from '@/lib/date'
import { GITHUB_REPO } from '@/lib/site'
import { siteStats } from '@/lib/stats'
import { getStorage, setStorage, STORAGE_KEYS } from '@/lib/storage'

/**
 * 写作台：在浏览器里写博客 / 管理文章 / 草稿箱。
 * - 暂存 → src/content/_drafts（不会上线）
 * - 发布 → src/content/posts（触发 CI 自动构建上线）
 * - 分类可选可新建（支持父子层级），Markdown 实时预览
 */
export default function WritePage() {
  const { t } = useLang()
  useTitle(t('write'))

  const [token, setToken] = useState(() => getStorage(STORAGE_KEYS.writeToken))
  const [tokenInput, setTokenInput] = useState(() => getStorage(STORAGE_KEYS.writeToken))
  const [hint, setHint] = useState({ text: t('writeTokenHint'), ok: false })

  const [title, setTitle] = useState('')
  const [catPath, setCatPath] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [catPanelOpen, setCatPanelOpen] = useState(false)

  const [editing, setEditing] = useState<{ path: string; sha: string; isDraft: boolean } | null>(null)
  const [drafts, setDrafts] = useState<GitHubFileMeta[]>([])
  const [published, setPublished] = useState<GitHubFileMeta[]>([])
  const [times, setTimes] = useState<Record<string, string>>({})

  const [preview, setPreview] = useState('')
  const previewTimer = useRef<number | undefined>(undefined)
  const buildTimer = useRef<number | undefined>(undefined)
  const catPaths = siteStats.catPaths

  const isDraftMode = editing?.isDraft ?? false
  const isEditMode = editing !== null

  const showHint = useCallback((text: string, ok = false) => setHint({ text, ok }), [])

  // ---------- 实时预览（防抖 250ms） ----------
  useEffect(() => {
    window.clearTimeout(previewTimer.current)
    previewTimer.current = window.setTimeout(() => {
      setPreview(content.trim() ? renderMarkdown(content) : '')
    }, 250)
    return () => window.clearTimeout(previewTimer.current)
  }, [content])

  // ---------- 构建进度轮询（发布/保存后提示上线状态） ----------
  const trackBuild = useCallback(() => {
    window.clearTimeout(buildTimer.current)
    let tries = 0
    const poll = () => {
      getLatestRun(token)
        .then((run) => {
          if (!run) {
            showHint(t('writeSavedHint'), true)
            return
          }
          tries += 1
          if (run.status === 'completed') {
            showHint(
              run.conclusion === 'success'
                ? '🎉 构建完成，网站已更新！'
                : '⚠️ 构建失败，请检查内容',
              run.conclusion === 'success',
            )
            return
          }
          showHint(
            run.status === 'in_progress' ? '✅ 已保存，正在自动构建上线…（构建中）' : '✅ 已保存，正在自动构建上线…（排队中）',
            true,
          )
          if (tries < 18) buildTimer.current = window.setTimeout(poll, 10000)
          else showHint('✅ 已保存！构建可能仍在进行，稍后刷新网站查看', true)
        })
        .catch(() => {
          if (tries < 18) buildTimer.current = window.setTimeout(poll, 10000)
        })
    }
    buildTimer.current = window.setTimeout(poll, 1500)
    return () => window.clearTimeout(buildTimer.current)
  }, [token, showHint, t])

  useEffect(() => () => window.clearTimeout(buildTimer.current), [])

  // ---------- 列表加载（草稿箱 + 已发布，并行请求） ----------
  const attachTimes = useCallback(
    (files: GitHubFileMeta[]) => {
      for (const f of files) {
        getLastCommitTime(f.path, token)
          .then((iso) => {
            if (!iso) return
            const d = new Date(iso)
            setTimes((prev) => ({ ...prev, [f.path]: `更新于 ${nowStr(d).slice(0, 16)}` }))
          })
          .catch(() => {})
      }
    },
    [token],
  )

  const loadList = useCallback(() => {
    if (!token) return
    Promise.all([listDir(GITHUB_REPO.draftsDir, token), listDir(GITHUB_REPO.postsDir, token)])
      .then(([draftFiles, postFiles]) => {
        const sortByName = (a: GitHubFileMeta, b: GitHubFileMeta) => b.name.localeCompare(a.name)
        setDrafts(draftFiles.sort(sortByName))
        setPublished(postFiles.sort(sortByName))
        attachTimes([...draftFiles, ...postFiles])
        showHint('已连接 ✅', true)
      })
      .catch((e: unknown) => {
        const msg = e instanceof GitHubError ? e.message : String(e)
        showHint(`连接失败：${msg}（检查令牌是否有 Contents 读写权限）`, false)
      })
  }, [token, attachTimes, showHint])

  // 令牌变化（含初始从 localStorage 恢复）时加载列表
  useEffect(() => {
    if (token) loadList()
  }, [token, loadList])

  // 分类面板：点击面板外部时关闭
  useEffect(() => {
    if (!catPanelOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest?.('.write-cat-box')) setCatPanelOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [catPanelOpen])

  const connect = () => {
    const tk = tokenInput.trim()
    if (!tk) {
      showHint('请先粘贴令牌', false)
      return
    }
    setToken(tk)
    setStorage(STORAGE_KEYS.writeToken, tk)
    showHint('正在加载文章列表…', true)
  }

  // ---------- 读取文章到编辑器 ----------
  const loadPost = useCallback(
    (path: string, isDraft: boolean) => {
      getFile(path, token)
        .then((meta) => {
          const raw = b64decode(meta.content)
          const parsed = parseFrontmatter(raw)
          setEditing({ path, sha: meta.sha, isDraft })
          if (parsed) {
            setTitle(parsed.meta.title)
            setCatPath(parsed.meta.categories[0]?.join('/') ?? '')
            setTags(parsed.meta.tags.join(', '))
            setContent(parsed.body)
          } else {
            setTitle('')
            setCatPath('')
            setTags('')
            setContent(raw)
          }
          showHint(`${isDraft ? '正在编辑草稿：' : '正在编辑：'}${path}`, true)
        })
        .catch((e: unknown) => {
          showHint(`读取失败：${e instanceof GitHubError ? e.message : String(e)}`, false)
        })
    },
    [token, showHint],
  )

  const newPost = useCallback(() => {
    setEditing(null)
    setTitle('')
    setCatPath('')
    setTags('')
    setContent('')
    setPreview('')
    showHint('新建文章模式', true)
  }, [showHint])

  // ---------- 组装正文（标题/分类/标签/正文 变化时重建） ----------
  const buildContent = useCallback((): string => {
    const tagList = tags
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean)
    return buildFrontmatter({ title: title.trim(), categoryPath: catPath, tags: tagList }) + content
  }, [title, catPath, tags, content])

  // ---------- 暂存草稿 ----------
  const saveDraft = useCallback(() => {
    if (!token) {
      showHint('请先粘贴令牌并连接', false)
      return
    }
    if (!title.trim()) {
      showHint('请填写文章标题', false)
      return
    }
    const encoded = b64encode(buildContent())

    const create = (dpath: string, isRetry = false) => {
      const path = isRetry ? dpath.replace(/\.md$/, `-${nowStr().slice(11).replace(/:/g, '')}.md`) : dpath
      putFile(path, token, encoded, `draft: ${title.trim()}`)
        .then(() => {
          setEditing({ path, sha: '', isDraft: true })
          showHint('✅ 已暂存到草稿箱（不会上线），可继续写或点"发布"', true)
          loadList()
        })
        .catch((e: unknown) => {
          if (!isRetry && e instanceof GitHubError && e.status === 422) {
            create(dpath, true)
          } else {
            showHint(`暂存失败：${e instanceof GitHubError ? e.message : String(e)}`, false)
          }
        })
    }

    if (editing && editing.isDraft) {
      getFile(editing.path, token)
        .then((m) =>
          putFile(editing.path, token, encoded, `draft: ${title.trim()}`, m.sha).then(() => {
            showHint('✅ 草稿已更新（未上线）', true)
            loadList()
          }),
        )
        .catch((e: unknown) => showHint(`暂存失败：${e instanceof GitHubError ? e.message : String(e)}`, false))
    } else if (editing && !editing.isDraft) {
      return // 已发布文章不提供暂存
    } else {
      create(`${GITHUB_REPO.draftsDir}/${postFileName(title.trim())}`)
    }
  }, [token, editing, title, buildContent, loadList, showHint])

  // ---------- 发布 / 保存 ----------
  const publish = useCallback(() => {
    if (!token) {
      showHint('请先粘贴令牌并连接', false)
      return
    }
    if (!title.trim()) {
      showHint('请填写文章标题', false)
      return
    }
    const encoded = b64encode(buildContent())
    const postTitle = title.trim()

    const done = () => {
      trackBuild()
      newPost()
      loadList()
    }

    if (editing && editing.isDraft) {
      // 草稿转正：建 post 文件 → 删草稿
      const target = `${GITHUB_REPO.postsDir}/${editing.path.replace(/^.*?_drafts\//, '')}`
      showHint('正在发布草稿…', true)
      putFile(target, token, encoded, `post: ${postTitle}`)
        .then(() => getFile(editing.path, token))
        .then((m) => deleteFile(editing.path, token, m.sha, `publish: ${postTitle}`))
        .then(() => {
          showHint('✅ 已发布！', true)
          done()
        })
        .catch((e: unknown) => showHint(`发布失败：${e instanceof GitHubError ? e.message : String(e)}`, false))
      return
    }

    const path = editing?.path ?? `${GITHUB_REPO.postsDir}/${postFileName(postTitle)}`
    showHint('正在保存…', true)
    putFile(path, token, encoded, `${editing ? 'update: ' : 'post: '}${postTitle}`, editing?.sha)
      .then(() => {
        showHint('✅ 已保存！', true)
        done()
      })
      .catch((e: unknown) => showHint(`保存失败：${e instanceof GitHubError ? e.message : String(e)}`, false))
  }, [token, editing, title, buildContent, loadList, newPost, showHint, trackBuild])

  // ---------- 列表操作：编辑 / 删除 / 发布草稿 ----------
  const onPublishedAction = (path: string, act: string) => {
    if (act === 'edit') {
      loadPost(path, false)
      return
    }
    if (!window.confirm(`确定删除 ${path} ？`)) return
    getFile(path, token)
      .then((m) => deleteFile(path, token, m.sha, `delete: ${path}`))
      .then(() => {
        showHint('已删除，约 2 分钟后网站自动更新', true)
        loadList()
      })
      .catch((e: unknown) => showHint(`删除失败：${e instanceof GitHubError ? e.message : String(e)}`, false))
  }

  const onDraftAction = (path: string, act: string) => {
    if (act === 'edit-draft') {
      loadPost(path, true)
      return
    }
    if (act === 'del-draft') {
      if (!window.confirm(`确定删除草稿 ${path} ？`)) return
      getFile(path, token)
        .then((m) => deleteFile(path, token, m.sha, `delete draft: ${path}`))
        .then(() => {
          showHint('草稿已删除', true)
          loadList()
        })
        .catch((e: unknown) => showHint(`删除失败：${e instanceof GitHubError ? e.message : String(e)}`, false))
      return
    }
    if (act === 'pub-draft') {
      // 直接把草稿文件内容搬移到 posts 目录后删除
      showHint('正在发布草稿…', true)
      getFile(path, token)
        .then((m) => {
          const target = `${GITHUB_REPO.postsDir}/${path.replace(/^.*?_drafts\//, '')}`
          return putFile(target, token, m.content, 'post: publish draft').then(() =>
            deleteFile(path, token, m.sha, `publish draft: ${path}`),
          )
        })
        .then(() => {
          showHint('✅ 草稿已发布！', true)
          trackBuild()
          newPost()
          loadList()
        })
        .catch((e: unknown) => showHint(`发布失败：${e instanceof GitHubError ? e.message : String(e)}`, false))
    }
  }

  const modeBadge = isDraftMode
    ? t('writeModeDraft')
    : isEditMode
      ? t('writeModeEdit')
      : t('writeModeNew')

  return (
    <div className="container">
      <div className="write-app">
        <div className="card write-card">
          <div className="write-head">{t('writeDesk')}</div>
          <div className="write-token-row">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder={t('writeTokenPlaceholder')}
              autoComplete="off"
            />
            <button type="button" onClick={connect}>
              {t('writeConnect')}
            </button>
          </div>
          <p className={hint.ok ? 'write-hint ok' : 'write-hint'}>{hint.text}</p>
        </div>

        <div className="card write-card">
          <div className="write-row">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('writeTitle')} autoComplete="off" />
            <div className="write-cat-box">
              <input
                value={catPath}
                onChange={(e) => setCatPath(e.target.value)}
                onFocus={() => setCatPanelOpen(true)}
                onClick={() => setCatPanelOpen(true)}
                placeholder={t('writeCat')}
                autoComplete="off"
              />
              {catPanelOpen ? (
                <WriteCatPanel
                  catPaths={catPaths}
                  onSelect={(p) => {
                    setCatPath(p)
                    setCatPanelOpen(false)
                  }}
                />
              ) : null}
            </div>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t('writeTags')} autoComplete="off" />
          </div>
          <div className="write-editor-row">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('writeContent')}
            />
            <div className="write-preview">
              {preview ? (
                <div className="markdown-body" dangerouslySetInnerHTML={{ __html: preview }} />
              ) : (
                <div className="write-preview-empty">{t('writePreviewEmpty')}</div>
              )}
            </div>
          </div>
          <div className="write-actions">
            <span className="write-mode-badge">{modeBadge}</span>
            {!isEditMode || isDraftMode ? (
              <button type="button" onClick={saveDraft}>
                {isDraftMode ? t('writeUpdateDraft') : t('writeDraft')}
              </button>
            ) : null}
            <button type="button" onClick={publish}>
              {t('writePublish')}
            </button>
            <button type="button" onClick={newPost}>
              {t('writeClear')}
            </button>
          </div>
        </div>

        <div className="card write-card">
          <div className="write-head2">{t('writeDraftBox')}</div>
          <ul className="write-list">
            {drafts.length > 0 ? (
              drafts.map((f) => (
                <li key={f.path} className="write-item">
                  <span className="write-item-name">{f.name}</span>
                  <span className="write-item-time">{times[f.path] ?? ''}</span>
                  <span className="write-item-actions">
                    <button type="button" onClick={() => onDraftAction(f.path, 'edit-draft')}>
                      {t('writeEdit')}
                    </button>
                    <button type="button" onClick={() => onDraftAction(f.path, 'pub-draft')}>
                      {t('writePublishDraft')}
                    </button>
                    <button type="button" onClick={() => onDraftAction(f.path, 'del-draft')}>
                      {t('writeDelete')}
                    </button>
                  </span>
                </li>
              ))
            ) : (
              <li className="write-item">
                <span className="write-item-name">{t('searchEmpty')}</span>
              </li>
            )}
          </ul>
        </div>

        <div className="card write-card">
          <div className="write-head2">{t('writePublishedBox')}</div>
          <ul className="write-list">
            {published.length > 0 ? (
              published.map((f) => (
                <li key={f.path} className="write-item">
                  <span className="write-item-name">{f.name}</span>
                  <span className="write-item-time">{times[f.path] ?? ''}</span>
                  <span className="write-item-actions">
                    <button type="button" onClick={() => onPublishedAction(f.path, 'edit')}>
                      {t('writeEdit')}
                    </button>
                    <button type="button" onClick={() => onPublishedAction(f.path, 'del')}>
                      {t('writeDelete')}
                    </button>
                  </span>
                </li>
              ))
            ) : (
              <li className="write-item">
                <span className="write-item-name">{t('searchEmpty')}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
