/* ============================================
   侧边栏控制：
   - 仅 ABOUT 页与"全部"(归档)页显示侧边栏
   - 归档页侧边栏追加"全部文章"按年月日折叠列表
   ============================================ */
(function () {
  'use strict';

  var allData = null;

  function isAbout() {
    var p = window.location.pathname;
    return p === '/about/' || p === '/about' || p === '/about/index.html';
  }

  function isArchives() {
    var p = window.location.pathname;
    return p === '/archives/' || p === '/archives' || p.indexOf('/archives/') === 0;
  }

  function isPost() {
    var bw = document.getElementById('body-wrap');
    return !!(bw && bw.classList.contains('post'));
  }

  // ---------- 折叠列表渲染 ----------
  function buildTree(data) {
    var byYear = {};
    data.forEach(function (a) {
      if (!byYear[a.year]) byYear[a.year] = {};
      if (!byYear[a.year][a.month]) byYear[a.year][a.month] = {};
      if (!byYear[a.year][a.month][a.day]) byYear[a.year][a.month][a.day] = [];
      byYear[a.year][a.month][a.day].push(a);
    });

    var years = Object.keys(byYear).sort(function (a, b) { return b - a; });
    var html = '';
    years.forEach(function (y) {
      var months = Object.keys(byYear[y]).sort(function (a, b) { return b - a; });
      var yCount = 0;
      var mHtml = '';
      months.forEach(function (m) {
        var days = Object.keys(byYear[y][m]).sort(function (a, b) { return b - a; });
        var mCount = 0;
        var dHtml = '';
        days.forEach(function (d) {
          var items = byYear[y][m][d];
          mCount += items.length;
          yCount += items.length;
          dHtml +=
            '<details class="aa-day"><summary>' + m + '月' + d + '日 <span class="aa-count">' + items.length + '</span></summary>' +
            items.map(function (a) {
              return '<a class="aa-item" href="' + a.url + '">' + a.title + '</a>';
            }).join('') +
            '</details>';
        });
        mHtml +=
          '<details class="aa-month" open><summary>' + m + '月 <span class="aa-count">' + mCount + '</span></summary>' +
          dHtml +
          '</details>';
      });
      html +=
        '<details class="aa-year" open><summary>' + y + '年 <span class="aa-count">' + yCount + '</span></summary>' +
        mHtml +
        '</details>';
    });
    return html;
  }

  function injectArchivesWidget() {
    var aside = document.getElementById('aside-content');
    if (!aside) return;

    // "分类"卡片标题可点击 → 分类页
    var catHead = aside.querySelector('.card-categories .item-headline span');
    if (catHead && !document.querySelector('.card-cat-title-link')) {
      var a = document.createElement('a');
      a.href = '/categories/';
      a.className = 'card-cat-title-link';
      a.textContent = catHead.textContent;
      catHead.parentNode.replaceChild(a, catHead);
    }

    // 最新文章卡标题改为"最近作品"
    var rpHead = aside.querySelector('.card-recent-post .item-headline span');
    if (rpHead) rpHead.textContent = '最近作品';

    if (document.getElementById('card-all-articles')) return;

    var card = document.createElement('div');
    card.className = 'card-widget';
    card.id = 'card-all-articles';
    card.innerHTML =
      '<div class="item-headline"><i class="fas fa-list"></i><span>全部文章</span></div>' +
      '<div class="all-articles-tree" id="all-articles-tree">加载中…</div>';
    aside.appendChild(card);

    var render = function (data) {
      var tree = document.getElementById('all-articles-tree');
      if (tree) tree.innerHTML = buildTree(data);
    };

    if (allData) {
      render(allData);
    } else {
      fetch('/site-stats.json')
        .then(function (r) { return r.json(); })
        .then(function (d) {
          allData = d.all;
          render(allData);
        })
        .catch(function () {
          var tree = document.getElementById('all-articles-tree');
          if (tree) tree.innerHTML = '加载失败';
        });
    }
  }

  function sync() {
    var html = document.documentElement;
    var show = isAbout() || isArchives() || isPost();
    html.classList.toggle('hide-aside', !show);
    html.classList.toggle('about-aside', isAbout());
    html.classList.toggle('archives-aside', isArchives());
    html.classList.toggle('post-aside', isPost());
    if (isArchives()) injectArchivesWidget();
  }

  sync();
  if (window.btf && btf.addGlobalFn) {
    btf.addGlobalFn('pjaxComplete', sync, 'aside-control-sync');
  }
})();
