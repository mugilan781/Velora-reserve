/* ============================================================
   VÉLORA RESERVE — Theme Engine
   OS detection, localStorage persistence, toggle logic,
   and automatic toggle button injection into the navbar.
   ============================================================ */

(function() {
  'use strict';

  const STORAGE_KEY = 'velora_theme';

  // ─── 1. Resolve Theme (runs instantly, before paint) ───
  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;

    // Detect OS preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function applyTheme(theme, animate) {
    const html = document.documentElement;

    if (animate) {
      html.classList.add('theme-transition');
      setTimeout(() => html.classList.remove('theme-transition'), 600);
    }

    if (theme === 'light') {
      html.setAttribute('data-theme', 'light');
    } else {
      html.removeAttribute('data-theme');
    }

    // Update toggle icon visibility (handled by CSS, but update aria)
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    });

    // Update mobile label
    document.querySelectorAll('.mobile-theme-label').forEach(label => {
      label.textContent = theme === 'light' ? 'Dark Mode' : 'Light Mode';
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next, true);
  }

  // ─── 2. Apply immediately (FOUC prevention) ───
  applyTheme(getPreferredTheme(), false);

  // ─── 3. Build toggle button HTML ───
  const sunIcon = '<svg class="icon-sun" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  const moonIcon = '<svg class="icon-moon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const toggleHTML = sunIcon + moonIcon;

  // ─── 4. Inject on DOM ready ───
  function injectToggle() {
    // Desktop: insert before .nav-profile-wrap (or before .nav-book-btn)
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      const profileWrap = navLinks.querySelector('.nav-profile-wrap');
      const bookBtn = navLinks.querySelector('.nav-book-btn');
      const insertBefore = profileWrap || bookBtn;

      if (insertBefore) {
        const btn = document.createElement('button');
        btn.className = 'theme-toggle-btn';
        btn.setAttribute('aria-label', getPreferredTheme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
        btn.innerHTML = toggleHTML;
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          toggleTheme();
        });
        navLinks.insertBefore(btn, insertBefore);
      }
    }



    // Dashboard sidebar: no toggle needed (uses the main nav toggle)
  }

  // ─── 5. Listen for OS theme changes ───
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(e) {
      // Only auto-switch if user hasn't manually chosen
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'light' : 'dark', true);
      }
    });
  }

  // ─── 6. Init when DOM is ready ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectToggle);
  } else {
    injectToggle();
  }

  // ─── 7. Expose API for other scripts ───
  window.VeloraTheme = {
    toggle: toggleTheme,
    get: getPreferredTheme,
    set: function(theme) {
      localStorage.setItem(STORAGE_KEY, theme);
      applyTheme(theme, true);
    }
  };

})();
