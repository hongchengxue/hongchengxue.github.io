/* ============================================
   文章页点赞按钮（iine：访客免登录、无需注册、无跟踪）
   ============================================ */
(function () {
  'use strict';

  var LOADED = false;

  function slug() {
    var p = window.location.pathname.replace(/\/index\.html?$/, '');
    if (p !== '/' && p.charAt(p.length - 1) === '/') p = p.slice(0, -1);
    return p || '/';
  }

  function mount() {
    var cfg = window.GLOBAL_CONFIG_SITE;
    if (!cfg || String(cfg.pageType) !== 'post') return;

    var old = document.querySelector('.post-like-wrap');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var anchor = document.querySelector('#post-comment') || document.querySelector('#article-container');
    if (!anchor || !anchor.parentNode) return;

    var wrap = document.createElement('div');
    wrap.className = 'post-like-wrap';
    wrap.innerHTML =
      '<span class="post-like-text">喜欢这篇文章？</span>' +
      '<button class="iine-button" data-slug="' + slug() + '" aria-label="点赞"></button>';
    anchor.parentNode.insertBefore(wrap, anchor);

    if (!LOADED) {
      LOADED = true;
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/gh/welpo/iine@main/iine.mini.js';
      s.defer = true;
      document.body.appendChild(s);
    }
  }

  mount();
  if (window.btf && btf.addGlobalFn) {
    btf.addGlobalFn('pjaxComplete', mount, 'like-button-mount');
  }
})();
