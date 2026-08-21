# hong 的知识库

我的个人网站：技术文章 + 生活随笔。

- 框架：**Vite + React 19 + TypeScript**（由 Hexo + Butterfly 重构而来）
- 托管：[GitHub Pages](https://pages.github.com/)（GitHub Actions 自动构建部署）
- 网站地址：https://hongchengxue.github.io

---

## 📁 项目结构（模块化总览）

```
├── index.html                  # HTML 入口（主题预初始化 + 百度统计）
├── vite.config.ts              # Vite 配置（路径别名 @、构建时间注入）
├── .github/workflows/pages.yml # 部署流水线
├── public/                     # 原样拷贝的静态资源
│   ├── img/                    #   图片（头像、背景、favicon）
│   ├── games/                  #   独立静态游戏页（五子棋/贪吃蛇）
│   └── 404.html                #   SPA 深链接回退
└── src/
    ├── main.tsx                # 入口：挂载 React + 恢复深链接路径
    ├── App.tsx                 # 路由表（路径与旧站永久链接保持一致）
    ├── content/posts/*.md      # 📝 文章（新增文章 = 放一个 .md 文件）
    ├── types/                  # 共享类型（Post、SiteStats…）
    ├── lib/                    # 纯逻辑模块（无 UI）
    │   ├── posts.ts            #   文章加载（构建时打包 Markdown）
    │   ├── frontmatter.ts      #   front matter 解析
    │   ├── markdown.ts         #   Markdown 渲染 + 消毒 + 代码高亮
    │   ├── search.ts           #   站内搜索索引与匹配
    │   ├── stats.ts            #   全站统计（运行时推导）
    │   ├── categories.ts       #   分类树
    │   ├── i18n.ts             #   中英文案词典
    │   ├── github.ts           #   GitHub Contents API 客户端（写作台）
    │   ├── like.ts             #   点赞后端（Supabase RPC）
    │   └── site.ts             #   站点配置（集中修改处）
    ├── contexts/               # React Context（语言、主题）
    ├── hooks/                  # 通用 Hooks（滚动、标题…）
    ├── components/             # 可复用 UI 组件
    └── pages/                  # 页面级组件（一个文件 = 一个路由）
        ├── HomePage / ArchivesPage / PostPage …
        ├── CategoriesPage / TagsPage / SearchPage
        ├── AboutPage / IntroPage / GamesPage / ToolsPage
        └── WritePage           # 写作台（浏览器里写博客）
```

**模块化原则：每个文件是一个 ES Module；`lib/` 只放逻辑，`components/` 只放 UI，`pages/` 组装页面。** 组件间通过 props 传数据，跨页面共享状态用 Context，纯逻辑一律走 `lib/`。

## 🚀 本地开发

```bash
npm install
npm run dev        # 开发服务器（HMR 热更新）
npm run lint       # 代码检查（oxlint）
npm run test       # 核心逻辑冒烟测试（文章解析/统计/搜索/分类树）
npm run build      # 类型检查 + 生产构建（产物在 dist/）
npm run preview    # 本地预览构建产物
```

## 📝 怎么添加内容 / 模块（扩展指南）

| 想做什么 | 怎么做 |
| --- | --- |
| **写新文章** | 在 `src/content/posts/` 放一个 `.md` 文件（格式见下），提交后自动上线；或在站点「写作」页用写作台发布 |
| **改网站标题/介绍** | `src/lib/site.ts` |
| **改导航菜单** | `src/components/NavBar.tsx` 顶部的 `NAV_ITEMS` 数组 |
| **改中英文案** | `src/lib/i18n.ts`（zh/en 两本词典） |
| **换头像/图标/背景** | 替换 `public/img/` 下同名文件 |
| **新增一个页面** | ① 在 `src/pages/` 建组件 → ② 在 `src/App.tsx` 注册路由 → ③ 菜单加到 `NAV_ITEMS` |
| **新增一个组件** | 在 `src/components/` 建文件，命名大驼峰，`export function Xxx()` |
| **新增一个工具函数** | 在 `src/lib/` 建文件，命名小驼峰，`export function xxx()` |
| **新增小游戏/工具页** | 整个 HTML 放进 `public/games/<名字>/`，再到 `GamesPage/ToolsPage` 加卡片 |

### 文章 Markdown 格式（与旧站兼容）

```markdown
---
title: 文章标题
date: 2026-08-15 12:00:00
categories:
  - 技术文章          # 可多级：- [技术文章, AI]
tags:
  - 教程
description: 一句话介绍这篇文章
---

正文从这里开始。
```

- 文件名格式：`2026-08-15-文章标题.md`（slug 取自文件名，决定文章 URL：`/2026/08/15/文章标题/`）
- 改分类/标签名字即可，分类页、标签页、统计全部自动更新
- 写作台会写 `src/content/_drafts/`（草稿，不上线）

## 🎨 图文教程写作指南（图片 / 视频 / 提示框）

Markdown 之外，站点还支持这些"教程友好"的扩展语法，**在 GitHub 网页版和写作台里都能直接写**（GitHub 预览不显示，发布后站点正常渲染）：

### 图片

```markdown
![图片说明](/img/posts/2026-08-15-截图.png)
```

- **写作台**：点工具栏 🖼 选择本地图片 → 自动上传到仓库 `public/img/posts/` 并插入语法（不用手动传 GitHub）
- **GitHub 网页版**：把图片上传到仓库的 `public/img/posts/` 文件夹，再引用 `/img/posts/文件名.png`
- 发布后：图片懒加载、点击可放大查看

### 视频（B站 / YouTube / mp4 直链）

```markdown
:::video https://www.bilibili.com/video/BV1GJ411x7h7
:::

:::video https://www.youtube.com/watch?v=dQw4w9WgXcQ
:::

:::video https://example.com/demo.mp4
:::
```

- 写作台：点工具栏 🎬 粘贴链接自动生成
- B站视频页 / B站短链（b23.tv）/ YouTube / 任意 mp4、webm 直链都支持，16:9 自适应

### 提示框（教程里强调重点、注意事项）

```markdown
:::tip 小提示
这里写提示内容，支持 **Markdown**
:::

:::warning 注意
这里写警告内容
:::

:::danger 重要
这里写危险/易错内容
:::

:::info 补充
这里写补充说明
:::
```

### 其他排版能力（全部原生支持）

| 能力 | 写法 |
| --- | --- |
| 折叠块（适合"展开看答案"） | `<details><summary>点击展开</summary>内容</details>` |
| 表格 | 标准 Markdown 表格 |
| 代码块 + 高亮 | ```` ```js ````（自动高亮） |
| 目录 | 文章页自动生成（基于二/三级标题） |
| 公式 / 图表 | 可直接嵌入 HTML（如 Mermaid iframe），或告诉我加原生支持 |

> 写作台工具栏还提供：加粗、斜体、标题、链接、引用、代码块、列表的一键插入，记不住 Markdown 语法也没关系。

## 🏗️ 架构要点（重构后相比旧站的变化）

| 能力 | 旧站（Hexo） | 新站（Vite + React） |
| --- | --- | --- |
| 页面渲染 | 构建期生成静态 HTML | React Router 客户端路由（懒加载） |
| 文章数据 | `search.xml` + `site-stats.json` 构建期生成 | 运行时从打包的 Markdown 推导 |
| 站内搜索 | 拉取 search.xml 检索 | 内存索引即时检索（首屏后空闲时构建） |
| 写作台 | 写 `source/_posts/` | 写 `src/content/posts/`（触发 CI 重建上线） |
| 样式 | 主题 CSS + 1600 行覆盖样式 | 一套设计系统（CSS 变量 + 玻璃拟态令牌） |
| 图标 | Font Awesome 字体 | 内联 SVG（体积更小） |

性能实践（遵循 Vercel React 最佳实践）：

- **路由级代码分割**：`PostPage`（marked/DOMPurify/highlight.js）与 `WritePage` 懒加载，首屏只加载必要代码
- **无 barrel 文件**：所有 import 直达具体模块，避免打包膨胀
- **渲染优化**：模块级常量、`useMemo`/`useCallback`、Map 索引查询、组件外不定义组件
- **localStorage 键名版本化**：`hxc:theme`、`hxc-liked-*`（语言/写作台沿用旧键，保留用户偏好）
- **主题防闪烁**：`index.html` 内联脚本先行设置 `data-theme`

## 🔧 部署（GitHub Pages，V2 分支）

**分支策略：V1 保留，V2 部署**

- `main` 分支：V1 旧站（Hexo 源码，已在线上运行，不动它）
- `V2` 分支：本 Vite 项目，推送到 `V2` 即自动构建并发布到 GitHub Pages（`.github/workflows/pages.yml`）
- GitHub Pages 同一时间只展示一个版本：**推 `main` → V1 上线；推 `V2` → V2 上线**（最后一次构建生效），想回滚就再推另一分支

首次推送（二选一）：

1. **GitHub Desktop / VSCode**：右上角登录你的 GitHub 账号，直接 Push 到 `V2` 分支即可
2. **命令行令牌**：在 GitHub → Settings → Developer settings 生成令牌（仓库 Contents 读写权限），然后：

```bash
git remote add origin https://github.com/hongchengxue/hongchengxue.github.io.git
git push -u origin V2
# 如提示需要认证，把令牌作为密码输入即可
```

推送成功后等 1～2 分钟，Actions 变绿，`hongchengxue.github.io` 就是新版 V2 站。写作台的 GitHub 令牌权限也只需本仓库 Contents 读写。
