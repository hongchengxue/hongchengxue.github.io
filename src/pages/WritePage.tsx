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
import { slugify } from '@/lib/slug'
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
  const [helpOpen, setHelpOpen] = useState(false)

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
    // 草稿箱目录可能还不存在（git 不提交空目录）：404 视为空列表，不阻断连接
    const listOrEmpty = (dir: string) =>
      listDir(dir, token).catch((e: unknown) => {
        if (e instanceof GitHubError && e.status === 404) return []
        throw e
      })
    Promise.all([listOrEmpty(GITHUB_REPO.draftsDir), listOrEmpty(GITHUB_REPO.postsDir)])
      .then(([draftFiles, postFiles]) => {
        const sortByName = (a: GitHubFileMeta, b: GitHubFileMeta) => b.name.localeCompare(a.name)
        setDrafts(draftFiles.sort(sortByName))
        setPublished(postFiles.sort(sortByName))
        attachTimes([...draftFiles, ...postFiles])
        showHint('已连接 ✅', true)
      })
      .catch((e: unknown) => {
        const err = e instanceof GitHubError ? e : null
        const msg = err ? err.message : String(e)
        const hint =
          err && (err.status === 401 || err.status === 403)
            ? `连接失败：${msg}。令牌无效或缺少 Contents 读写权限，点下方「令牌获取教程」检查`
            : `连接失败：${msg}。请检查网络后重试，或点下方「令牌获取教程」`
        showHint(hint, false)
        setHelpOpen(true)
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

  // ---------- 格式工具栏：在光标处插入 Markdown 语法 ----------
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const insertAtCursor = useCallback((before: string, after = '', placeholder = '') => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const cur = el.value // 取 textarea 实时值，避免异步上传后读到过期内容
    const selected = cur.slice(start, end) || placeholder
    const next = cur.slice(0, start) + before + selected + after + cur.slice(end)
    setContent(next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + before.length + selected.length
      el.setSelectionRange(pos, pos + after.length)
    })
  }, [])

  const onToolbarAction = useCallback(
    (act: string) => {
      if (act === 'image') {
        fileInputRef.current?.click()
        return
      }
      if (act === 'video') {
        const url = window.prompt('粘贴视频链接（B站 / YouTube / mp4 直链）')
        if (url?.trim()) insertAtCursor(`\n:::video ${url.trim()}\n:::\n`)
        return
      }
      if (act === 'callout') {
        const kind = (window.prompt('提示框类型：tip / info / warning / danger（默认 tip）') ?? 'tip').trim() || 'tip'
        insertAtCursor(`\n:::${kind} 提示标题\n\n提示内容\n:::\n`)
        return
      }
      if (act === 'details') return insertAtCursor('\n<details><summary>点击展开</summary>\n\n', '\n\n</details>\n', '折叠内容')
      if (act === 'bold') return insertAtCursor('**', '**', '加粗文字')
      if (act === 'italic') return insertAtCursor('*', '*', '斜体文字')
      if (act === 'strike') return insertAtCursor('~~', '~~', '删除线文字')
      if (act === 'mark') return insertAtCursor('==', '==', '高亮文字')
      if (act === 'inline-code') return insertAtCursor('`', '`', '代码')
      if (act === 'h1') return insertAtCursor('\n# ', '', '标题')
      if (act === 'h2') return insertAtCursor('\n## ', '', '标题')
      if (act === 'h3') return insertAtCursor('\n### ', '', '标题')
      if (act === 'link') return insertAtCursor('[', '](https://)', '链接文字')
      if (act === 'quote') return insertAtCursor('\n> ', '', '引用内容')
      if (act === 'code') return insertAtCursor('\n```\n', '\n```\n', '代码')
      if (act === 'bullet') return insertAtCursor('\n- ', '', '列表项')
      if (act === 'number') return insertAtCursor('\n1. ', '', '列表项')
      if (act === 'task') return insertAtCursor('\n- [ ] ', '', '任务事项')
      if (act === 'hr') return insertAtCursor('\n\n---\n\n')
      if (act === 'table')
        return insertAtCursor('\n| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |\n')
    },
    [insertAtCursor],
  )

  /** 选择图片 → 上传到仓库 public/img/posts/ → 插入图片语法 */
  const onImagePicked = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = '' // 允许重复选择同一文件
      if (!file) return
      if (!token) {
        showHint('请先粘贴令牌并连接', false)
        return
      }
      if (file.size > 8 * 1024 * 1024) {
        showHint('图片超过 8MB，请先压缩后再上传（GitHub 接口限制）', false)
        return
      }
      const ext = (file.name.match(/\.([^.]+)$/)?.[1] ?? 'png').toLowerCase().replace(/[^a-z0-9]/g, '')
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = String(reader.result).split(',')[1] ?? ''
        const name = `${nowStr().slice(0, 10)}-${slugify(file.name.replace(/\.[^.]+$/, ''))}.${ext}`
        showHint('正在上传图片…', true)
        putFile(`public/img/posts/${name}`, token, base64, `image: ${name}`)
          .then(() => {
            insertAtCursor(`![${name.replace(/\.[^.]+$/, '')}](/img/posts/${name})`)
            showHint('✅ 图片已上传并插入正文', true)
          })
          .catch((err: unknown) => {
            showHint(`图片上传失败：${err instanceof GitHubError ? err.message : String(err)}`, false)
          })
      }
      reader.readAsDataURL(file)
    },
    [token, insertAtCursor, showHint],
  )

  /**
   * 工具栏按钮定义（分组展示，仿 Obsidian Editing Toolbar / Word 风格）。
   * 想增删按钮：在对应分组加一行 { act, label, title }，并在 onToolbarAction 中实现插入逻辑。
   */
  const TOOLBAR_GROUPS: { act: string; label: React.ReactNode; title: string }[][] = [
    // 标题
    [
      { act: 'h1', label: 'H1', title: '一级标题' },
      { act: 'h2', label: 'H2', title: '二级标题' },
      { act: 'h3', label: 'H3', title: '三级标题' },
    ],
    // 文字样式
    [
      { act: 'bold', label: <b>B</b>, title: '加粗' },
      { act: 'italic', label: <i>I</i>, title: '斜体' },
      { act: 'strike', label: <s>S</s>, title: '删除线' },
      { act: 'mark', label: '==', title: '高亮' },
      { act: 'inline-code', label: '`', title: '行内代码' },
    ],
    // 列表 / 段落
    [
      { act: 'bullet', label: '•', title: '无序列表' },
      { act: 'number', label: '1.', title: '有序列表' },
      { act: 'task', label: '☑', title: '任务清单' },
      { act: 'quote', label: '❝', title: '引用' },
      { act: 'hr', label: '—', title: '分割线' },
    ],
    // 插入
    [
      { act: 'link', label: '🔗', title: '链接' },
      { act: 'image', label: '🖼', title: '上传图片' },
      { act: 'video', label: '🎬', title: '视频' },
      { act: 'table', label: '▦', title: '表格' },
      { act: 'code', label: '{ }', title: '代码块' },
      { act: 'callout', label: '💡', title: '提示框' },
      { act: 'details', label: '📁', title: '折叠块' },
    ],
  ]

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

        <details
          className="write-help"
          open={helpOpen}
          onToggle={(e) => setHelpOpen(e.currentTarget.open)}
        >
          <summary>🔑 令牌获取教程（第一次使用必看 / 连接失败时自动展开）</summary>
          <div className="write-help-body">
            <p>
              写作台通过你的 GitHub 令牌把文章写入仓库，令牌<b>只保存在你的浏览器里</b>，不会上传到任何地方。按下面 6 步获取：
            </p>
            <ol>
              <li>
                打开{' '}
                <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                  github.com/settings/tokens
                </a>{' '}
                （需登录 GitHub）
              </li>
              <li>
                点右上角 <b>Generate new token</b> → 选 <b>Fine-grained personal access token</b>
              </li>
              <li>
                Token name 随便填（如 write-desk）；Expiration 有效期选 <b>90 天</b> 或 No expiration
              </li>
              <li>
                Repository access → 选 <b>Only select repositories</b> → 勾选{' '}
                <b>hongchengxue/hongchengxue.github.io</b>
              </li>
              <li>
                Permissions → Repository permissions → 找到 <b>Contents</b> → 设为 <b>Read and write</b>
              </li>
              <li>
                点最下方 <b>Generate token</b>，复制以 <code>github_pat_</code> 开头的字符串，粘贴到上方输入框，点「连接」
              </li>
            </ol>
            <p className="write-help-faq-title">常见问题排查：</p>
            <ul>
              <li>
                <b>403 / 401（权限不足）</b>：令牌过期，或没把 Contents 设为 Read and write → 重新生成或编辑令牌权限
              </li>
              <li>
                <b>Not Found</b>：通常是草稿箱目录还不存在，属正常情况（已自动处理为空），不会影响连接
              </li>
              <li>
                <b>网络失败</b>：检查网络 / 代理是否正常，稍后重试
              </li>
              <li>令牌建议 90 天过期；到期后重新生成并粘贴新令牌即可</li>
            </ul>
          </div>
        </details>

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
          <div className="write-toolbar" role="toolbar" aria-label="格式工具栏">
            {TOOLBAR_GROUPS.map((group, gi) => (
              <div key={gi} className="write-tb-group">
                {group.map((btn) => (
                  <button
                    key={btn.act}
                    type="button"
                    className={btn.act === 'bold' ? 'tb-bold' : btn.act === 'italic' ? 'tb-italic' : ''}
                    title={btn.title}
                    onClick={() => onToolbarAction(btn.act)}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            ))}
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onImagePicked} />
          </div>
          <div className="write-editor-row">
            <textarea
              ref={textareaRef}
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
