/* ============================================
   导航栏搜索框：回车或点击内嵌按钮 → 跳转搜索页
   ============================================ */
(function () {
  'use strict';

  // 防止重复注入（配合 pjax 场景）
  if (document.getElementById('nav-search-input')) return;

  var btn = document.getElementById('search-button');
  if (!btn) return;

  // ---------- 构建 DOM：输入框 + 内嵌搜索按钮 ----------
  var wrap = document.createElement('div');
  wrap.id = 'nav-search-wrap';
  wrap.innerHTML =
    '<input id="nav-search-input" type="text" placeholder="Attention Is All You Need" autocomplete="off">' +
    '<button id="nav-search-submit" type="button" aria-label="搜索">' +
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>' +
    '</button>';

  // ---------- 位置管理：所有页面统一放在菜单项之后、语言按钮之前 ----------
  function positionWrap() {
    var menus = document.getElementById('menus');
    if (!menus) return;
    var menusItems = menus.querySelector('.menus_items');
    var langWrap = document.getElementById('lang-wrap');
    var before = langWrap || (menusItems ? menusItems.nextSibling : null);
    if (wrap.parentNode !== menus || wrap.nextSibling !== before) {
      menus.insertBefore(wrap, before);
    }
  }

  positionWrap();
  if (window.btf && btf.addGlobalFn) {
    btf.addGlobalFn('pjaxComplete', positionWrap, 'nav-search-position');
  }

  var input = wrap.querySelector('input');
  var submit = wrap.querySelector('button');

  // ---------- 跳转搜索页 ----------
  function go() {
    var v = input.value.trim();
    if (!v) return;
    window.location.href = '/search/?q=' + encodeURIComponent(v);
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') go();
  });

  submit.addEventListener('click', go);

  // 有内容时也让按钮保持可见
  input.addEventListener('input', function () {
    wrap.classList.toggle('has-value', !!input.value.trim());
  });
})();
