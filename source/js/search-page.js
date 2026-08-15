/* ============================================
   搜索页逻辑：读取 ?q= 参数，检索 search.xml，渲染结果列表
   ============================================ */
(function () {
  'use strict';

  var resultsBox = document.getElementById('search-page-results');
  if (!resultsBox) return;

  var input = document.getElementById('search-page-input');
  var btn = document.getElementById('search-page-btn');
  var entries = null;

  // ---------- 工具函数 ----------
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

  // 高亮关键词（不区分大小写）
  function highlight(text, kw) {
    if (!kw) return esc(text);
    var out = '';
    var last = 0;
    var t = text;
    var tl = t.toLowerCase();
    var k = kw.toLowerCase();
    var idx = tl.indexOf(k);
    while (idx >= 0 && out.length < 8000) {
      out += esc(t.slice(last, idx)) + '<mark>' + esc(t.slice(idx, idx + kw.length)) + '</mark>';
      last = idx + kw.length;
      idx = tl.indexOf(k, last);
    }
    out += esc(t.slice(last));
    return out;
  }

  function getQ() {
    var m = window.location.search.match(/[?&]q=([^&]*)/);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  // ---------- 界面语言 ----------
  function lang() {
    try { return localStorage.getItem('site-lang') === 'en' ? 'en' : 'zh'; } catch (e) { return 'zh'; }
  }
  var S = {
    zh: {
      placeholder: '输入关键词，回车或点按钮搜索',
      btn: '搜索',
      empty: '输入关键词开始搜索',
      loading: '正在加载搜索索引…',
      noResult: '没有找到与「{kw}」相关的文章',
      stats: '找到 {n} 篇相关文章',
      fail: '搜索索引加载失败，请刷新页面重试'
    },
    en: {
      placeholder: 'Type keywords and press Enter',
      btn: 'Search',
      empty: 'Type keywords to start searching',
      loading: 'Loading search index…',
      noResult: 'No results for "{kw}"',
      stats: '{n} article(s) found',
      fail: 'Failed to load search index, please refresh the page'
    }
  };
  function t(key, vars) {
    var s = S[lang()][key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    }
    return s;
  }

  function applyStaticText() {
    if (input) input.placeholder = t('placeholder');
    if (btn) btn.textContent = t('btn');
  }

  // ---------- 加载索引 ----------
  function loadIndex() {
    return fetch('/search.xml')
      .then(function (r) { return r.text(); })
      .then(function (xml) {
        var doc = new DOMParser().parseFromString(xml, 'text/xml');
        entries = Array.prototype.map.call(doc.querySelectorAll('entry'), function (e) {
          var c = e.querySelector('content');
          var cats = e.querySelectorAll('categories category');
          return {
            title: stripHtml(e.querySelector('title').textContent),
            url: e.querySelector('url').textContent.trim(),
            content: c ? stripHtml(c.textContent) : '',
            categories: Array.prototype.map.call(cats, function (x) { return stripHtml(x.textContent); })
          };
        });
      });
  }

  // ---------- 渲染结果 ----------
  function render(kw) {
    var k = kw.trim();
    if (!k) {
      resultsBox.innerHTML = '<div class="search-page-empty">' + t('empty') + '</div>';
      return;
    }
    if (!entries) {
      resultsBox.innerHTML = '<div class="search-page-empty">' + t('loading') + '</div>';
      return;
    }

    var hits = [];
    for (var i = 0; i < entries.length; i++) {
      var ti = entries[i].title.toLowerCase().indexOf(k.toLowerCase());
      var ci = entries[i].content.toLowerCase().indexOf(k.toLowerCase());
      if (ti >= 0 || ci >= 0) {
        var snippet = '';
        if (ci >= 0) {
          var s = Math.max(0, ci - 40);
          snippet = (s > 0 ? '…' : '') + entries[i].content.slice(s, s + 130) + (s + 130 < entries[i].content.length ? '…' : '');
        } else {
          snippet = entries[i].content.slice(0, 130) + (entries[i].content.length > 130 ? '…' : '');
        }
        hits.push({ e: entries[i], snippet: snippet, ti: ti });
      }
    }

    if (!hits.length) {
      resultsBox.innerHTML = '<div class="search-page-empty">' + t('noResult', { kw: esc(k) }) + '</div>';
      return;
    }

    var stat = '<div class="search-page-stats">' + t('stats', { n: hits.length }) + '</div>';
    var list = hits.map(function (h) {
      var catHtml = h.e.categories.length
        ? '<span class="search-page-cat">' + esc(h.e.categories[0]) + '</span>'
        : '';
      var titleHtml = h.ti >= 0 ? highlight(h.e.title, k) : esc(h.e.title);
      return '<a class="search-page-item" href="' + esc(h.e.url) + '">' +
        '<span class="search-page-title">' + titleHtml + '</span>' +
        '<span class="search-page-snippet">' + highlight(h.snippet, k) + '</span>' +
        catHtml + '</a>';
    }).join('');
    resultsBox.innerHTML = stat + list;
  }

  function run(kw) {
    if (!entries) {
      loadIndex().then(function () { render(kw); }).catch(function () {
        resultsBox.innerHTML = '<div class="search-page-empty">' + t('fail') + '</div>';
      });
    } else {
      render(kw);
    }
  }

  // ---------- 初始加载 & 交互 ----------
  applyStaticText();
  var initQ = getQ();
  if (input) input.value = initQ;
  run(initQ);

  // 供语言切换后重绘
  window.__searchI18nRender = function () {
    applyStaticText();
    run(getQ());
  };

  function submit() {
    var v = input.value.trim();
    if (!v) return;
    if (window.history && history.replaceState) {
      history.replaceState(null, '', '/search/?q=' + encodeURIComponent(v));
    }
    run(v);
  }

  if (btn) btn.addEventListener('click', submit);
  if (input) input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') submit();
  });
})();
