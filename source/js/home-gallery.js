/* ============================================
   首页相册展示区：图片网格 + 点击灯箱放大
   图片列表在 IMAGES 数组中维护
   ============================================ */
(function () {
  'use strict';

  // ★ 相册图片列表：等你发来真实照片后替换这里
  var IMAGES = [
    { src: '/img/index-bg.jpg', title: '壁纸' },
    { src: '/img/page-bg.jpg', title: '横幅' },
    { src: '/img/avatar.png', title: '头像' }
  ];

  function isHome() {
    var p = window.location.pathname;
    return p === '/' || p === '/index.html';
  }

  function build() {
    var inner = document.getElementById('content-inner');
    if (!inner || document.getElementById('home-gallery')) return;

    var sec = document.createElement('div');
    sec.id = 'home-gallery';
    sec.innerHTML =
      '<div class="gallery-title">📷 相册</div>' +
      '<div class="gallery-grid">' +
      IMAGES.map(function (im) {
        return '<a class="gallery-item" data-fancybox="home-gallery" data-caption="' + im.title + '" href="' + im.src + '">' +
          '<img loading="lazy" src="' + im.src + '" alt="' + im.title + '"></a>';
      }).join('') +
      '</div>';
    inner.insertBefore(sec, inner.firstChild);
    bindFancybox();
  }

  function destroy() {
    var el = document.getElementById('home-gallery');
    if (el) el.remove();
  }

  var fbLoading = false;
  function bindFancybox() {
    if (window.Fancybox) {
      window.Fancybox.bind('[data-fancybox="home-gallery"]');
      return;
    }
    if (fbLoading) return;
    fbLoading = true;

    var css1 = document.createElement('link');
    css1.rel = 'stylesheet';
    css1.href = '/css/fancybox.css';
    var css2 = document.createElement('link');
    css2.rel = 'stylesheet';
    css2.href = '/css/fancybox-carousel.css';
    document.head.appendChild(css1);
    document.head.appendChild(css2);

    var script = document.createElement('script');
    script.src = '/js/fancybox.umd.js';
    script.onload = function () {
      window.Fancybox.bind('[data-fancybox="home-gallery"]');
    };
    document.body.appendChild(script);
  }

  function sync() {
    if (isHome()) build();
    else destroy();
  }

  sync();
  if (window.btf && btf.addGlobalFn) {
    btf.addGlobalFn('pjaxComplete', sync, 'home-gallery-sync');
  }
})();
