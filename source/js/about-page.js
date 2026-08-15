/* ============================================
   ABOUT 页动态内容：统计数字 / 标签云 / 最近作品 / 网站信息
   数据来自 /site-stats.json（构建时自动生成）
   ============================================ */
(function () {
  'use strict';

  if (!document.getElementById('about-page')) return;

  fetch('/site-stats.json')
    .then(function (r) { return r.json(); })
    .then(function (stats) {
      // 统计
      var posts = document.getElementById('about-stat-posts');
      if (posts) posts.textContent = stats.total;
      var tagsEl = document.getElementById('about-stat-tags');
      if (tagsEl) tagsEl.textContent = stats.tags.length;
      var catsEl = document.getElementById('about-stat-cats');
      if (catsEl) catsEl.textContent = stats.categories.length;

      // 标签云
      var cloud = document.getElementById('about-tag-cloud');
      if (cloud && stats.tags.length) {
        var max = stats.tags[0].count;
        var colors = ['#4285f4', '#5b8cff', '#4a7dff', '#7db1ff', '#9ec5ff'];
        cloud.innerHTML = stats.tags.map(function (tag, i) {
          var size = (0.85 + (tag.count / max) * 0.9).toFixed(2);
          return '<a class="tag-item" style="font-size:' + size + 'rem;color:' + colors[i % colors.length] +
            '" href="/tags/' + encodeURIComponent(tag.name) + '/">' + tag.name + '</a>';
        }).join('');
      }

      // 最近作品
      var recent = document.getElementById('about-recent');
      if (recent && stats.recent.length) {
        recent.innerHTML = stats.recent.map(function (p) {
          return '<a class="about-recent-item" href="' + p.url + '">' +
            '<span class="about-recent-title">' + p.title + '</span>' +
            '<span class="about-recent-date">' + p.date + '</span></a>';
        }).join('');
      }

      // 网站信息
      var webinfo = document.getElementById('about-webinfo');
      if (webinfo) {
        var lastDate = stats.recent.length ? stats.recent[0].date : '-';
        webinfo.innerHTML =
          '<div class="about-info-row"><span>文章数目</span><b>' + stats.total + '</b></div>' +
          '<div class="about-info-row"><span>标签数目</span><b>' + stats.tags.length + '</b></div>' +
          '<div class="about-info-row"><span>分类数目</span><b>' + stats.categories.length + '</b></div>' +
          '<div class="about-info-row"><span>最近更新</span><b>' + lastDate + '</b></div>';
      }
    })
    .catch(function () {});
})();
