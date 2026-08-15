/* ============================================
   导航栏常驻搜索框：输入即搜，下拉显示结果
   ============================================ */
(function () {
  'use strict';

  // 防止重复注入（配合 pjax 场景）
  if (document.getElementById('nav-search-input')) return;

  var btn = document.getElementById('search-button');
  if (!btn) return;

  // ---------- 构建 DOM ----------
  var wrap = document.createElement('div');
  wrap.id = 'nav-search-wrap';
  wrap.innerHTML =
    '<input id="nav-search-input" type="text" placeholder="搜索文章..." autocomplete="off">' +
    '<div id="nav-search-dropdown"></div>';
  btn.parentNode.insertBefore(wrap, btn);

  var input = wrap.querySelector('input');
  var dd = wrap.querySelector('div');

  // ---------- 工具函数 ----------
  var entries = null; // [{title, url, content}]
  var active = -1;

  function stripHtml(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent || '';
  }

  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function loadIndex() {
    return fetch('/search.xml')
      .then(function (r) { return r.text(); })
      .then(function (xml) {
        var doc = new DOMParser().parseFromString(xml, 'text/xml');
        entries = Array.prototype.map.call(doc.querySelectorAll('entry'), function (e) {
          var c = e.querySelector('content');
          return {
            title: stripHtml(e.querySelector('title').textContent),
            url: e.querySelector('url').textContent.trim(),
            content: c ? stripHtml(c.textContent) : ''
          };
        });
      });
  }

  // ---------- 渲染结果 ----------
  function render(kw) {
    var k = kw.trim().toLowerCase();
    if (!k) { dd.classList.remove('show'); active = -1; return; }
    if (!entries) return;

    var hits = [];
    for (var i = 0; i < entries.length; i++) {
      var ti = entries[i].title.toLowerCase().indexOf(k);
      var ci = entries[i].content.toLowerCase().indexOf(k);
      if (ti >= 0 || ci >= 0) hits.push({ e: entries[i], ci: ci });
      if (hits.length >= 8) break;
    }
    active = -1;

    if (!hits.length) {
      dd.innerHTML = '<div class="nav-search-empty">没有找到相关文章</div>';
    } else {
      dd.innerHTML = hits.map(function (h) {
        var title = esc(h.e.title);
        var snippet = '';
        if (h.ci >= 0) {
          var t = h.e.content;
          var s = Math.max(0, h.ci - 25);
          var len = 70;
          snippet = (s > 0 ? '…' : '') + esc(t.slice(s, s + len)) + (s + len < t.length ? '…' : '');
        }
        return '<a class="nav-search-item" href="' + esc(h.e.url) + '">' +
          '<span class="nav-search-title">' + title + '</span>' +
          (snippet ? '<span class="nav-search-snippet">' + snippet + '</span>' : '') +
          '</a>';
      }).join('');
    }
    dd.classList.add('show');
  }

  // ---------- 事件 ----------
  input.addEventListener('input', function () {
    if (!entries) {
      loadIndex().then(function () { render(input.value); }).catch(function () {});
      return;
    }
    render(input.value);
  });

  input.addEventListener('focus', function () {
    if (input.value.trim()) render(input.value);
  });

  input.addEventListener('keydown', function (e) {
    var items = Array.prototype.slice.call(dd.querySelectorAll('.nav-search-item'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      if (active >= 0) items[active].classList.remove('active');
      active = e.key === 'ArrowDown'
        ? Math.min(active + 1, items.length - 1)
        : Math.max(active - 1, 0);
      items[active].classList.add('active');
      items[active].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      if (active >= 0 && items[active]) {
        e.preventDefault();
        window.location.href = items[active].getAttribute('href');
      }
    } else if (e.key === 'Escape') {
      dd.classList.remove('show');
      input.blur();
    }
  });

  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) dd.classList.remove('show');
  });
})();
