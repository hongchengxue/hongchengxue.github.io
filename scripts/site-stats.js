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

  return {
    path: 'site-stats.json',
    data: JSON.stringify({
      total: locals.posts.length,
      tags: tags,
      categories: categories,
      recent: recent
    })
  };
});
