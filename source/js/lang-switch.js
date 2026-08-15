/* ============================================
   语言切换（自绘液态玻璃下拉框）：简体中文 ⇄ English
   ============================================ */
(function () {
  'use strict';

  if (document.getElementById('lang-wrap')) return;

  var menusItems = document.querySelector('#menus .menus_items');
  var menus = document.getElementById('menus');
  if (!menus) return;

  // ---------- 构建自绘下拉框 ----------
  var wrap = document.createElement('div');
  wrap.id = 'lang-wrap';
  wrap.innerHTML =
    '<button id="lang-btn" type="button">' +
    '<i class="fas fa-globe fa-fw"></i>' +
    '<span id="lang-label">简体中文</span>' +
    '<i class="fas fa-chevron-down" id="lang-caret"></i>' +
    '</button>' +
    '<div id="lang-menu">' +
    '<div class="lang-option" data-lang="zh">简体中文</div>' +
    '<div class="lang-option" data-lang="en">English</div>' +
    '</div>';
  // 语言按钮放在搜索框之后（若有），否则菜单项之后
  var searchWrap = document.getElementById('nav-search-wrap');
  var after = searchWrap || menusItems || null;
  menus.insertBefore(wrap, after ? after.nextSibling : null);

  // ---------- 词典 ----------
  var ZH2EN = {
    '归档': 'Archives',
    '分类': 'Categories',
    '标签': 'Tags',
    '关于': 'About',
    '游戏': 'Games',
    '工具': 'Tools',
    '全部': 'All',
    '网站信息': 'Website Info',
    '文章数目': 'Article Count',
    '最后更新时间': 'Last Update',
    '公告': 'Announcement',
    '最新文章': 'Recent Posts',
    '查看更多': 'View More',
    '系列文章': 'Post Series',
    '最新评论': 'Latest Comments',
    '目录': 'Contents',
    '全部文章': 'All Articles',
    '文章': 'Articles',
    '发表于': 'Created',
    '更新于': 'Updated',
    '相关推荐': 'Related Articles',
    '上一篇': 'Previous',
    '下一篇': 'Next',
    '文章作者': 'Author',
    '文章链接': 'Link',
    '版权声明': 'Copyright Notice',
    '返回首页': 'Back to Home',
    '评论': 'Comments',
    '暂无评论': 'No comments',
    '分享': 'Share',
    '赞助': 'Sponsor',
    '框架': 'Framework',
    '主题': 'Theme',
    '加载中...': 'Loading...',
    '阅读模式': 'Reading Mode',
    '简繁转换': 'Traditional ⇄ Simplified',
    '日间和夜间模式切换': 'Light / Dark Mode',
    '回到顶部': 'Back to Top',
    '前往评论': 'Scroll to Comments',
    '设置': 'Settings',
    '单栏和双栏切换': 'Single / Double Column',
    '聊天': 'Chat',
    '页面未找到': 'Page Not Found',
    '搜索': 'Search',
    '标签云': 'Tag Cloud',
    '更多关于我': 'More About Me'
  };
  var EN2ZH = {};
  Object.keys(ZH2EN).forEach(function (k) { EN2ZH[ZH2EN[k]] = k; });

  // ---------- 语言状态 ----------
  function currentLang() {
    try { return localStorage.getItem('site-lang') === 'en' ? 'en' : 'zh'; } catch (e) { return 'zh'; }
  }

  function updateLabel() {
    var label = document.getElementById('lang-label');
    if (label) label.textContent = currentLang() === 'zh' ? '简体中文' : 'English';
    var opts = wrap.querySelectorAll('.lang-option');
    Array.prototype.forEach.call(opts, function (o) {
      o.classList.toggle('active', o.getAttribute('data-lang') === currentLang());
    });
  }

  // ---------- 应用翻译 ----------
  function apply() {
    var lang = currentLang();
    var dict = lang === 'en' ? ZH2EN : EN2ZH;

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'PRE' || tag === 'CODE') return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('#lang-wrap')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var node;
    while ((node = walker.nextNode())) {
      var t = node.nodeValue.trim();
      if (dict[t] !== undefined) {
        node.nodeValue = node.nodeValue.replace(t, dict[t]);
      }
    }

    // 搜索页输入框/按钮文案
    var spInput = document.getElementById('search-page-input');
    if (spInput) spInput.placeholder = lang === 'en' ? 'Type keywords and press Enter' : '输入关键词，回车或点按钮搜索';
    var spBtn = document.getElementById('search-page-btn');
    if (spBtn) spBtn.textContent = lang === 'en' ? 'Search' : '搜索';
  }

  function setLang(l) {
    try { localStorage.setItem('site-lang', l); } catch (e) {}
    apply();
    updateLabel();
    wrap.classList.remove('open');
    if (window.__searchI18nRender) window.__searchI18nRender();
  }

  // ---------- 事件 ----------
  var btn = wrap.querySelector('#lang-btn');
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    wrap.classList.toggle('open');
  });

  Array.prototype.forEach.call(wrap.querySelectorAll('.lang-option'), function (o) {
    o.addEventListener('click', function () {
      setLang(o.getAttribute('data-lang'));
    });
  });

  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) wrap.classList.remove('open');
  });

  // 初始应用 + pjax 后重新应用
  updateLabel();
  apply();
  if (window.btf && btf.addGlobalFn) {
    btf.addGlobalFn('pjaxComplete', apply, 'lang-apply');
  }
})();
