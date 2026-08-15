/* ============================================
   写作台：站内写博客 / 管理文章 / 草稿箱
   - 暂存 → source/_drafts（不会上线）
   - 发布 → source/_posts（自动构建上线）
   - 分类可选可新建（支持父子层级），Markdown 实时预览
   ============================================ */
(function () {
  'use strict';

  if (!document.getElementById('write-app')) return;

  var API = 'https://api.github.com/repos/hongchengxue/hongchengxue.github.io/contents/';
  var token = null;
  var editingPath = null;
  var editingSha = null;
  var editingDraft = false;

  var tokenInput = document.getElementById('write-token');
  var connectBtn = document.getElementById('write-connect');
  var hintEl = document.getElementById('write-hint');
  var titleInput = document.getElementById('write-title');
  var catInput = document.getElementById('write-cat');
  var catPanel = document.getElementById('write-cat-panel');
  var catOptions = document.getElementById('write-cat-options');
  var tagsInput = document.getElementById('write-tags');
  var contentEl = document.getElementById('write-content');
  var previewEl = document.getElementById('write-preview');
  var listEl = document.getElementById('write-list');
  var draftsListEl = document.getElementById('write-drafts');
  var draftBtn = document.getElementById('write-draft');

  var catPaths = [];

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

  // ---------- 分类面板 ----------
  function loadCatPaths() {
    fetch('/site-stats.json')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        catPaths = d.catPaths || [];
        catOptions.innerHTML = catPaths.length
          ? catPaths.map(function (p) {
            return '<div class="write-cat-option" data-v="' + p.replace(/"/g, '&quot;') + '">' + p + '</div>';
          }).join('')
          : '<div class="write-cat-none">暂无已有分类</div>';
      })
      .catch(function () {});
  }

  function openCatPanel() {
    catPanel.classList.add('open');
  }
  function closeCatPanel() {
    catPanel.classList.remove('open');
  }

  catInput.addEventListener('focus', openCatPanel);
  catInput.addEventListener('click', openCatPanel);
  catOptions.addEventListener('click', function (e) {
    var opt = e.target.closest('.write-cat-option');
    if (!opt) return;
    catInput.value = opt.getAttribute('data-v');
    closeCatPanel();
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.write-cat-box')) closeCatPanel();
  });

  function buildCategory() {
    return catInput.value.trim();
  }

  // 组装 front matter
  function buildFm(title) {
    var catPath = buildCategory();
    var tags = tagsInput.value.split(/[,，]/).map(function (s) { return s.trim(); }).filter(Boolean);
    var fm = '---\n' +
      'title: ' + title + '\n' +
      'date: ' + nowStr() + '\n';
    if (catPath) {
      var parts = catPath.split('/').filter(Boolean);
      if (parts.length > 1) {
        fm += 'categories:\n  - [' + parts.join(', ') + ']\n';
      } else {
        fm += 'categories:\n  - ' + parts[0] + '\n';
      }
    }
    if (tags.length) {
      fm += 'tags:\n';
      tags.forEach(function (t) { fm += '  - ' + t + '\n'; });
    }
    fm += '---\n\n';
    return fm;
  }

  // ---------- 模式界面 ----------
  function updateModeUI() {
    // 编辑已发布文章时隐藏"暂存"
    draftBtn.hidden = !!editingPath && !editingDraft;
    if (editingDraft) setHint('草稿模式：暂存不会上线，发布后才会出现在网站', true);
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

  loadCatPaths();

  // ---------- 上次编辑时间 ----------
  var REPO_API = 'https://api.github.com/repos/hongchengxue/hongchengxue.github.io/';

  function attachTimes(listEl, files) {
    files.forEach(function (f) {
      fetch(REPO_API + 'commits?path=' + encodeURIComponent(f.path) + '&per_page=1', {
        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json' }
      }).then(function (r) { return r.json(); }).then(function (arr) {
        if (!arr || !arr.length || !arr[0].commit) return;
        var t = new Date(arr[0].commit.committer.date);
        var p = function (n) { return n < 10 ? '0' + n : '' + n; };
        var label = t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate()) + ' ' + p(t.getHours()) + ':' + p(t.getMinutes());
        var span = listEl.querySelector('.write-item-time[data-path="' + f.path + '"]');
        if (span) span.textContent = '更新于 ' + label;
      }).catch(function () {});
    });
  }

  // ---------- 构建进度 ----------
  function trackBuild() {
    var runsUrl = REPO_API + 'actions/runs?per_page=1';
    var tries = 0;
    function poll() {
      fetch(runsUrl, { headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json' } })
        .then(function (r) {
          if (r.status === 403 || r.status === 401) {
            setHint('✅ 已保存！约 2 分钟上线。想显示构建进度，请给令牌加上 "Actions → Read-only" 权限', true);
            return;
          }
          return r.json().then(function (j) {
            tries++;
            var run = j.workflow_runs && j.workflow_runs[0];
            if (run) {
              if (run.status === 'completed') {
                setHint(run.conclusion === 'success' ? '🎉 构建完成，网站已更新！' : '⚠️ 构建失败，请检查内容', run.conclusion === 'success');
                return;
              }
              setHint('✅ 已保存，正在自动构建上线…（' + (run.status === 'in_progress' ? '构建中' : '排队中') + '）', true);
            }
            if (tries < 18) setTimeout(poll, 10000);
            else setHint('✅ 已保存！构建可能仍在进行，稍后刷新网站查看', true);
          });
        })
        .catch(function () {
          if (tries < 18) setTimeout(poll, 10000);
        });
    }
    setTimeout(poll, 1500);
  }

  // ---------- 列表 ----------
  function loadList() {
    setHint('正在加载文章列表…', true);

    // 草稿箱
    api('source/_drafts')
      .then(function (files) {
        var drafts = files.filter(function (f) { return /\.md$/.test(f.name); });
        drafts.sort(function (a, b) { return b.name.localeCompare(a.name); });
        draftsListEl.innerHTML = drafts.length
          ? drafts.map(function (f) {
            return '<li class="write-item">' +
              '<span class="write-item-name">' + f.name + '</span>' +
              '<span class="write-item-time" data-path="' + f.path + '"></span>' +
              '<span class="write-item-actions">' +
              '<button data-act="edit-draft" data-path="' + f.path + '">继续写</button>' +
              '<button data-act="pub-draft" data-path="' + f.path + '">发布</button>' +
              '<button data-act="del-draft" data-path="' + f.path + '">删除</button>' +
              '</span></li>';
          }).join('')
          : '<li class="write-item"><span class="write-item-name">暂无草稿</span></li>';
        attachTimes(draftsListEl, drafts);
      })
      .catch(function () {
        draftsListEl.innerHTML = '<li class="write-item"><span class="write-item-name">暂无草稿</span></li>';
      });

    // 已发布
    api('source/_posts')
      .then(function (files) {
        setHint('已连接 ✅', true);
        var posts = files.filter(function (f) { return /\.md$/.test(f.name); });
        posts.sort(function (a, b) { return b.name.localeCompare(a.name); });
        listEl.innerHTML = posts.length
          ? posts.map(function (f) {
            return '<li class="write-item">' +
              '<span class="write-item-name">' + f.name + '</span>' +
              '<span class="write-item-time" data-path="' + f.path + '"></span>' +
              '<span class="write-item-actions">' +
              '<button data-act="edit" data-path="' + f.path + '">编辑</button>' +
              '<button data-act="del" data-path="' + f.path + '">删除</button>' +
              '</span></li>';
          }).join('')
          : '<li class="write-item"><span class="write-item-name">暂无文章</span></li>';
        attachTimes(listEl, posts);
      })
      .catch(function (e) {
        setHint('连接失败：' + e.message + '（检查令牌是否有 Contents 读写权限）', false);
      });
  }

  // 已发布列表
  listEl.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var path = btn.getAttribute('data-path');
    if (btn.getAttribute('data-act') === 'edit') {
      loadPost(path, false);
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

  // 草稿列表
  draftsListEl.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var path = btn.getAttribute('data-path');
    var act = btn.getAttribute('data-act');
    if (act === 'edit-draft') {
      loadPost(path, true);
    } else if (act === 'del-draft') {
      if (!confirm('确定删除草稿 ' + path + ' ？')) return;
      api(path, { method: 'GET' }).then(function (meta) {
        return api(path, {
          method: 'DELETE',
          body: JSON.stringify({ message: 'delete draft: ' + path, sha: meta.sha })
        });
      }).then(function () {
        setHint('草稿已删除', true);
        loadList();
      }).catch(function (err) { setHint('删除失败：' + err.message, false); });
    } else if (act === 'pub-draft') {
      publishDraft(path);
    }
  });

  function publishDraft(path) {
    if (!token) { setHint('请先粘贴令牌并连接', false); return; }
    setHint('正在发布草稿…', true);
    api(path, { method: 'GET' }).then(function (meta) {
      var content = meta.content; // base64 原样搬移
      var target = 'source/_posts/' + path.replace(/^source\/_drafts\//, '');
      return api(target, {
        method: 'PUT',
        body: JSON.stringify({ message: 'post: publish draft', content: content })
      }).then(function () {
        return api(path, {
          method: 'DELETE',
          body: JSON.stringify({ message: 'publish draft: ' + path, sha: meta.sha })
        });
      });
    }).then(function () {
      setHint('✅ 草稿已发布！', true);
      trackBuild();
      newPost();
      loadList();
    }).catch(function (err) { setHint('发布失败：' + err.message, false); });
  }

  function loadPost(path, isDraft) {
    api(path, { method: 'GET' }).then(function (meta) {
      editingPath = path;
      editingSha = meta.sha;
      editingDraft = !!isDraft;
      var raw = b64decode(meta.content);
      var m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
      var fm = m ? m[1] : '';
      var titleM = fm.match(/^title:\s*(.+)$/m);
      titleInput.value = titleM ? titleM[1].trim() : '';

      var catPath = '';
      var catBlock = /^categories:([\s\S]*?)(?=^\S|\z)/m.exec(fm);
      if (catBlock) {
        var listM = catBlock[1].match(/-\s*\[([^\]]+)\]/);
        if (listM) {
          catPath = listM[1].split(',').map(function (s) { return s.trim(); }).join('/');
        } else {
          var singleM = catBlock[1].match(/-\s*(.+)$/m);
          if (singleM) catPath = singleM[1].trim();
        }
      }
      catInput.value = catPath;

      var tagList = [];
      var tg = /^tags:([\s\S]*?)(?=^\S|\z)/m.exec(fm);
      if (tg) {
        var t2;
        var tagRe = /^\s*-\s*(.+)$/gm;
        while ((t2 = tagRe.exec(tg[1])) !== null) tagList.push(t2[1].trim());
      }
      tagsInput.value = tagList.join(', ');
      contentEl.value = m ? raw.slice(m[0].length) : raw;
      renderPreview();
      updateModeUI();
      setHint((isDraft ? '正在编辑草稿：' : '正在编辑：') + path, true);
    }).catch(function (err) { setHint('读取失败：' + err.message, false); });
  }

  function newPost() {
    editingPath = null;
    editingSha = null;
    editingDraft = false;
    titleInput.value = '';
    catInput.value = '';
    tagsInput.value = '';
    contentEl.value = '';
    renderPreview();
    updateModeUI();
    setHint('新建文章模式', true);
  }

  document.getElementById('write-new-btn').addEventListener('click', newPost);

  // ---------- 实时预览 ----------
  var markedReady = false;
  var previewTimer = null;

  function loadMarked() {
    if (markedReady || window.marked) {
      markedReady = true;
      return;
    }
    var s = document.createElement('script');
    s.src = '/js/marked.umd.js';
    s.onload = function () { markedReady = true; renderPreview(); };
    document.body.appendChild(s);
  }

  function renderPreview() {
    var v = contentEl.value.trim();
    if (!v) {
      previewEl.innerHTML = '<div class="write-preview-empty">实时预览区：输入正文后自动渲染</div>';
      return;
    }
    if (!markedReady) {
      previewEl.innerHTML = '<div class="write-preview-empty">预览引擎加载中…</div>';
      loadMarked();
      return;
    }
    previewEl.innerHTML = window.marked.parse(contentEl.value);
  }

  contentEl.addEventListener('input', function () {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, 250);
  });

  loadMarked();

  // ---------- 暂存 ----------
  draftBtn.addEventListener('click', function () {
    if (!token) { setHint('请先粘贴令牌并连接', false); return; }
    var title = titleInput.value.trim();
    if (!title) { setHint('请填写文章标题', false); return; }
    var content = b64encode(buildFm(title) + contentEl.value);

    if (editingPath && editingDraft) {
      api(editingPath, { method: 'GET' }).then(function (m) {
        return api(editingPath, {
          method: 'PUT',
          body: JSON.stringify({ message: 'draft: ' + title, content: content, sha: m.sha })
        });
      }).then(function () {
        setHint('✅ 草稿已更新（未上线）', true);
        loadList();
      }).catch(function (err) { setHint('暂存失败：' + err.message, false); });
    } else if (editingPath && !editingDraft) {
      return; // 已发布文章不提供暂存（按钮已隐藏）
    } else {
      var dpath = 'source/_drafts/' + nowStr().slice(0, 10) + '-' + slugify(title) + '.md';
      api(dpath, {
        method: 'PUT',
        body: JSON.stringify({ message: 'draft: ' + title, content: content })
      }).then(function () {
        editingPath = dpath;
        editingDraft = true;
        updateModeUI();
        setHint('✅ 已暂存到草稿箱（不会上线），可继续写或点"发布"', true);
        loadList();
      }).catch(function (err) { setHint('暂存失败：' + err.message, false); });
    }
  });

  // ---------- 发布 / 保存 ----------
  document.getElementById('write-save').addEventListener('click', function () {
    if (!token) { setHint('请先粘贴令牌并连接', false); return; }
    var title = titleInput.value.trim();
    if (!title) { setHint('请填写文章标题', false); return; }
    var content = b64encode(buildFm(title) + contentEl.value);

    if (editingDraft && editingPath) {
      // 草稿转正：建 post 文件 → 删草稿
      var target = 'source/_posts/' + editingPath.replace(/^source\/_drafts\//, '');
      setHint('正在发布草稿…', true);
      api(target, {
        method: 'PUT',
        body: JSON.stringify({ message: 'post: ' + title, content: content })
      }).then(function () {
        return api(editingPath, { method: 'GET' }).then(function (m) {
          return api(editingPath, {
            method: 'DELETE',
            body: JSON.stringify({ message: 'publish: ' + title, sha: m.sha })
          });
        });
      }).then(function () {
        setHint('✅ 已发布！', true);
        trackBuild();
        newPost();
        loadList();
      }).catch(function (err) { setHint('发布失败：' + err.message, false); });
      return;
    }

    var path = editingPath || ('source/_posts/' + nowStr().slice(0, 10) + '-' + slugify(title) + '.md');
    var body = {
      message: (editingPath ? 'update: ' : 'post: ') + title,
      content: content
    };
    if (editingSha && editingPath) body.sha = editingSha;

    setHint('正在保存…', true);
    api(path, { method: 'PUT', body: JSON.stringify(body) })
      .then(function () {
        setHint('✅ 已保存！', true);
        trackBuild();
        newPost();
        loadList();
        loadCatPaths();
      })
      .catch(function (err) { setHint('保存失败：' + err.message, false); });
  });

  updateModeUI();
})();
