/* ============================================================
   MENU PAGE — Makanan / Minuman tab switching
   ============================================================ */

(function () {
  var tabs   = document.querySelectorAll('.menu-tab');
  var panels = document.querySelectorAll('.menu-panel');

  if (!tabs.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.dataset.tab;

      // Update tab states
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      // Show / hide panels
      panels.forEach(function (panel) {
        panel.hidden = panel.dataset.panel !== target;
      });
    });
  });
}());
