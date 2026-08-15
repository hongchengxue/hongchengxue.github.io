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
      var updatedEl = document.getElementById('about-stat-updated');
      if (updatedEl && stats.recent.length) updatedEl.textContent = stats.recent[0].date;

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
    })
    .catch(function () {});
})();
