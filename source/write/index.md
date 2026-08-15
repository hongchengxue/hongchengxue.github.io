---
title: 写作台
date: 2026-08-15 11:00:00
top_img: false
comments: false
---

<div id="write-app">
  <div class="write-card">
    <div class="write-head">✍️ 写作台</div>
    <div class="write-token-row">
      <input id="write-token" type="password" placeholder="粘贴你的 GitHub 令牌（只保存在本浏览器，不上传）" autocomplete="off">
      <button id="write-connect" type="button">连接</button>
    </div>
    <div id="write-hint">提示：令牌可在 GitHub 的 Settings → Developer settings 中生成，权限只需本仓库的 Contents 读写。</div>
  </div>

  <div class="write-card" id="write-new-card">
    <div class="write-row">
      <input id="write-title" placeholder="文章标题" autocomplete="off">
      <div class="write-cat-box">
        <input id="write-cat" placeholder="分类：点击选择，或用 / 直接输入（如 技术文章/AI）" autocomplete="off">
        <div id="write-cat-panel" class="write-cat-panel">
          <div class="write-cat-panel-head">已有分类（▾ 可展开，点击名称选择）</div>
          <div id="write-cat-options"></div>
          <div class="write-cat-new-row">
            <input id="write-cat-new-input" placeholder="新建分类：直接输入，用 / 建子分类" autocomplete="off">
            <button id="write-cat-new-btn" type="button">选择</button>
          </div>
        </div>
      </div>
      <input id="write-tags" placeholder="标签（逗号分隔，如：Hexo,教程）" autocomplete="off">
    </div>
    <div class="write-editor-row">
      <textarea id="write-content" placeholder="正文，支持 Markdown 语法……"></textarea>
      <div id="write-preview" class="write-preview"><div class="write-preview-empty">实时预览区：输入正文后自动渲染</div></div>
    </div>
    <div class="write-actions">
      <span id="write-mode-badge" class="write-mode-badge">✍️ 新建文章</span>
      <button id="write-draft" type="button">暂存</button>
      <button id="write-save" type="button">发布 / 保存</button>
      <button id="write-new-btn" type="button">清空新建</button>
    </div>
  </div>

  <div class="write-card">
    <div class="write-head2">📝 草稿箱（暂存内容不会上线）</div>
    <ul id="write-drafts"></ul>
  </div>

  <div class="write-card">
    <div class="write-head2">已发布的文章</div>
    <ul id="write-list"></ul>
  </div>
</div>
