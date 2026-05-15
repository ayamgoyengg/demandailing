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
   — auto-scroll when in view, drag, prev/next, progress bar
   ============================================================ */

(function () {
  var track        = document.getElementById('menuTrack');
  if (!track) return;

  var btnPrev      = document.getElementById('menuPrev');
  var btnNext      = document.getElementById('menuNext');
  var progressFill = document.getElementById('menuProgress');
  var cards        = track.querySelectorAll('.menu-card');
  if (!cards.length) return;

  /* ── drag to scroll (desktop) ── */
  var isDragging = false;
  var dragStartX = 0;
  var dragStart  = 0;

  track.addEventListener('mousedown', function (e) {
    isDragging = true;
    dragStartX = e.pageX;
    dragStart  = track.scrollLeft;
    track.classList.add('is-dragging');
    pauseAuto(4000); // resume after 4s
  });

  document.addEventListener('mouseup', function () {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('is-dragging');
  });

  track.addEventListener('mouseleave', function () {
    if (isDragging) { isDragging = false; track.classList.remove('is-dragging'); }
  });

  track.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    e.preventDefault();
    track.scrollLeft = dragStart - (e.pageX - dragStartX) * 1.4;
  });

  track.addEventListener('click', function (e) {
    if (Math.abs(track.scrollLeft - dragStart) > 4) e.preventDefault();
  }, true);

  /* ── step size ── */
  function stepWidth() {
    var gap = parseFloat(getComputedStyle(track).gap) || 20;
    return cards[0].offsetWidth + gap;
  }

  /* ── prev / next ── */
  if (btnPrev) {
    btnPrev.addEventListener('click', function () {
      pauseAuto(4000);
      track.scrollBy({ left: -stepWidth(), behavior: 'smooth' });
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', function () {
      pauseAuto(4000);
      track.scrollBy({ left: stepWidth(), behavior: 'smooth' });
    });
  }

  /* ── pause on hover ── */
  track.addEventListener('mouseenter', function () { pauseAuto(0); });
  track.addEventListener('mouseleave', function () { if (!isDragging) resumeAuto(); });

  /* ── pause on touch ── */
  track.addEventListener('touchstart', function () { pauseAuto(0); }, { passive: true });
  track.addEventListener('touchend',   function () { pauseAuto(2500); }, { passive: true });

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

  /* ── AUTO-SCROLL (rAF loop) ── */
  var rafId      = null;
  var autoOn     = false;   // section is in viewport
  var paused     = false;   // user is interacting
  var resumeTimer = null;
  var SPEED      = 0.75;    // px per frame (~45px/s at 60fps)

  function tick() {
    if (!paused) {
      var max = track.scrollWidth - track.clientWidth;
      if (max <= 0) { rafId = null; return; }

      if (track.scrollLeft >= max - 1) {
        /* reached end → pause briefly, then snap back to start */
        paused = true;
        setTimeout(function () {
          track.scrollTo({ left: 0, behavior: 'smooth' });
          setTimeout(function () { paused = false; }, 700);
        }, 900);
      } else {
        track.scrollLeft += SPEED;
      }
    }
    if (autoOn) rafId = requestAnimationFrame(tick);
  }

  function startAuto() {
    if (autoOn) return;
    autoOn = true;
    paused = false;
    rafId  = requestAnimationFrame(tick);
  }

  function stopAuto() {
    autoOn = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function pauseAuto(resumeAfterMs) {
    paused = true;
    clearTimeout(resumeTimer);
    if (resumeAfterMs > 0) {
      resumeTimer = setTimeout(resumeAuto, resumeAfterMs);
    }
  }

  function resumeAuto() {
    clearTimeout(resumeTimer);
    paused = false;
  }

  /* ── start / stop with IntersectionObserver ── */
  var section = track.closest('.featured-menu');
  if (section && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          startAuto();
        } else {
          stopAuto();
        }
      });
    }, { threshold: 0.25 });
    io.observe(section);
  }

  /* init UI */
  window.addEventListener('load', updateUI);
  setTimeout(updateUI, 150);
}());
