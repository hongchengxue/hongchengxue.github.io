# hong的知识库

我的个人网站：技术文章 + 生活随笔。

- 框架：[Hexo](https://hexo.io/zh-cn/) 8
- 主题：[Butterfly](https://butterfly.js.org/) 5.7.0
- 托管：[GitHub Pages](https://pages.github.com/)（GitHub Actions 自动构建部署）
- 网站地址：https://hongchengxue.github.io

---

## 📝 怎么写新文章（在浏览器里完成，不用安装任何软件）

1. 打开本仓库的 `source/_posts/` 文件夹
2. 点右上角 **Add file → Create new file**
3. 文件名按格式填写：`2026-08-15-文章标题.md`（日期-标题，用英文横线分隔）
4. 开头粘贴模板，改掉尖括号里的内容：

```markdown
---
title: 文章标题
date: 2026-08-15 12:00:00
categories:
  - 技术文章      # 可选：生活随笔 / 技术文章，也可以自己起新名字
tags:
  - 教程          # 标签可以写多个
description: 一句话介绍这篇文章
---

正文从这里开始。
```

5. 写完点 **Commit changes** 提交
6. 等 1～2 分钟，GitHub 会自动构建发布，打开网站就能看到

> 分类想换成自己的名字（比如「读书笔记」「旅行」）？直接把 `categories:` 下面的名字改掉即可，新的分类会自动出现在「分类」页面。

## 🎨 常用修改指南

| 想改什么 | 改哪个文件 |
| --- | --- |
| 网站标题、介绍 | `_config.yml`（顶部的 Site 部分） |
| 导航菜单、侧边栏、页脚 | `_config.butterfly.yml` |
| 头像 | 替换 `source/img/avatar.png`（文件名保持不变） |
| 网站图标 | 替换 `source/img/favicon.png` |
| 「关于我」页面 | `source/about/index.md` |

改完同样提交，自动生效。**改坏了也不要慌**：GitHub 上打开那个文件 → 右上角 **History** → 点进某次提交 → 点右上角 **Revert** 就能退回。

## 🔧 本地运行（可选，给想折腾的人）

```bash
npm install
npx hexo server
```

浏览器打开 http://localhost:4000 预览。正式发布不需要这一步。

## 📖 更多资料

- Butterfly 主题文档（中文）：https://butterfly.js.org/
- Hexo 文档：https://hexo.io/zh-cn/docs/
- Markdown 语法速查：https://markdown.com.cn/
