# 项目状态存档（AI 助手接手指南）

> 本文件是项目完整状态压缩存档。新会话接手时先读本文件，再读 README.md。
> 最后更新：搜索框与导航样式稳定后（css v27 附近）。

## 一、项目概况

- 站点：https://hongchengxue.github.io （GitHub Pages）
- 框架：Hexo 8.1.2 + Butterfly 主题 5.7.0（构建时由 Actions 自动下载主题）
- 部署：`.github/workflows/pages.yml`（push 到 main → Actions 构建 → 发布）
- 语言：zh-CN；统计：百度统计已配（ID 在 `_config.butterfly.yml` 的 `baidu_analytics`），busuanzi 已关闭
- 仓库 git 已配置：remote=https + 代理 127.0.0.1:7897 + 令牌 extraHeader（存于 `.git/config`，不提交）

## 二、目录速查

| 路径 | 作用 |
| --- | --- |
| `_config.yml` | 站点配置（标题 Welcome、语言、时区） |
| `_config.butterfly.yml` | 主题配置（菜单/inject/百度统计/头像等） |
| `source/_posts/*.md` | 文章（用户在此写博客） |
| `source/css/custom-search.css` | 全部自定义样式（搜索框/玻璃菜单/语言下拉/游戏工具卡片） |
| `source/js/nav-search.js` | 导航+首页英雄搜索框逻辑（首页时移出 #menus 防折叠检测） |
| `source/js/search-page.js` | 搜索页逻辑（含 i18n，暴露 `window.__searchI18nRender`） |
| `source/js/lang-switch.js` | 自绘玻璃语言下拉（词典 ZH2EN/EN2ZH，localStorage site-lang） |
| `source/games/` `source/tools/` | 游戏/工具 hub 页（占位，等用户提供素材） |
| `source/img/` | avatar.png、favicon.png、index-bg.jpg、page-bg.jpg |
| `.github/workflows/pages.yml` | 部署流水线（npm install + git clone 主题 5.7.0 + hexo generate） |

## 三、关键设计（用户多次迭代后的最终状态）

- 首页英雄区：中央搜索框 832×60px、top 144px、圆角 10px、液态玻璃（渐变+blur+白描边 0.5）；文字近白 #f5f7fa + 2px 轻深色投影；占位 "Attention Is All You Need"
- 搜索：回车/内嵌按钮 → `/search/?q=` 结果页（卡片+高亮+分类标签）
- 导航：Welcome 已隐藏；菜单（首页/归档/分类/标签/关于/游戏/工具）靠左、语言靠右；玻璃胶囊 0.78em 近白字+轻投影；滚动后 nav-fixed 自动切深色字（`#page-header.nav-fixed ...` 规则）
- 语言按钮：0.86em；下拉面板深色玻璃、与按钮水平居中、圆点+✓ 指示
- 分隔线剪刀图标：`hr_icon.enable: false` 已关
- 首页大标题与打字机字幕：已关（subtitle.enable false，CSS 隐藏 #site-title）
- 已移除并可用 git 恢复：音乐播放器、首页相册（revert 记录在历史）

## 四、工作流（重要）

1. 用户提需求 → 助手本地改 → 构建验证 → `git commit && git push origin main` → 用户刷新验收
2. **版本号机制**：inject 中 CSS/JS 引用带 `?v=N`，每次改动必须递增，否则用户浏览器缓存旧文件（历史教训，反复出现）
3. 用户验收习惯：等 Actions 绿后用**无痕窗口**看（普通窗口有 ~10 分钟缓存）

## 五、本地构建验证流程（本机沙箱注意事项）

```powershell
# 1. npm 必须指定工作区内缓存，且跳过安装脚本
$env:npm_config_cache = "<workspace>\.npm-cache"
npm install --ignore-scripts --no-audit --no-fund
# 2. 手动补跑 hexo-util 的 postinstall（沙箱会拦 npm 的脚本管道）
node node_modules\hexo-util\scripts\build_highlight_alias.js
# 3. 主题不能用 git clone（443 被挡），用 Node fetch 下载 tarball 后解压到 themes/butterfly
# 4. 构建
npx --no-install hexo clean
npx --no-install hexo generate
# 5. 验证 public/ 产物（含 search.xml、css/js、页面）后清理：
#    node_modules、public、themes、.npm-cache、db.json、highlight_alias.json
```

- git push 可用（令牌+代理已配置）；MSYS ssh/askpass 在沙箱不可用（勿切 SSH）
- 主题更新/检查时用 GitHub API tarball（https://api.github.com/repos/jerryc127/hexo-theme-butterfly/releases/tags/5.7.0）
- 图片处理：PowerShell System.Drawing 可用（裁剪/压缩/亮度检测）

## 六、待办（等用户提供素材）

- 游戏：用户自己的小游戏（HTML 文件，放 `source/games/<name>/`，更新 games hub 卡片）
- 工具：纯前端放站内，需后端的用链接（更新 tools hub）
- 相册/音乐：用户暂缓，git 历史可恢复

## 七、用户偏好备忘

- 液态玻璃审美（白字+轻投影、blur、折射高光不要太大）
- 字号：菜单 0.78em、语言 0.86em（用户最终选定，勿再"统一"）
- 修改以"小步、可回滚"为原则；用户常通过版本号机制验收
