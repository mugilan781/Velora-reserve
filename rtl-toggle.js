/* ============================================================
   VÉLORA RESERVE — RTL Direction Toggle
   Persistent direction switching with localStorage.
   Injects a language/direction toggle button into the navbar.
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'veloraDirection';

  // ─── 1. Resolve Direction (runs instantly, before paint) ───
  function getPreferredDirection() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'rtl' || stored === 'ltr') return stored;
    return 'ltr'; // LTR is the default
  }

  function applyDirection(dir, animate) {
    const html = document.documentElement;

    if (animate) {
      html.classList.add('dir-transition');
      setTimeout(() => html.classList.remove('dir-transition'), 500);
    }

    html.setAttribute('dir', dir);

    // Update all toggle button states
    document.querySelectorAll('.rtl-toggle-btn').forEach(btn => {
      const isRTL = dir === 'rtl';
      btn.setAttribute('aria-pressed', isRTL ? 'true' : 'false');
      btn.setAttribute('aria-label', isRTL ? 'Switch to LTR mode' : 'Switch to RTL mode');
      btn.classList.toggle('rtl-active', isRTL);
    });
  }

  function toggleDirection() {
    const current = document.documentElement.getAttribute('dir');
    const next = current === 'rtl' ? 'ltr' : 'rtl';
    localStorage.setItem(STORAGE_KEY, next);
    applyDirection(next, true);
  }

  // ─── 2. Apply immediately (FOUC prevention) ───
  applyDirection(getPreferredDirection(), false);

  // ─── 3. Build toggle button icon (Language / Globe icon) ───
  const ltrIcon = '<svg class="icon-ltr" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  const rtlIcon = '<svg class="icon-rtl" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  const toggleHTML = ltrIcon + rtlIcon;

  // ─── 4. Inject on DOM ready ───
  function injectToggle() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      // Insert BEFORE the theme toggle button (so order is: RTL toggle → Theme toggle → Profile → Book Now)
      const themeToggle = navLinks.querySelector('.theme-toggle-btn');
      const profileWrap = navLinks.querySelector('.nav-profile-wrap');
      const bookBtn = navLinks.querySelector('.nav-book-btn');
      const insertBefore = themeToggle || profileWrap || bookBtn;

      if (insertBefore) {
        const btn = document.createElement('button');
        btn.className = 'rtl-toggle-btn';
        const dir = getPreferredDirection();
        btn.setAttribute('aria-label', dir === 'rtl' ? 'Switch to LTR mode' : 'Switch to RTL mode');
        btn.setAttribute('aria-pressed', dir === 'rtl' ? 'true' : 'false');
        btn.setAttribute('role', 'switch');
        btn.innerHTML = toggleHTML;
        if (dir === 'rtl') btn.classList.add('rtl-active');
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          toggleDirection();
        });
        navLinks.insertBefore(btn, insertBefore);
      }
    }
  }

  // ─── 5. Init when DOM is ready ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectToggle);
  } else {
    injectToggle();
  }

  // ─── 6. Expose API ───
  window.VeloraDirection = {
    toggle: toggleDirection,
    get: getPreferredDirection,
    set: function (dir) {
      localStorage.setItem(STORAGE_KEY, dir);
      applyDirection(dir, true);
    }
  };

})();
