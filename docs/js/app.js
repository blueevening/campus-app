(function () {
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');

  function applyTheme(t, persist) {
    root.setAttribute('data-theme', t);
    if (persist !== false) {
      try { localStorage.setItem('theme', t); } catch (e) {}
    }
    if (toggle) toggle.textContent = t === 'light' ? '☾' : '☀';
  }

  // 初始化按钮图标（head 内联脚本已设置 data-theme）
  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark', false);

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next, true);
    });
  }

  // 导航折叠
  var nav = document.getElementById('topNav');
  var navToggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  if (navToggle && links) {
    navToggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }
})();
