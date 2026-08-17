/* ============================================
   评论区范围控制：只在文章页保留评论框，
   分类 / 标签 / 归档 / 关于 / 工具 / 写作台等页面自动移除
   ============================================ */
(function () {
  'use strict';

  function clean() {
    var cfg = window.GLOBAL_CONFIG_SITE;
    var pageType = cfg && cfg.pageType ? String(cfg.pageType) : '';
    if (pageType === 'post') return;

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
