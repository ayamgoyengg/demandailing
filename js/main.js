/* ============================================================
   NAVBAR — scroll state + hamburger
   ============================================================ */

(function () {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');

  if (!navbar || !hamburger || !navMenu) return;

  function onScroll() {
    navbar.classList.toggle('is-scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  hamburger.addEventListener('click', function () {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('is-open', !expanded);
    document.body.style.overflow = expanded ? '' : 'hidden';
  });

  navMenu.querySelectorAll('.navbar__link').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  });
}());

/* ============================================================
   SCROLL ANIMATIONS — fade-in + stagger
   ============================================================ */

(function () {
  var targets = document.querySelectorAll('.fade-in, .stagger-children');
  if (!targets.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });

  targets.forEach(function (el) { observer.observe(el); });
}());

/* ============================================================
   FEATURED MENU CAROUSEL
   — auto-scroll per 3 detik, drag, prev/next, progress bar
   ============================================================ */

(function () {
  var track        = document.getElementById('menuTrack');
  if (!track) return;

  var btnPrev      = document.getElementById('menuPrev');
  var btnNext      = document.getElementById('menuNext');
  var progressFill = document.getElementById('menuProgress');
  var cards        = Array.prototype.slice.call(track.querySelectorAll('.menu-card'));
  if (!cards.length) return;

  var currentIdx  = 0;
  var intervalId  = null;
  var resumeTimer = null;

  /* ── scroll ke index tertentu ── */
  function scrollToIdx(idx) {
    currentIdx = Math.max(0, Math.min(idx, cards.length - 1));
    var gap = parseFloat(getComputedStyle(track).gap) || 16;
    var target = cards[currentIdx].offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || 0);
    track.scrollTo({ left: target, behavior: 'smooth' });
  }

  /* ── prev / next ── */
  if (btnPrev) {
    btnPrev.addEventListener('click', function () {
      pauseAuto(4000);
      scrollToIdx(currentIdx - 1);
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', function () {
      pauseAuto(4000);
      scrollToIdx(currentIdx + 1);
    });
  }

  /* ── drag to scroll (desktop) ── */
  var isDragging = false;
  var dragStartX = 0;
  var dragStart  = 0;

  track.addEventListener('mousedown', function (e) {
    isDragging = true;
    dragStartX = e.pageX;
    dragStart  = track.scrollLeft;
    track.classList.add('is-dragging');
    pauseAuto(4000);
  });

  document.addEventListener('mouseup', function () {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('is-dragging');
    syncIdxFromScroll();
  });

  track.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    e.preventDefault();
    track.scrollLeft = dragStart - (e.pageX - dragStartX) * 1.4;
  });

  track.addEventListener('click', function (e) {
    if (Math.abs(track.scrollLeft - dragStart) > 4) e.preventDefault();
  }, true);

  /* ── touch ── */
  track.addEventListener('touchstart', function () { pauseAuto(0); }, { passive: true });
  track.addEventListener('touchend',   function () {
    syncIdxFromScroll();
    pauseAuto(3000);
  }, { passive: true });

  /* ── sync currentIdx dari posisi scroll ── */
  function syncIdxFromScroll() {
    var gap = parseFloat(getComputedStyle(track).gap) || 16;
    var step = cards[0].offsetWidth + gap;
    currentIdx = Math.round(track.scrollLeft / step);
    currentIdx = Math.max(0, Math.min(currentIdx, cards.length - 1));
  }

  /* ── progress bar + button states ── */
  function updateUI() {
    var max = track.scrollWidth - track.clientWidth;
    var pct = max > 0 ? track.scrollLeft / max : 0;
    if (progressFill) {
      var w = (1 / cards.length) + pct * (1 - 1 / cards.length);
      progressFill.style.width = (w * 100).toFixed(1) + '%';
    }
    if (btnPrev) btnPrev.disabled = track.scrollLeft <= 2;
    if (btnNext) btnNext.disabled = max > 0 && track.scrollLeft >= max - 2;
  }

  track.addEventListener('scroll', updateUI, { passive: true });

  /* ── AUTO-SCROLL setiap 3 detik ── */
  function autoStep() {
    var nextIdx = currentIdx + 1 >= cards.length ? 0 : currentIdx + 1;
    scrollToIdx(nextIdx);
  }

  function startAuto() {
    if (intervalId) return;
    intervalId = setInterval(autoStep, 3000);
  }

  function stopAuto() {
    clearInterval(intervalId);
    intervalId = null;
  }

  function pauseAuto(resumeAfterMs) {
    stopAuto();
    clearTimeout(resumeTimer);
    if (resumeAfterMs > 0) {
      resumeTimer = setTimeout(startAuto, resumeAfterMs);
    }
  }

  /* ── start/stop saat section masuk/keluar viewport ── */
  var section = track.closest('.featured-menu');
  if (section && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        startAuto();
      } else {
        stopAuto();
      }
    }, { threshold: 0.2 }).observe(section);
  } else {
    startAuto();
  }

  window.addEventListener('load', updateUI);
  setTimeout(updateUI, 150);
}());
