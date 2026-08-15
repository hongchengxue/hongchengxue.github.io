/* ============================================
   侧边栏控制：仅 ABOUT 页显示侧边栏，其余页面隐藏
   ============================================ */
(function () {
  'use strict';

  function sync() {
    var p = window.location.pathname;
    var onAbout = p === '/about/' || p === '/about' || p === '/about/index.html';
    document.documentElement.classList.toggle('hide-aside', !onAbout);
  }

  sync();
  if (window.btf && btf.addGlobalFn) {
    btf.addGlobalFn('pjaxComplete', sync, 'aside-control-sync');
  }
})();
