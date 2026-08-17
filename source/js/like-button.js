/* ============================================
   文章页点赞按钮（iine 后端，自研客户端）
   访客免登录、免注册、无跟踪；每次挂载同步初始化，pjax 安全
   ============================================ */
(function () {
  'use strict';

  var API = 'https://vhiweeypifbwacashxjz.supabase.co';
  var KEY = 'sb_publishable_EoB7MFJhCmb6PiAk-GPJ4w_PGhQ44Ru';
  var HEART =
    '<svg width="16" height="16" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" aria-hidden="true"><path d="M15 8C8.925 8 4 12.925 4 19c0 11 13 21 20 23.326C31 40 44 30 44 19c0-6.075-4.925-11-11-11-3.72 0-7.01 1.847-9 4.674A10.99 10.99 0 0 0 15 8"/></svg>';

  function isPost() {
    var p = window.location.pathname.replace(/^\/+/, '/');
    return /^\/\d{4}\/\d{2}\/\d{2}\//.test(p);
  }

  function slug() {
    var p = window.location.pathname.replace(/\/index\.html?$/, '');
    if (p !== '/' && p.charAt(p.length - 1) === '/') p = p.slice(0, -1);
    return p || '/';
  }

  function setFilled(icon, filled) {
    var svg = icon.querySelector('svg');
    if (svg) svg.setAttribute('fill', filled ? 'currentColor' : 'none');
    var paths = icon.querySelectorAll('path');
    for (var i = 0; i < paths.length; i++) {
      paths[i].setAttribute('fill', filled ? 'currentColor' : 'none');
    }
  }

  function mount() {
    if (!isPost()) return;

    var old = document.querySelector('.post-like-wrap');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var anchor = document.querySelector('#post-comment') || document.querySelector('#article-container');
    if (!anchor || !anchor.parentNode) return;

    var key = slug();
    var lsKey = 'hxc-liked-' + key;

    var wrap = document.createElement('div');
    wrap.className = 'post-like-wrap';
    wrap.innerHTML =
      '<span class="post-like-text">喜欢这篇文章？</span>' +
      '<button class="iine-button" type="button" aria-label="点赞"></button>';
    anchor.parentNode.insertBefore(wrap, anchor);

    var btn = wrap.querySelector('.iine-button');
    var icon = document.createElement('span');
    icon.className = 'icon';
    icon.innerHTML = HEART;
    var counter = document.createElement('span');
    counter.className = 'counter';
    btn.appendChild(icon);
    btn.appendChild(counter);

    var liked = !!localStorage.getItem(lsKey);

    function setCount(n) {
      counter.textContent = ' ' + n;
      btn.setAttribute('aria-label', n + ' 人点赞');
      if (liked) btn.setAttribute('title', '你已经点过赞了');
    }

    setCount(0);
    if (liked) {
      btn.classList.add('clicked');
      btn.setAttribute('aria-pressed', 'true');
      setFilled(icon, true);
    }

    fetch(API + '/rest/v1/rpc/get_hits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY },
      body: JSON.stringify({ page_slugs: [key] })
    }).then(function (r) { return r.json(); }).then(function (data) {
      var n = (data && typeof data[key] === 'number') ? data[key] : 0;
      if (liked) n = Math.max(n, 1);
      setCount(n);
    }).catch(function () {});

    btn.addEventListener('click', function () {
      if (liked) return;
      liked = true;
      localStorage.setItem(lsKey, '1');
      btn.classList.add('clicked');
      btn.setAttribute('aria-pressed', 'true');
      setFilled(icon, true);
      setCount((parseInt(counter.textContent, 10) || 0) + 1);
      fetch(API + '/rest/v1/rpc/increment_hits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY },
        body: JSON.stringify({ page_slug: key })
      }).catch(function () {});
    });
  }

  mount();
  if (window.btf && btf.addGlobalFn) {
    btf.addGlobalFn('pjaxComplete', mount, 'like-button-mount');
  }
})();
