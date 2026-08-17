/* ============================================
   评论区范围控制：只在文章页和 ABOUT 页保留评论框，
   分类 / 标签 / 归档 / 工具 / 写作台等页面自动移除
   ============================================ */
(function () {
  'use strict';

  function isAbout() {
    var p = window.location.pathname.replace(/\/index\.html?$/, '');
    return p === '/about';
  }

  function clean() {
    var cfg = window.GLOBAL_CONFIG_SITE;
    var pageType = cfg && cfg.pageType ? String(cfg.pageType) : '';
    if (pageType === 'post' || isAbout()) return;

    var el = document.querySelector('#post-comment');
    if (el && el.parentNode) {
      var hr = el.previousElementSibling;
      if (hr && hr.tagName === 'HR' && hr.classList.contains('custom-hr')) {
        hr.parentNode.removeChild(hr);
      }
      el.parentNode.removeChild(el);
    }
  }

  clean();
  if (window.btf && btf.addGlobalFn) {
    btf.addGlobalFn('pjaxComplete', clean, 'comment-control-clean');
  }
})();
