(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  /* ---------- Split text into staggered words ---------- */
  function splitWords(root) {
    var index = 0;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var textNodes = [];
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim().length === 0) continue;
      textNodes.push(node);
    }
    textNodes.forEach(function (textNode) {
      var parts = textNode.nodeValue.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (part) {
        if (part === '') return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          var span = document.createElement('span');
          span.className = 'word';
          span.style.setProperty('--i', index++);
          span.textContent = part;
          frag.appendChild(span);
        }
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
  }
  document.querySelectorAll('[data-split]').forEach(splitWords);

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated stat counters ---------- */
  var statNums = document.querySelectorAll('.stat__num');
  var countersStarted = false;
  function animateCounters() {
    if (countersStarted) return;
    countersStarted = true;
    statNums.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var duration = 1400;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('vi-VN');
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('vi-VN');
      }
      requestAnimationFrame(step);
    });
  }
  var heroStats = document.querySelector('.hero__stats');
  if (heroStats && 'IntersectionObserver' in window) {
    var statsIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          statsIo.disconnect();
        }
      });
    }, { threshold: 0.4 });
    statsIo.observe(heroStats);
  } else {
    animateCounters();
  }

  /* ---------- Copy connect string ---------- */
  var copyBtn = document.getElementById('copyBtn');
  var connectString = document.getElementById('connectString');
  if (copyBtn && connectString) {
    copyBtn.addEventListener('click', function () {
      var text = connectString.textContent.trim();
      var done = function () {
        var original = copyBtn.textContent;
        copyBtn.textContent = 'Đã sao chép';
        setTimeout(function () { copyBtn.textContent = original; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          fallbackCopy(text, done);
        });
      } else {
        fallbackCopy(text, done);
      }
    });
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* no-op */ }
    document.body.removeChild(ta);
    done();
  }

  /* ---------- Scroll progress bar ---------- */
  var progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    var updateProgress = function () {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var pct = height > 0 ? (scrollTop / height) * 100 : 0;
      progressBar.style.width = pct + '%';
    };
    var progressTicking = false;
    window.addEventListener('scroll', function () {
      if (progressTicking) return;
      progressTicking = true;
      requestAnimationFrame(function () { updateProgress(); progressTicking = false; });
    });
    updateProgress();
  }

  /* ---------- Cursor glow ---------- */
  var cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && finePointer && !reduceMotion) {
    var glowX = 0, glowY = 0, glowShown = false;
    window.addEventListener('pointermove', function (e) {
      glowX = e.clientX;
      glowY = e.clientY;
      cursorGlow.style.transform = 'translate(' + glowX + 'px,' + glowY + 'px) translate(-50%,-50%)';
      if (!glowShown) { cursorGlow.style.opacity = '1'; glowShown = true; }
    });
    window.addEventListener('mouseleave', function () { cursorGlow.style.opacity = '0'; });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.btn--primary, .btn--outline').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + (x * 0.22) + 'px,' + (y * 0.32) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- Cursor-follow card spotlight ---------- */
  if (finePointer) {
    document.querySelectorAll('.bento__card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ---------- Mascot parallax tilt ---------- */
  var heroArt = document.querySelector('.hero__art');
  var mascotTilt = document.getElementById('mascotTilt');
  if (heroArt && mascotTilt && finePointer && !reduceMotion) {
    heroArt.addEventListener('mousemove', function (e) {
      var r = heroArt.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      mascotTilt.style.transform = 'rotateY(' + (px * 16) + 'deg) rotateX(' + (py * -16) + 'deg)';
    });
    heroArt.addEventListener('mouseleave', function () { mascotTilt.style.transform = ''; });
  }

  /* ---------- Snowfall canvas ---------- */
  var canvas = document.getElementById('snowfall');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var flakes = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = Math.min(window.innerHeight * 1.4, document.documentElement.scrollHeight);
  }

  function makeFlakes() {
    var count = Math.max(30, Math.min(70, Math.floor(window.innerWidth / 22)));
    flakes = [];
    for (var i = 0; i < count; i++) {
      flakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.6,
        speed: Math.random() * 0.6 + 0.15,
        drift: Math.random() * 0.6 - 0.3,
        alpha: Math.random() * 0.5 + 0.25
      });
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#eef7ff';
    flakes.forEach(function (f) {
      ctx.globalAlpha = f.alpha;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      f.y += f.speed;
      f.x += f.drift;
      if (f.y > canvas.height) { f.y = -4; f.x = Math.random() * canvas.width; }
      if (f.x > canvas.width) f.x = 0;
      if (f.x < 0) f.x = canvas.width;
    });
    ctx.globalAlpha = 1;
    if (!reduceMotion) requestAnimationFrame(tick);
  }

  resize();
  makeFlakes();
  window.addEventListener('resize', function () {
    resize();
    makeFlakes();
  });

  if (!reduceMotion) {
    requestAnimationFrame(tick);
  } else {
    tick();
  }
})();
