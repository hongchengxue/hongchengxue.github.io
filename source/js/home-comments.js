/* ============================================
   主页评论：在首页文章列表下方挂载 Giscus
   ============================================ */
(function () {
  'use strict';

  // —— 由 giscus.app 生成后填入（与主题配置一致）——
  var CONFIG = {
    repo: 'hongchengxue/hongchengxue.github.io',
    repoId: 'R_kgDOT441Lg',
    category: 'General',
    categoryId: 'DIC_kwDOT441Ls4DDkT6',
    theme: 'light'
  };

  function isHome() {
    var p = window.location.pathname.replace(/\/index\.html?$/, '');
    return p === '' || p === '/';
  }

  function currentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    return t === 'dark' ? 'dark' : 'light';
  }

  function syncTheme() {
    var iframe = document.querySelector('#home-giscus iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme: currentTheme() } } },
        'https://giscus.app'
      );
    }
  }

  function build() {
    var old = document.querySelector('.home-comments');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    if (!isHome()) return;

    var mount = document.querySelector('#recent-posts');
    if (!mount || !mount.parentNode) return;

    var sec = document.createElement('section');
    sec.className = 'home-comments';
    sec.innerHTML =
      '<div class="home-comments-head"><i class="fas fa-comments fa-fw"></i><span>评论</span></div>' +
      '<div class="giscus" id="home-giscus"></div>';
    mount.parentNode.insertBefore(sec, mount.nextSibling);

    var s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-repo', CONFIG.repo);
    s.setAttribute('data-repo-id', CONFIG.repoId);
    s.setAttribute('data-category', CONFIG.category);
    s.setAttribute('data-category-id', CONFIG.categoryId);
    s.setAttribute('data-mapping', 'pathname');
    s.setAttribute('data-strict', '0');
    s.setAttribute('data-reactions-enabled', '1');
    s.setAttribute('data-emit-metadata', '0');
    s.setAttribute('data-input-position', 'top');
    s.setAttribute('data-lang', 'zh-CN');
    s.setAttribute('data-theme', currentTheme());
    s.setAttribute('data-loading', 'lazy');
    document.getElementById('home-giscus').appendChild(s);

    syncTheme();
  }

  build();
  if (window.btf && btf.addGlobalFn) {
    btf.addGlobalFn('pjaxComplete', build, 'home-comments-build');
    btf.addGlobalFn('themeChange', syncTheme, 'home-comments-theme');
  }
})();
