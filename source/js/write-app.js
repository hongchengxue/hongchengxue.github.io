/* ============================================
   写作台：站内写博客 / 管理文章
   - 通过 GitHub API 直接读写仓库里的 source/_posts
   - 令牌仅存于本浏览器 localStorage，绝不写入代码
   ============================================ */
(function () {
  'use strict';

  if (!document.getElementById('write-app')) return;

  var API = 'https://api.github.com/repos/hongchengxue/hongchengxue.github.io/contents/';
  var token = null;
  var editingPath = null;
  var editingSha = null;

  var tokenInput = document.getElementById('write-token');
  var connectBtn = document.getElementById('write-connect');
  var hintEl = document.getElementById('write-hint');
  var titleInput = document.getElementById('write-title');
  var catInput = document.getElementById('write-cat');
  var tagsInput = document.getElementById('write-tags');
  var contentEl = document.getElementById('write-content');
  var previewEl = document.getElementById('write-preview');
  var listEl = document.getElementById('write-list');

  // ---------- 工具 ----------
  function b64encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  function b64decode(b64) {
    return decodeURIComponent(escape(atob(b64)));
  }
  function slugify(title) {
    var s = title.trim()
      .replace(/[\\/:*?"<>|#\s]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return s || 'untitled';
  }
  function nowStr() {
    var d = new Date();
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  function setHint(text, ok) {
    hintEl.textContent = text;
    hintEl.className = ok ? 'write-hint ok' : 'write-hint';
  }

  function api(path, opts) {
    opts = opts || {};
    opts.headers = {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json'
    };
    return fetch(API + path, opts).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.message || ('HTTP ' + r.status));
        return j;
      });
    });
  }

  // ---------- 连接 ----------
  connectBtn.addEventListener('click', function () {
    token = tokenInput.value.trim();
    if (!token) { setHint('请先粘贴令牌', false); return; }
    try { localStorage.setItem('write-token', token); } catch (e) {}
    loadList();
  });

  try {
    var saved = localStorage.getItem('write-token');
    if (saved) {
      token = saved;
      tokenInput.value = saved;
      loadList();
    }
  } catch (e) {}

  // ---------- 文章列表 ----------
  function loadList() {
    setHint('正在加载文章列表…', true);
    api('source/_posts')
      .then(function (files) {
        setHint('已连接 ✅ 共 ' + files.length + ' 篇文章', true);
        var posts = files.filter(function (f) { return /\.md$/.test(f.name); });
        posts.sort(function (a, b) { return b.name.localeCompare(a.name); });
        listEl.innerHTML = posts.map(function (f) {
          return '<li class="write-item">' +
            '<span class="write-item-name">' + f.name + '</span>' +
            '<span class="write-item-actions">' +
            '<button data-act="edit" data-path="' + f.path + '">编辑</button>' +
            '<button data-act="del" data-path="' + f.path + '">删除</button>' +
            '</span></li>';
        }).join('');
      })
      .catch(function (e) {
        setHint('连接失败：' + e.message + '（检查令牌是否有 Contents 读写权限）', false);
      });
  }

  listEl.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var path = btn.getAttribute('data-path');
    if (btn.getAttribute('data-act') === 'edit') {
      loadPost(path);
    } else {
      if (!confirm('确定删除 ' + path + ' ？')) return;
      api(path, { method: 'GET' }).then(function (meta) {
        return api(path, {
          method: 'DELETE',
          body: JSON.stringify({ message: 'delete: ' + path, sha: meta.sha })
        });
      }).then(function () {
        setHint('已删除，约 2 分钟后网站自动更新', true);
        loadList();
      }).catch(function (err) { setHint('删除失败：' + err.message, false); });
    }
  });

  function loadPost(path) {
    api(path, { method: 'GET' }).then(function (meta) {
      editingPath = path;
      editingSha = meta.sha;
      var raw = b64decode(meta.content);
      // 标题从 front matter 里提取
      var m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
      var fm = m ? m[1] : '';
      var titleM = fm.match(/^title:\s*(.+)$/m);
      titleInput.value = titleM ? titleM[1].trim() : '';
      var catM = fm.match(/^categories:\s*\n(?:\s*-\s*(.+))?/m);
      catInput.value = catM && catM[1] ? catM[1].trim() : '';
      var tagList = [];
      var tagRe = /^\s*-\s*(.+)$/gm;
      var tg = /^tags:([\s\S]*?)(?=^\S|\z)/m.exec(fm);
      if (tg) {
        var t2;
        while ((t2 = tagRe.exec(tg[1])) !== null) tagList.push(t2[1].trim());
      }
      tagsInput.value = tagList.join(', ');
      contentEl.value = m ? raw.slice(m[0].length) : raw;
      setHint('正在编辑：' + path + '（保存后自动发布）', true);
    }).catch(function (err) { setHint('读取失败：' + err.message, false); });
  }

  // ---------- 新建 ----------
  document.getElementById('write-new-btn').addEventListener('click', function () {
    editingPath = null;
    editingSha = null;
    titleInput.value = '';
    catInput.value = '';
    tagsInput.value = '';
    contentEl.value = '';
    setHint('新建文章模式', true);
  });

  // ---------- 预览 ----------
  var markedLoaded = false;
  document.getElementById('write-preview-btn').addEventListener('click', function () {
    if (!contentEl.value.trim()) { setHint('还没有内容可预览', false); return; }
    var show = function () {
      if (previewEl.hidden) {
        previewEl.hidden = false;
        previewEl.innerHTML = marked.parse(contentEl.value);
      } else {
        previewEl.hidden = true;
      }
    };
    if (window.marked) { show(); return; }
    if (!markedLoaded) {
      markedLoaded = true;
      var s = document.createElement('script');
      s.src = '/js/marked.umd.js';
      s.onload = show;
      document.body.appendChild(s);
    }
  });

  // ---------- 发布 / 保存 ----------
  document.getElementById('write-save').addEventListener('click', function () {
    if (!token) { setHint('请先粘贴令牌并连接', false); return; }
    var title = titleInput.value.trim();
    if (!title) { setHint('请填写文章标题', false); return; }
    var cat = catInput.value.trim();
    var tags = tagsInput.value.split(/[,，]/).map(function (s) { return s.trim(); }).filter(Boolean);

    var fm = '---\n' +
      'title: ' + title + '\n' +
      'date: ' + nowStr() + '\n';
    if (cat) fm += 'categories:\n  - ' + cat + '\n';
    if (tags.length) {
      fm += 'tags:\n';
      tags.forEach(function (t) { fm += '  - ' + t + '\n'; });
    }
    fm += '---\n\n';

    var path;
    if (editingPath) {
      path = editingPath;
    } else {
      path = 'source/_posts/' + nowStr().slice(0, 10) + '-' + slugify(title) + '.md';
    }

    var body = {
      message: (editingPath ? 'update: ' : 'post: ') + title,
      content: b64encode(fm + contentEl.value)
    };
    if (editingSha) body.sha = editingSha;

    setHint('正在保存…', true);
    api(path, { method: 'PUT', body: JSON.stringify(body) })
      .then(function () {
        setHint('✅ 已保存！约 2 分钟后自动发布到网站（可去 Actions 页看构建进度）', true);
        editingPath = null;
        editingSha = null;
        loadList();
      })
      .catch(function (err) { setHint('保存失败：' + err.message, false); });
  });
})();
