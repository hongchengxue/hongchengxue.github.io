/* ============================================
   全局音乐播放器：进入网站后首次交互自动播放
   ============================================ */
(function () {
  'use strict';

  if (document.getElementById('aplayer-global')) return;

  var container = document.createElement('div');
  container.id = 'aplayer-global';
  document.body.appendChild(container);

  function initPlayer() {
    var ap = new APlayer({
      container: container,
      fixed: true,        // 固定在左下角
      mini: false,
      autoplay: false,    // 由下方"首次交互"逻辑触发
      theme: '#4285f4',   // 主题色
      loop: 'all',        // 列表循环
      order: 'list',
      preload: 'auto',
      volume: 0.7,
      mutex: true,        // 互斥：同时只播一个
      lrcType: 0,
      listFolded: true,
      listMaxHeight: '170px',
      audio: [
        {
          name: '下一篇章',
          artist: '待定（等待提供音乐文件）',
          url: '/music/next-chapter.mp3',
          cover: '/img/index-bg.jpg'
        }
      ]
    });

    // 浏览器禁止无交互自动出声：进入网站后的第一次
    // 点击 / 滚动 / 按键 / 触摸 / 移动鼠标 时自动开始播放
    var started = false;
    function tryStart() {
      if (started) return;
      started = true;
      ap.play();
    }
    ['click', 'scroll', 'keydown', 'touchstart', 'mousemove'].forEach(function (evt) {
      document.addEventListener(evt, tryStart, { once: true, passive: true });
    });

    window.__globalAplayer = ap;
  }

  // 加载播放器资源（本地文件，不依赖 CDN）
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = '/css/aplayer.min.css';
  document.head.appendChild(css);

  var script = document.createElement('script');
  script.src = '/js/aplayer.min.js';
  script.onload = initPlayer;
  document.body.appendChild(script);
})();
