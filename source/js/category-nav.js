/* ============================================
   分类页面包屑：显示层级路径 + 返回上一级按钮
   ============================================ */
(function () {
  'use strict';

  function sync() {
    var p = window.location.pathname;
    var m = p.match(/^\/categories\/(.+)$/);

    var old = document.querySelector('.cat-breadcrumb');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    if (!m) return;

    var segs = m[1].split('/').filter(Boolean).map(function (s) {
      try { return decodeURIComponent(s); } catch (e) { return s; }
    });
    if (!segs.length) return;

    var page = document.querySelector('#category, #page');
    if (!page) return;

    var bc = document.createElement('div');
    bc.className = 'cat-breadcrumb';

    var html = '<a href="/categories/">全部分类</a>';
    var parentPath = '/categories/';
    for (var i = 0; i < segs.length - 1; i++) {
      parentPath += encodeURIComponent(segs[i]) + '/';
      html += '<span class="cat-bc-sep">/</span><a href="' + parentPath + '">' + segs[i] + '</a>';
    }
    html += '<span class="cat-bc-sep">/</span><span class="cat-bc-current">' + segs[segs.length - 1] + '</span>';
    html += '<a class="cat-bc-back" href="' + (segs.length > 1 ? parentPath : '/categories/') + '">← 返回上一级</a>';

    bc.innerHTML = html;
    page.insertBefore(bc, page.firstChild);
  }

  sync();
  if (window.btf && btf.addGlobalFn) {
    btf.addGlobalFn('pjaxComplete', sync, 'category-nav-sync');
  }
})();
