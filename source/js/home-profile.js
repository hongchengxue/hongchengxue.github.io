/* ============================================
   首页个人卡片：个人信息 + 联系方式 + 数据统计 + 标签云
   数据来自 /site-stats.json（构建时自动生成）
   ============================================ */
(function () {
  'use strict';

  function isHome() {
    var p = window.location.pathname;
    return p === '/' || p === '/index.html';
  }

  var stats = null;
  var el = null;

  function build() {
    var header = document.getElementById('page-header');
    // 只注入到首页 hero（有壁纸和搜索框的区域），不放内容区
    if (!header || !header.classList.contains('full_page')) return;
    if (document.getElementById('home-profile')) return;

    el = document.createElement('div');
    el.id = 'home-profile';
    el.innerHTML =
      '<div class="profile-card">' +
        '<div class="profile-main">' +
          '<img class="profile-avatar" src="/img/avatar.png" alt="avatar">' +
          '<div class="profile-info">' +
            '<div class="profile-name">hong</div>' +
            '<div class="profile-intro">记录技术与生活的知识库</div>' +
            '<div class="profile-contact">' +
              '<a href="https://github.com/hongchengxue" target="_blank" rel="noopener"><i class="fab fa-github"></i> GitHub</a>' +
              '<a class="profile-more" href="/about/"><i class="fas fa-user"></i> <span class="profile-more-text">更多关于我</span></a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="profile-stats">' +
          '<div class="profile-stat"><span class="stat-num" id="stat-posts">-</span><span class="stat-label">文章</span></div>' +
          '<div class="profile-stat"><span class="stat-num" id="stat-tags">-</span><span class="stat-label">标签</span></div>' +
          '<div class="profile-stat"><span class="stat-num" id="stat-cats">-</span><span class="stat-label">分类</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="tag-cloud-card">' +
        '<div class="tag-cloud-title"><i class="fas fa-tags"></i> 标签云</div>' +
        '<div class="tag-cloud" id="tag-cloud"></div>' +
      '</div>';
    header.appendChild(el);
    loadStats();
  }

  function loadStats() {
    if (stats) { render(); return; }
    fetch('/site-stats.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { stats = d; render(); })
      .catch(function () {});
  }

  function render() {
    if (!stats || !document.getElementById('home-profile')) return;

    var p = document.getElementById('stat-posts');
    if (p) p.textContent = stats.total;
    var t = document.getElementById('stat-tags');
    if (t) t.textContent = stats.tags.length;
    var c = document.getElementById('stat-cats');
    if (c) c.textContent = stats.categories.length;

    var cloud = document.getElementById('tag-cloud');
    if (!cloud) return;
    var max = stats.tags.length ? stats.tags[0].count : 1;
    var colors = ['#4285f4', '#5b8cff', '#4a7dff', '#7db1ff', '#9ec5ff'];
    cloud.innerHTML = stats.tags.map(function (tag, i) {
      var size = (0.85 + (tag.count / max) * 0.9).toFixed(2);
      var color = colors[i % colors.length];
      return '<a class="tag-item" style="font-size:' + size + 'rem;color:' + color + '" href="/tags/' +
        encodeURIComponent(tag.name) + '/">' + tag.name + '</a>';
    }).join('');
  }

  function destroy() {
    if (el && el.parentNode) el.parentNode.removeChild(el);
    el = null;
  }

  function sync() {
    if (isHome()) build();
    else destroy();
  }

  sync();
  if (window.btf && btf.addGlobalFn) {
    btf.addGlobalFn('pjaxComplete', sync, 'home-profile-sync');
  }
})();
