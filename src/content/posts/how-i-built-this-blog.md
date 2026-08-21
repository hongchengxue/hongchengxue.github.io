---
title: 零基础搭建 Hexo 博客并部署到 GitHub Pages
date: 2026-08-15 11:40:00
updated: 2026-08-15 11:40:00
categories:
  - 技术文章
tags:
  - Hexo
  - GitHub Pages
  - 教程
description: 不需要懂代码，教你把这个博客从零搭起来：Hexo + Butterfly 主题 + GitHub Actions 自动部署。
---

这篇文章记录了这个网站是怎么搭起来的，写给和我一样「不懂代码」的朋友。

## 用到的工具

| 工具 | 作用 | 费用 |
| --- | --- | --- |
| [Hexo](https://hexo.io/zh-cn/) | 博客框架，把 Markdown 变成网页 | 免费开源 |
| [Butterfly](https://butterfly.js.org/) | 博客主题，负责外观 | 免费开源 |
| [GitHub Pages](https://pages.github.com/) | 网站托管 | 免费 |
| GitHub Actions | 自动构建和发布 | 免费 |

## 核心思路

整个流程只有一句话：

> 在 GitHub 网页上写文章（Markdown 文件）→ 推送后 GitHub Actions 自动用 Hexo 构建 → 发布到 GitHub Pages。

所以**本地不需要安装任何软件**。

## 写一篇文章的完整流程

1. 打开仓库的 `source/_posts/` 文件夹
2. 点 **Add file → Create new file**
3. 文件名按 `2026-08-15-标题.md` 的格式填
4. 开头粘贴下面这段「元信息」：

```markdown
---
title: 文章标题
date: 2026-08-15 12:00:00
categories:
  - 技术文章
tags:
  - 教程
description: 一句话介绍这篇文章
---
```

5. 下面写正文，用 Markdown 语法：

```markdown
## 二级标题

**加粗文字**，*斜体文字*

- 列表项一
- 列表项二

> 引用一句话

`行内代码`
```

6. 点 **Commit changes** 提交
7. 等 1～2 分钟，打开网站就能看到新文章

## 修改网站设置

- 网站整体设置：仓库根目录的 `_config.yml`
- 主题外观设置：仓库根目录的 `_config.butterfly.yml`
- 头像：替换 `source/img/avatar.png`
- 「关于我」页面：`source/about/index.md`

改完提交，同样是自动生效。

## 小结

搭建这个网站的全过程，本质上就是：**复制模板 → 改文字 → 提交**。祝你也搭建顺利！
