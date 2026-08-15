'use strict';
// 生成全站统计 JSON（文章总数、标签及权重、分类、最近文章），供 ABOUT 页使用
hexo.extend.generator.register('site-stats', function (locals) {
  var tags = locals.tags.map(function (t) {
    return { name: t.name, count: t.posts.length };
  });
  var categories = locals.categories.map(function (c) {
    return { name: c.name, count: c.posts.length };
  });
  tags.sort(function (a, b) { return b.count - a.count; });
  categories.sort(function (a, b) { return b.count - a.count; });

  var recent = locals.posts.sort('-date').limit(5).map(function (p) {
    return {
      title: p.title,
      url: '/' + p.path,
      date: p.date.format('YYYY-MM-DD')
    };
  });

  // 全部分类路径（含父子层级，如 "生活随笔/旅行"）
  var catPaths = [];
  var seenCat = {};
  function fullPath(c) {
    var parts = [];
    var cur = c;
    while (cur) {
      parts.unshift(cur.name);
      cur = cur.parent || null;
    }
    return parts.join('/');
  }
  locals.categories.forEach(function (c) {
    var p = fullPath(c);
    if (!seenCat[p]) {
      seenCat[p] = true;
      catPaths.push(p);
    }
  });
  catPaths.sort();

  // 全部文章（用于"全部"页侧边栏的按年月日折叠列表）
  var all = locals.posts.sort('-date').map(function (p) {
    return {
      title: p.title,
      url: '/' + p.path,
      date: p.date.format('YYYY-MM-DD'),
      year: String(p.date.year()),
      month: String(p.date.month() + 1).padStart(2, '0'),
      day: String(p.date.date()).padStart(2, '0')
    };
  });

  return {
    path: 'site-stats.json',
    data: JSON.stringify({
      total: locals.posts.length,
      tags: tags,
      categories: categories,
      catPaths: catPaths,
      recent: recent,
      all: all
    })
  };
});
