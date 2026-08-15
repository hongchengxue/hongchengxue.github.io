/* ============================================
   导航当前页面指示：给对应按钮加 active 状态
   ============================================ */
(function () {
  'use strict';

  function sync() {
    var p = window.location.pathname;
    var els = document.querySelectorAll('#nav .menus_items .site-page, #nav #about-nav');
    Array.prototype.forEach.call(els, function (el) {
      var href = el.getAttribute('href') || '';
      var path = href.replace(/\/index\.html$/, '/');
      var active;
      if (path === '/') {
        active = p === '/' || p === '/index.html';
      } else {
        active = p === path || (path !== '/' && p.indexOf(path.replace(/\/$/, '')) === 0);
      }
      el.classList.toggle('active', active);
    });
  }

  sync();
  if (window.btf && btf.addGlobalFn) {
    btf.addGlobalFn('pjaxComplete', sync, 'nav-active-sync');
  }
})();
