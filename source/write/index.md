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
        <select id="write-cat-select">
          <option value="">— 分类（可选） —</option>
          <option value="__new__">＋ 新建分类…</option>
        </select>
      </div>
      <input id="write-tags" placeholder="标签（逗号分隔，如：Hexo,教程）" autocomplete="off">
    </div>
    <div class="write-row" id="write-cat-new" hidden>
      <div class="write-cat-box">
        <select id="write-cat-parent">
          <option value="">无父级（顶级分类）</option>
        </select>
      </div>
      <input id="write-cat-name" placeholder="新分类名（如：旅行）" autocomplete="off">
      <span class="write-cat-tip">选择已有分类作为父级即创建子分类</span>
    </div>
    <div class="write-editor-row">
      <textarea id="write-content" placeholder="正文，支持 Markdown 语法……"></textarea>
      <div id="write-preview" class="write-preview"><div class="write-preview-empty">实时预览区：输入正文后自动渲染</div></div>
    </div>
    <div class="write-actions">
      <button id="write-save" type="button">发布 / 保存</button>
      <button id="write-new-btn" type="button">清空新建</button>
    </div>
  </div>

  <div class="write-card">
    <div class="write-head2">已发布的文章</div>
    <ul id="write-list"></ul>
  </div>
</div>
