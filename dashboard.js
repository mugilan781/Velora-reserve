/* ============================================================
   VÉLORA RESERVE — Dashboard Controller (Full Functionality)
   ============================================================
   LocalStorage + SessionStorage. No backend.
   Features: Profile, Wishlist, Notifications, Concierge,
   Reviews, Booking History, Tracking, Settings.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ─── Storage Keys ───
  const KEYS = {
    PROFILE: 'velora_profile',
    WISHLIST: 'velora_wishlist',
    NOTIFICATIONS: 'velora_notifications',
    CONCIERGE: 'velora_concierge',
    REVIEWS: 'velora_reviews',
    BOOKINGS: 'velora_bookings',
    ACTIVITY: 'velora_activity'
  };

  // ─── Session ───
  const session = typeof VeloraAuth !== 'undefined' ? VeloraAuth.getSession() : null;
  const userId = session ? session.userId : 'guest';

  // ─── Navbar Bell Integration ───
  const profileWrap = document.querySelector('.nav-profile-wrap');
  if (profileWrap) {
    if (!document.getElementById('nav-notif-bell-wrap')) {
      const bellWrap = document.createElement('div');
      bellWrap.id = 'nav-notif-bell-wrap';
      bellWrap.className = 'nav-notif-wrap';
      bellWrap.style.cssText = 'position: relative; margin-right: 12px; display: flex; align-items: center;';
      bellWrap.innerHTML = `
        <button class="nav-profile-btn" id="nav-notif-bell" aria-label="Notifications" style="position: relative;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="nav-notif-badge" id="nav-notif-count" style="position: absolute; top: -4px; right: -4px; background: var(--gold); color: var(--midnight); font-size: 0.55rem; font-weight: bold; width: 14px; height: 14px; border-radius: 50%; display: none; align-items: center; justify-content: center; font-family: var(--font-ui); border: 1px solid var(--midnight); z-index: 2;">0</span>
        </button>
      `;
      profileWrap.parentNode.insertBefore(bellWrap, profileWrap);
    }
  }

  // Bind bell click routing
  const bellBtn = document.getElementById('nav-notif-bell');
  if (bellBtn) {
    bellBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isSystemAdmin = window.location.pathname.includes('admin-dashboard');
      const targetPanelId = isSystemAdmin ? 'panel-admin-notifications' : 'panel-notifications';
      const targetNav = document.querySelector(`.dash-nav-item[data-panel="${targetPanelId}"]`);
      if (targetNav) {
        targetNav.click();
      } else {
        switchPanel(targetPanelId);
      }
    });
  }

  // ─── Utility: Get user-scoped data ───
  function getData(key) {
    try {
      const raw = localStorage.getItem(key + '_' + userId);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function setData(key, data) {
    localStorage.setItem(key + '_' + userId, JSON.stringify(data));
  }

  // ─── Toast ───
  function showToast(message) {
    const toast = document.getElementById('dash-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  // ─── Format Date ───
  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'h ago';
    const days = Math.floor(hours / 24);
    if (days < 7) return days + 'd ago';
    return formatDate(iso);
  }

  // ─── Generate ID ───
  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  }

  // ═══════════════════════════════════════════
  //  SIDEBAR NAVIGATION & PANEL SWITCHING
  // ═══════════════════════════════════════════
  const navItems = document.querySelectorAll('.dash-nav-item[data-panel]');
  const panels = document.querySelectorAll('.dash-panel');
  const sidebarToggle = document.getElementById('dash-sidebar-toggle');
  const sidebar = document.getElementById('dash-sidebar');
  const overlay = document.getElementById('dash-sidebar-overlay');

  function switchPanel(panelId) {
    navItems.forEach(item => item.classList.remove('active'));
    panels.forEach(panel => panel.classList.remove('active'));
    const targetPanel = document.getElementById(panelId);
    const targetNav = document.querySelector(`.dash-nav-item[data-panel="${panelId}"]`);
    if (targetPanel) {
      targetPanel.classList.add('active');
      targetPanel.style.animation = 'none';
      targetPanel.offsetHeight;
      targetPanel.style.animation = '';
    }
    if (targetNav) targetNav.classList.add('active');
    closeSidebar();
    const main = document.querySelector('.dash-main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const panelId = item.getAttribute('data-panel');
      if (panelId) switchPanel(panelId);
    });
  });

  function openSidebar() { if (sidebar) sidebar.classList.add('open'); if (overlay) overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function closeSidebar() { if (sidebar) sidebar.classList.remove('open'); if (overlay) overlay.classList.remove('active'); document.body.style.overflow = ''; }
  if (sidebarToggle) sidebarToggle.addEventListener('click', () => sidebar && sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
  if (overlay) overlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });

  // ─── Toggle Switches ───
  document.querySelectorAll('.dash-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => toggle.classList.toggle('active'));
  });

  // ─── Render Current Date ───
  const dateEl = document.getElementById('dash-current-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  // ═══════════════════════════════════════════
  //  1. PROFILE MANAGEMENT
  // ═══════════════════════════════════════════
  function getProfile() {
    let profile = getData(KEYS.PROFILE);
    if (!profile && session) {
      profile = { name: session.name, email: session.email, phone: '', dob: '', address: '' };
      setData(KEYS.PROFILE, profile);
    }
    return profile || { name: '', email: '', phone: '', dob: '', address: '' };
  }

  function populateUserInfo() {
    const profile = getProfile();
    const name = profile.name || (session ? session.name : 'Guest');
    const email = profile.email || (session ? session.email : '');

    // Welcome
    const welcomeName = document.getElementById('dash-welcome-user');
    if (welcomeName) welcomeName.textContent = name.split(' ')[0];

    // Sidebar
    const sidebarName = document.getElementById('dash-sidebar-name');
    const sidebarEmail = document.getElementById('dash-sidebar-email');
    if (sidebarName) sidebarName.textContent = name;
    if (sidebarEmail) sidebarEmail.textContent = email;

    // Profile panel
    const pfName = document.getElementById('dash-pf-name');
    const pfEmail = document.getElementById('dash-pf-email');
    if (pfName) pfName.textContent = name;
    if (pfEmail) pfEmail.textContent = email;

    // Settings form pre-fill
    const sName = document.getElementById('settings-name');
    const sEmail = document.getElementById('settings-email');
    const sPhone = document.getElementById('settings-phone');
    const sDob = document.getElementById('settings-dob');
    const sAddress = document.getElementById('settings-address');
    if (sName) sName.value = name;
    if (sEmail) sEmail.value = email;
    if (sPhone) sPhone.value = profile.phone || '';
    if (sDob) sDob.value = profile.dob || '';
    if (sAddress) sAddress.value = profile.address || '';
  }

  // Settings cancel handler
  const settingsCancel = document.getElementById('settings-cancel');
  if (settingsCancel) {
    settingsCancel.addEventListener('click', () => populateUserInfo());
  }

  // ═══════════════════════════════════════════
  //  2. WISHLIST
  // ═══════════════════════════════════════════
  const defaultWishlistItems = [
    { id: 'w1', name: 'Ocean Villa Suite', price: '₹79,999/night', category: 'Suite' },
    { id: 'w2', name: 'Sunset Sailing Experience', price: '₹24,999', category: 'Experience' },
    { id: 'w3', name: 'Royal Penthouse', price: '₹1,49,999/night', category: 'Suite' }
  ];

  function getWishlist() {
    let list = getData(KEYS.WISHLIST);
    if (!list) {
      list = defaultWishlistItems;
      setData(KEYS.WISHLIST, list);
    }
    return list;
  }

  function renderWishlist() {
    const container = document.getElementById('wishlist-container');
    if (!container) return;
    const list = getWishlist();

    if (list.length === 0) {
      container.innerHTML = `
        <div class="dash-empty-state">
          <div class="dash-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
          <div class="dash-empty-title">Wishlist Empty</div>
          <div class="dash-empty-desc">Save your favourite suites and experiences to curate your dream escape.</div>
          <a href="suites.html" class="btn btn-outline" style="margin-top: var(--space-lg);">Browse Suites</a>
        </div>`;
      updateOverviewCard(3, list.length);
      return;
    }

    container.innerHTML = `<div class="dash-glass-card">
      <div class="dash-card-header"><h3 class="dash-card-title">Saved Items</h3><span class="dash-card-action">${list.length} item${list.length !== 1 ? 's' : ''}</span></div>
      ${list.map(item => `
        <div class="dash-concierge-item" style="justify-content: space-between;">
          <div class="dash-concierge-content" style="flex:1;">
            <div class="dash-concierge-subject">${item.name}</div>
            <div class="dash-concierge-preview">${item.price} · ${item.category}</div>
          </div>
          <button class="dash-delete-btn" data-wishlist-remove="${item.id}">Remove</button>
        </div>
      `).join('')}
    </div>`;

    container.querySelectorAll('[data-wishlist-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-wishlist-remove');
        let w = getWishlist();
        w = w.filter(i => i.id !== id);
        setData(KEYS.WISHLIST, w);
        addActivity('Wishlist Updated', 'An item was removed from your wishlist.');
        renderWishlist();
        updateOverviewCards();
        showToast('✦ Removed from wishlist');
      });
    });

    updateOverviewCard(3, list.length);
  }

  // ═══════════════════════════════════════════
  //  3. NOTIFICATIONS
  // ═══════════════════════════════════════════
  const defaultNotifications = [
    { id: 'n1', title: 'Welcome to VÉLORA RESERVE', desc: 'Your Gold membership has been activated. Explore exclusive privileges and curated experiences.', icon: 'star', read: false, time: new Date().toISOString() },
    { id: 'n2', title: 'Seasonal Offer Available', desc: 'Monsoon Serenity Package — Save 30% on oceanfront suites. Limited availability.', icon: 'heart', read: false, time: new Date(Date.now() - 7200000).toISOString() },
    { id: 'n3', title: 'Concierge Assigned', desc: 'Your personal luxury concierge is ready to assist with any requests.', icon: 'message', read: false, time: new Date(Date.now() - 10800000).toISOString() }
  ];

  function getNotifications() {
    let list = getData(KEYS.NOTIFICATIONS);
    if (!list) { list = defaultNotifications; setData(KEYS.NOTIFICATIONS, list); }
    return list;
  }

  const notifIcons = {
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    message: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    booking: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    review: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
  };

  function renderNotifications() {
    const container = document.getElementById('notifications-list-container');
    if (!container) return;
    const list = getNotifications();
    const unreadCount = list.filter(n => !n.read).length;

    // Update sidebar badge
    const badge = document.querySelector('[data-panel="panel-notifications"] .dash-nav-badge');
    if (badge) badge.textContent = unreadCount || '';
    if (badge && unreadCount === 0) badge.style.display = 'none';
    else if (badge) badge.style.display = 'flex';

    // Update navbar bell count
    const bellBadge = document.getElementById('nav-notif-count');
    if (bellBadge) {
      bellBadge.textContent = unreadCount || '';
      bellBadge.style.display = unreadCount ? 'flex' : 'none';
    }

    if (list.length === 0) {
      container.innerHTML = '<div class="dash-empty-state"><div class="dash-empty-title">No Notifications</div></div>';
      return;
    }

    container.innerHTML = list.map(n => `
      <div class="dash-notification-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}" style="cursor: pointer; position: relative;">
        <div class="dash-notification-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">${notifIcons[n.icon] || notifIcons.star}</svg>
        </div>
        <div class="dash-notification-content" style="padding-right: 40px;">
          <div class="dash-notification-title">${n.title}</div>
          <div class="dash-notification-desc">${n.desc}</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; height: 100%; min-width: 70px; gap: 8px;">
          <div class="dash-notification-time" style="white-space: nowrap;">${timeAgo(n.time)}</div>
          <button class="dash-delete-btn" style="padding: 2px 6px; font-size: 0.55rem; background: none; border: 1px solid rgba(239, 68, 68, 0.15); color: var(--error); border-radius: 4px; z-index: 10;" data-delete-notif="${n.id}">Delete</button>
        </div>
      </div>
    `).join('');

    // Click to toggle read
    container.querySelectorAll('[data-notif-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-delete-notif]')) return;
        const id = el.getAttribute('data-notif-id');
        const list = getNotifications();
        const notif = list.find(n => n.id === id);
        if (notif) {
          notif.read = !notif.read;
          setData(KEYS.NOTIFICATIONS, list);
          renderNotifications();
        }
      });
    });

    // Bind delete buttons
    container.querySelectorAll('[data-delete-notif]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-delete-notif');
        let list = getNotifications();
        list = list.filter(item => item.id !== id);
        setData(KEYS.NOTIFICATIONS, list);
        renderNotifications();
        showToast('✦ Notification deleted');
      });
    });
  }

  // Mark all read
  const markAllBtn = document.getElementById('mark-all-read-btn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      const list = getNotifications();
      list.forEach(n => n.read = true);
      setData(KEYS.NOTIFICATIONS, list);
      renderNotifications();
      showToast('✦ All notifications marked as read');
    });
  }

  // ═══════════════════════════════════════════
  //  4. CONCIERGE REQUESTS
  // ═══════════════════════════════════════════
  const defaultConcierge = [
    { id: 'c0', subject: 'Welcome — Your Concierge Introduction', category: 'other', message: 'Namaste! I\'m your dedicated luxury concierge. I\'m here to craft every moment of your VÉLORA experience into something extraordinary.', status: 'open', time: new Date().toISOString() }
  ];

  function getConcierge() {
    let list = getData(KEYS.CONCIERGE);
    if (!list) { list = defaultConcierge; setData(KEYS.CONCIERGE, list); }
    return list;
  }

  function renderConcierge() {
    const container = document.getElementById('concierge-list-container');
    if (!container) return;
    const list = getConcierge();

    if (list.length === 0) {
      container.innerHTML = '<div class="dash-empty-state"><div class="dash-empty-title">No Requests</div><div class="dash-empty-desc">Submit your first concierge request above.</div></div>';
      return;
    }

    container.innerHTML = list.map(r => `
      <div class="dash-concierge-item">
        <div class="dash-concierge-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="dash-concierge-content">
          <div class="dash-concierge-subject">${r.subject}</div>
          <div class="dash-concierge-preview">${r.message.substring(0, 120)}${r.message.length > 120 ? '...' : ''}</div>
          <span class="dash-concierge-status ${r.status}">${r.status === 'open' ? 'Open' : 'Closed'}</span>
        </div>
        <div class="dash-concierge-time">${timeAgo(r.time)}</div>
      </div>
    `).join('');
  }

  const conciergeForm = document.getElementById('concierge-form');
  if (conciergeForm) {
    conciergeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const subject = document.getElementById('concierge-subject').value.trim();
      const category = document.getElementById('concierge-category').value;
      const message = document.getElementById('concierge-message').value.trim();

      if (!subject || !message) { showToast('Please fill in subject and message'); return; }

      const list = getConcierge();
      list.unshift({ id: genId(), subject, category, message, status: 'open', time: new Date().toISOString() });
      setData(KEYS.CONCIERGE, list);
      addActivity('Concierge Request Sent', 'Subject: ' + subject);
      addNotification('Concierge Request Received', 'Your request "' + subject + '" has been submitted. Our team will respond shortly.', 'message');
      renderConcierge();
      renderNotifications();
      conciergeForm.reset();
      showToast('✦ Concierge request submitted');
    });
  }

  // ═══════════════════════════════════════════
  //  5. REVIEWS
  // ═══════════════════════════════════════════
  function getReviews() {
    return getData(KEYS.REVIEWS) || [];
  }

  function renderReviews() {
    const container = document.getElementById('reviews-list-container');
    if (!container) return;
    const list = getReviews();

    if (list.length === 0) {
      container.innerHTML = '<div class="dash-empty-state"><div class="dash-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div><div class="dash-empty-title">No Reviews Yet</div><div class="dash-empty-desc">Submit your first review above to share your sanctuary experience.</div></div>';
      return;
    }

    container.innerHTML = `<div class="dash-glass-card">
      <div class="dash-card-header"><h3 class="dash-card-title">Your Reviews</h3><span class="dash-card-action">${list.length} review${list.length !== 1 ? 's' : ''}</span></div>
      <div class="dash-review-list">
        ${list.map(r => `
          <div class="dash-review-item">
            <div class="dash-review-header">
              <div class="dash-review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
              <div class="dash-review-date">${formatDate(r.time)}</div>
            </div>
            <div class="dash-review-property">${r.property}</div>
            <div class="dash-review-text">"${r.text}"</div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  // Star rating interaction
  const starContainer = document.getElementById('review-stars');
  const ratingInput = document.getElementById('review-rating');
  if (starContainer && ratingInput) {
    starContainer.querySelectorAll('.dash-star').forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.getAttribute('data-value'));
        ratingInput.value = val;
        starContainer.querySelectorAll('.dash-star').forEach(s => {
          s.classList.toggle('active', parseInt(s.getAttribute('data-value')) <= val);
        });
      });
      star.addEventListener('mouseenter', () => {
        const val = parseInt(star.getAttribute('data-value'));
        starContainer.querySelectorAll('.dash-star').forEach(s => {
          const sv = parseInt(s.getAttribute('data-value'));
          s.style.color = sv <= val ? 'var(--gold)' : '';
        });
      });
      star.addEventListener('mouseleave', () => {
        const current = parseInt(ratingInput.value);
        starContainer.querySelectorAll('.dash-star').forEach(s => {
          const sv = parseInt(s.getAttribute('data-value'));
          s.style.color = sv <= current ? 'var(--gold)' : '';
        });
      });
    });
  }

  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const property = document.getElementById('review-property').value;
      const rating = parseInt(document.getElementById('review-rating').value);
      const text = document.getElementById('review-text').value.trim();

      if (!rating || rating === 0) { showToast('Please select a star rating'); return; }
      if (!text) { showToast('Please write your experience'); return; }

      const list = getReviews();
      list.unshift({ id: genId(), property, rating, text, time: new Date().toISOString() });
      setData(KEYS.REVIEWS, list);
      addActivity('Review Submitted', rating + '-star review for ' + property);
      addNotification('Review Published', 'Your ' + rating + '-star review for ' + property + ' is now live.', 'review');
      renderReviews();
      renderNotifications();
      reviewForm.reset();
      ratingInput.value = 0;
      starContainer.querySelectorAll('.dash-star').forEach(s => { s.classList.remove('active'); s.style.color = ''; });
      showToast('✦ Review submitted successfully');
    });
  }

  // ═══════════════════════════════════════════
  //  6. BOOKING HISTORY
  // ═══════════════════════════════════════════
  function getBookings() {
    return getData(KEYS.BOOKINGS) || [];
  }

  function renderBookingHistory() {
    const container = document.getElementById('booking-history-container');
    if (!container) return;
    const list = getBookings();

    if (list.length === 0) {
      container.innerHTML = `
        <div class="dash-card-header"><h3 class="dash-card-title">Past Reservations</h3></div>
        <div class="dash-empty-state">
          <div class="dash-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <div class="dash-empty-title">No Booking History</div>
          <div class="dash-empty-desc">Your completed stays will appear here</div>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="dash-card-header"><h3 class="dash-card-title">Past Reservations</h3><span class="dash-card-action">${list.length} booking${list.length !== 1 ? 's' : ''}</span></div>
      <table class="dash-data-table">
        <thead><tr><th>Property</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Status</th><th>Total</th></tr></thead>
        <tbody>
          ${list.map(b => `<tr>
            <td>${b.property || 'Suite'}</td>
            <td>${b.checkIn ? formatDate(b.checkIn) : '—'}</td>
            <td>${b.checkOut ? formatDate(b.checkOut) : '—'}</td>
            <td>${b.guests || '—'}</td>
            <td><span class="dash-reservation-status ${b.status || 'completed'}">${b.status || 'Completed'}</span></td>
            <td style="color: var(--gold); font-weight: 600;">${b.total || '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  // ═══════════════════════════════════════════
  //  ACTIVE RESERVATIONS
  // ═══════════════════════════════════════════
  function renderActiveReservations() {
    const container = document.getElementById('active-reservations-container');
    if (!container) return;
    const allBookings = getBookings();
    const active = allBookings.filter(b => b.status === 'confirmed' || b.status === 'pending');

    // Update sidebar badge
    const badge = document.querySelector('[data-panel="panel-active"] .dash-nav-badge');
    if (badge) { badge.textContent = active.length || ''; badge.style.display = active.length ? 'flex' : 'none'; }

    if (active.length === 0) {
      container.innerHTML = `
        <div class="dash-empty-state">
          <div class="dash-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <div class="dash-empty-title">No Active Reservations</div>
          <div class="dash-empty-desc">Your next luxury escape awaits. Browse our curated suites and destinations.</div>
          <a href="booking.html" class="btn btn-gold" style="margin-top: var(--space-lg);">Book a Stay</a>
        </div>`;
      return;
    }

    container.innerHTML = `<div class="dash-reservations-grid">
      ${active.map(b => `
        <div class="dash-reservation-card">
          <div class="dash-reservation-body">
            <span class="dash-reservation-status ${b.status}">${b.status}</span>
            <div class="dash-reservation-name">${b.property || 'Luxury Suite'}</div>
            <div class="dash-reservation-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>${b.checkIn ? formatDate(b.checkIn) : '—'} → ${b.checkOut ? formatDate(b.checkOut) : '—'}</div>
            <div class="dash-reservation-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>${b.guests || '2'} Guest${(b.guests || 2) > 1 ? 's' : ''}</div>
          </div>
        </div>
      `).join('')}
    </div>`;
  }

  // ═══════════════════════════════════════════
  //  7. TRACKING CENTER
  // ═══════════════════════════════════════════
  function renderTracking() {
    const container = document.getElementById('tracking-center-container');
    if (!container) return;
    const allBookings = getBookings();
    const active = allBookings.find(b => b.status === 'confirmed' || b.status === 'pending');
    
    const steps = [
      'Booking Submitted',
      'Under Review',
      'Reservation Confirmed',
      'Villa Assigned',
      'Ready For Arrival',
      'Checked In'
    ];

    const icons = {
      'Booking Submitted': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
      'Under Review': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      'Reservation Confirmed': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
      'Villa Assigned': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
      'Ready For Arrival': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
      'Checked In': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
    };

    let currentStep = active ? (active.trackingStep !== undefined ? active.trackingStep : 0) : -1;

    container.innerHTML = `<div class="dash-glass-card">
      <div class="dash-card-header">
        <h3 class="dash-card-title">Reservation Progress</h3>
        ${active && active.trackingId ? `<span class="dash-card-action" style="font-family: var(--font-ui); font-size: var(--text-xs); color: var(--gold); letter-spacing: 0.05em; font-weight: 600;">ID: ${active.trackingId}</span>` : ''}
      </div>
      <div class="dash-tracking-steps">
        ${steps.map((step, i) => {
          let cls = '';
          if (i < currentStep) cls = 'completed';
          else if (i === currentStep) cls = 'active';
          return `<div class="dash-tracking-step ${cls}">
            <div class="dash-tracking-dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor">${icons[step]}</svg></div>
            <div class="dash-tracking-label">${step}</div>
          </div>`;
        }).join('')}
      </div>
      ${active ? `<p style="text-align: center; font-family: var(--font-display); font-size: var(--text-base); color: var(--gold); margin-top: var(--space-md); font-weight: 500;">Current Stage: <em>${steps[currentStep] || 'Awaiting'}</em></p>` : ''}
      <p style="text-align: center; font-family: var(--font-ui); font-size: var(--text-xs); color: var(--gray); margin-top: var(--space-sm);">
        ${active ? 'Tracking your reservation at <strong>' + (active.property || 'VÉLORA Suite') + '</strong>' : 'Tracking data will update when you have an active reservation'}
      </p>
    </div>`;
  }

  // ═══════════════════════════════════════════
  //  ACTIVITY LOG
  // ═══════════════════════════════════════════
  function getActivity() {
    let list = getData(KEYS.ACTIVITY);
    if (!list) {
      list = [
        { title: 'Account Created', desc: 'Welcome to VÉLORA RESERVE. Your sanctuary journey begins.', time: new Date().toISOString() },
        { title: 'Profile Completed', desc: 'Your guest profile has been set up for personalized experiences.', time: new Date().toISOString() },
        { title: 'Gold Membership Activated', desc: "You've been enrolled in our Gold Loyalty tier with exclusive privileges.", time: new Date().toISOString() }
      ];
      setData(KEYS.ACTIVITY, list);
    }
    return list;
  }

  function addActivity(title, desc) {
    const list = getActivity();
    list.unshift({ title, desc, time: new Date().toISOString() });
    if (list.length > 50) list.pop();
    setData(KEYS.ACTIVITY, list);
    renderActivity();
  }

  function renderActivity() {
    const container = document.querySelector('#panel-activity .dash-glass-card .dash-timeline');
    if (!container) return;
    const list = getActivity();

    container.innerHTML = list.slice(0, 20).map((item, i) => `
      <div class="dash-timeline-item">
        <div class="dash-timeline-dot-wrap">
          <div class="dash-timeline-dot ${i === 0 ? 'gold' : ''}"></div>
          ${i < Math.min(list.length, 20) - 1 ? '<div class="dash-timeline-line"></div>' : ''}
        </div>
        <div class="dash-timeline-content">
          <div class="dash-timeline-title">${item.title}</div>
          <div class="dash-timeline-desc">${item.desc}</div>
          <div class="dash-timeline-time">${timeAgo(item.time)}</div>
        </div>
      </div>
    `).join('');
  }

  function addNotification(title, desc, icon) {
    const list = getNotifications();
    list.unshift({ id: genId(), title, desc, icon: icon || 'star', read: false, time: new Date().toISOString() });
    if (list.length > 50) list.pop();
    setData(KEYS.NOTIFICATIONS, list);
  }

  function addUserNotification(targetUserId, title, desc, icon) {
    if (!targetUserId) return;
    const key = 'velora_notifications_' + targetUserId;
    let list = [];
    try {
      const raw = localStorage.getItem(key);
      list = raw ? JSON.parse(raw) : [];
    } catch {
      list = [];
    }
    list.unshift({
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      title: title,
      desc: desc,
      icon: icon || 'star',
      read: false,
      time: new Date().toISOString()
    });
    if (list.length > 50) list.pop();
    localStorage.setItem(key, JSON.stringify(list));
  }

  // ═══════════════════════════════════════════
  //  OVERVIEW CARDS
  // ═══════════════════════════════════════════
  function updateOverviewCard(index, value) {
    const cards = document.querySelectorAll('.dash-overview-value');
    if (cards[index]) cards[index].textContent = value;
  }

  function updateOverviewCards() {
    const bookings = getBookings();
    const active = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
    const upcoming = bookings.filter(b => b.status === 'confirmed' && b.checkIn && new Date(b.checkIn) > new Date());
    const wishlist = getWishlist();

    updateOverviewCard(0, bookings.length);
    updateOverviewCard(1, active.length);
    updateOverviewCard(2, upcoming.length);
    updateOverviewCard(3, wishlist.length);
  }

  // ═══════════════════════════════════════════
  //  LOGOUT
  // ═══════════════════════════════════════════
  const logoutBtn = document.getElementById('dash-logout-action');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (typeof VeloraAuth !== 'undefined') VeloraAuth.logout();
      else window.location.href = 'index.html';
    });
  }

  // ═══════════════════════════════════════════
  //  INITIALIZE ALL (User Dashboard)
  // ═══════════════════════════════════════════
  populateUserInfo();
  renderWishlist();
  renderNotifications();
  renderConcierge();
  renderReviews();
  renderBookingHistory();
  renderActiveReservations();
  renderTracking();
  renderActivity();
  updateOverviewCards();

  // ═══════════════════════════════════════════════════════════
  //  ADMIN DASHBOARD MODULE
  //  Runs ONLY on admin-dashboard.html
  // ═══════════════════════════════════════════════════════════
  const isAdmin = window.location.pathname.includes('admin-dashboard');
  if (isAdmin) {

  let trkSearchQuery = '';
  let trkFilterStage = 'all';

  // ─── Admin Storage Keys ───
  const ADMIN_KEYS = {
    REVIEWS: 'velora_admin_reviews',
    CONCIERGE: 'velora_admin_concierge',
    PACKAGES: 'velora_admin_packages',
    CAMPAIGNS: 'velora_admin_campaigns'
  };

  function getAdminData(key) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
  }
  function setAdminData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

  // ─── Admin UI Sync Wrapper ───
  function refreshAdminUI() {
    renderAdminUsers();
    renderAdminReviews();
    renderAdminConcierge();
    renderAdminPackages();
    renderAdminSubscribers();
    renderAdminCampaigns();
    renderAdminBookings();
    renderAdminApprovals();
    renderAdminTracking();
    if (typeof renderAdminNotificationCenter === 'function') {
      renderAdminNotificationCenter();
    }
    computeAdminAnalytics();
    renderAnalyticsCharts();
    renderAdminReports();
  }

  // ═══════════════════════════════════════════
  //  ADMIN 10: ANALYTICS & STATS
  // ═══════════════════════════════════════════
  function computeAdminAnalytics() {
    const users = getAllUsers();
    const bookings = getAllBookings();

    const totalUsersEl = document.getElementById('ana-total-users');
    const totalBookingsEl = document.getElementById('ana-total-bookings');
    const activeResEl = document.getElementById('ana-active-res');
    const completedResEl = document.getElementById('ana-completed-res');
    const pendingResEl = document.getElementById('ana-pending-res');
    const revenueEstEl = document.getElementById('ana-revenue-est');

    const activeCount = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
    const completedCount = bookings.filter(b => b.status === 'completed').length;
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (b.amount ? b.amount.total : 0), 0);

    if (totalUsersEl) totalUsersEl.textContent = users.length;
    if (totalBookingsEl) totalBookingsEl.textContent = bookings.length;
    if (activeResEl) activeResEl.textContent = activeCount;
    if (completedResEl) completedResEl.textContent = completedCount;
    if (pendingResEl) pendingResEl.textContent = pendingCount;
    if (revenueEstEl) revenueEstEl.textContent = '₹' + totalRevenue.toLocaleString('en-IN');

    // Update Overview Cards on Panel 1 (Admin Overview)
    const overviewCards = document.querySelectorAll('#panel-overview .dash-overview-value');
    if (overviewCards && overviewCards.length >= 4) {
      overviewCards[0].textContent = bookings.length;
      overviewCards[1].textContent = users.length;

      // Current Month Revenue
      const today = new Date();
      const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const monthlyRevenue = bookings
        .filter(b => (b.status === 'confirmed' || b.status === 'completed') && (b.createdAt || b.checkin || '').startsWith(currentMonthKey))
        .reduce((sum, b) => sum + (b.amount ? b.amount.total : 0), 0);

      let revText = '';
      if (monthlyRevenue >= 10000000) {
        revText = '₹' + (monthlyRevenue / 10000000).toFixed(2) + 'Cr';
      } else if (monthlyRevenue >= 100000) {
        revText = '₹' + (monthlyRevenue / 100000).toFixed(1) + 'L';
      } else {
        revText = '₹' + monthlyRevenue.toLocaleString('en-IN');
      }
      overviewCards[2].textContent = revText;

      // Avg Rating
      const approvedReviews = getAdminReviews().filter(r => r.status === 'approved');
      const avgRating = approvedReviews.length > 0 ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1) : '4.8';
      overviewCards[3].textContent = avgRating;
    }
  }

  function getLast6Months() {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        name: monthNames[d.getMonth()],
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      });
    }
    return months;
  }

  function formatCompact(val) {
    if (val >= 100000) return (val / 100000).toFixed(1) + 'L';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val;
  }

  function renderAnalyticsCharts() {
    const bookings = getAllBookings();
    const months = getLast6Months();

    // 1. Booking Trend
    const bTrendEl = document.getElementById('chart-booking-trend');
    if (bTrendEl) {
      const counts = months.map(m => {
        return bookings.filter(b => (b.createdAt || b.checkin || '').includes(m.key)).length;
      });
      const maxCount = Math.max(...counts, 5);

      const points = counts.map((c, i) => ({ x: 50 + i * 80, y: 170 - (c / maxCount) * 120 }));
      const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      const areaD = `${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;

      bTrendEl.innerHTML = `
        <svg viewBox="0 0 500 220" style="width: 100%; height: 100%; display: block;">
          <style>
            .grid-line { stroke: rgba(255,255,255,0.04); stroke-width: 1; }
            .axis-label { fill: var(--gray); font-family: var(--font-ui); font-size: 10px; }
            .chart-point { fill: var(--midnight); stroke: var(--gold); stroke-width: 2.5; transition: all 0.2s ease; cursor: pointer; }
            .chart-point:hover { r: 7; fill: var(--gold); }
            .chart-val-lbl { fill: var(--ivory); font-family: var(--font-ui); font-size: 10px; font-weight: 600; text-anchor: middle; opacity: 0.8; pointer-events: none; }
            .point-group:hover .chart-val-lbl { fill: var(--gold); opacity: 1; }
          </style>
          <defs>
            <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--gold)" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="var(--gold)" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <!-- Grid Lines -->
          <line x1="40" y1="50" x2="460" y2="50" class="grid-line" />
          <line x1="40" y1="110" x2="460" y2="110" class="grid-line" />
          <line x1="40" y1="170" x2="460" y2="170" class="grid-line" style="stroke: rgba(255,255,255,0.15);" />
          
          <!-- Area & Line -->
          <path d="${areaD}" fill="url(#bookingGrad)" />
          <path d="${pathD}" fill="none" stroke="var(--gold)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          
          <!-- Data Points -->
          ${points.map((p, i) => `
            <g class="point-group">
              <circle cx="${p.x}" cy="${p.y}" r="4.5" class="chart-point" />
              <text x="${p.x}" y="${p.y - 12}" class="chart-val-lbl">${counts[i]}</text>
              <text x="${p.x}" y="192" class="axis-label" text-anchor="middle">${months[i].name}</text>
            </g>
          `).join('')}
        </svg>
      `;
    }

    // 2. Revenue Trend
    const rTrendEl = document.getElementById('chart-revenue-trend');
    if (rTrendEl) {
      const revs = months.map(m => {
        return bookings
          .filter(b => (b.status === 'confirmed' || b.status === 'completed') && (b.createdAt || b.checkin || '').includes(m.key))
          .reduce((sum, b) => sum + (b.amount ? b.amount.total : 0), 0);
      });
      const maxRev = Math.max(...revs, 100000);

      const points = revs.map((r, i) => ({ x: 50 + i * 80, y: 170 - (r / maxRev) * 120 }));
      const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      const areaD = `${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;

      rTrendEl.innerHTML = `
        <svg viewBox="0 0 500 220" style="width: 100%; height: 100%; display: block;">
          <style>
            .grid-line { stroke: rgba(255,255,255,0.04); stroke-width: 1; }
            .axis-label { fill: var(--gray); font-family: var(--font-ui); font-size: 10px; }
            .chart-point { fill: var(--midnight); stroke: var(--gold); stroke-width: 2.5; transition: all 0.2s ease; cursor: pointer; }
            .chart-point:hover { r: 7; fill: var(--gold); }
            .chart-val-lbl { fill: var(--ivory); font-family: var(--font-ui); font-size: 10px; font-weight: 600; text-anchor: middle; opacity: 0.8; pointer-events: none; }
            .point-group:hover .chart-val-lbl { fill: var(--gold); opacity: 1; }
          </style>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--gold)" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="var(--gold)" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <!-- Grid Lines -->
          <line x1="40" y1="50" x2="460" y2="50" class="grid-line" />
          <line x1="40" y1="110" x2="460" y2="110" class="grid-line" />
          <line x1="40" y1="170" x2="460" y2="170" class="grid-line" style="stroke: rgba(255,255,255,0.15);" />
          
          <!-- Area & Line -->
          <path d="${areaD}" fill="url(#revenueGrad)" />
          <path d="${pathD}" fill="none" stroke="var(--gold)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          
          <!-- Data Points -->
          ${points.map((p, i) => `
            <g class="point-group">
              <circle cx="${p.x}" cy="${p.y}" r="4.5" class="chart-point" />
              <text x="${p.x}" y="${p.y - 12}" class="chart-val-lbl">₹${formatCompact(revs[i])}</text>
              <text x="${p.x}" y="192" class="axis-label" text-anchor="middle">${months[i].name}</text>
            </g>
          `).join('')}
        </svg>
      `;
    }

    // 3. Package Popularity
    const pPopEl = document.getElementById('chart-package-popularity');
    if (pPopEl) {
      const suiteCounts = {};
      bookings.forEach(b => {
        const suiteName = b.package ? b.package.suite : 'Other';
        suiteCounts[suiteName] = (suiteCounts[suiteName] || 0) + 1;
      });

      const packageData = Object.keys(suiteCounts).map(suite => ({
        suite,
        count: suiteCounts[suite]
      })).sort((a, b) => b.count - a.count);

      const totalSuiteBookings = bookings.length || 1;

      pPopEl.innerHTML = packageData.map(item => {
        const pct = Math.round((item.count / totalSuiteBookings) * 100);
        return `
          <div style="margin-bottom: var(--space-xs);">
            <div style="display: flex; justify-content: space-between; font-family: var(--font-ui); font-size: 0.65rem; color: var(--ivory); margin-bottom: 2px;">
              <span>${item.suite}</span>
              <span style="font-weight: 600; color: var(--gold);">${item.count} stays (${pct}%)</span>
            </div>
            <div style="height: 5px; background: rgba(255, 255, 255, 0.04); border-radius: 3px; overflow: hidden; border: 1px solid var(--glass-border);">
              <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, var(--gold) 0%, #E5C158 100%); border-radius: 3px;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 4. Reservation Status
    const rStatusEl = document.getElementById('chart-reservation-status');
    if (rStatusEl) {
      const statusCounts = { pending: 0, confirmed: 0, completed: 0, rejected: 0 };
      bookings.forEach(b => {
        const st = b.status || 'pending';
        if (statusCounts[st] !== undefined) statusCounts[st]++;
      });

      const totalStatus = bookings.length || 1;
      const circumference = 314;
      let accumulatedPercent = 0;
      const statusOrder = ['completed', 'confirmed', 'pending', 'rejected'];
      const colors = {
        completed: '#10B981',
        confirmed: 'var(--gold)',
        pending: '#FBBF24',
        rejected: '#EF4444'
      };

      const circlePaths = statusOrder.map(status => {
        const count = statusCounts[status];
        const pct = count / totalStatus;
        const strokeDash = pct * circumference;
        const currentOffset = circumference - (accumulatedPercent * circumference);
        accumulatedPercent += pct;
        if (count === 0) return '';
        return `
          <circle cx="80" cy="80" r="50"
            fill="transparent"
            stroke="${colors[status]}"
            stroke-width="10"
            stroke-dasharray="${strokeDash} ${circumference - strokeDash}"
            stroke-dashoffset="${currentOffset}"
            transform="rotate(-90 80 80)"
            style="transition: stroke-dashoffset 0.6s ease;"
          />
        `;
      }).join('');

      rStatusEl.innerHTML = `
        <svg width="140" height="140" viewBox="0 0 160 160" style="flex-shrink: 0;">
          <circle cx="80" cy="80" r="50" fill="transparent" stroke="rgba(255,255,255,0.03)" stroke-width="10" />
          ${circlePaths}
          <text x="80" y="82" fill="var(--ivory)" font-size="14" font-family="var(--font-display)" text-anchor="middle" font-weight="600">${bookings.length}</text>
          <text x="80" y="96" fill="var(--gray)" font-size="8" font-family="var(--font-ui)" text-anchor="middle">Total Stays</text>
        </svg>
        <div style="display: flex; flex-direction: column; gap: 6px; min-width: 140px; flex: 1;">
          ${statusOrder.map(status => {
            const count = statusCounts[status];
            const pct = Math.round((count / totalStatus) * 100);
            const label = status.charAt(0).toUpperCase() + status.slice(1);
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; font-family: var(--font-ui); font-size: 0.65rem;">
                <div style="display: flex; align-items: center; gap: 6px; color: var(--ivory);">
                  <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${colors[status]};"></span>
                  <span>${label}</span>
                </div>
                <span style="color: var(--gray); font-weight: 500;">${count} (${pct}%)</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  // ═══════════════════════════════════════════
  //  ADMIN 11: OPERATIONAL REPORTS
  // ═══════════════════════════════════════════
  let currentReportTab = 'bookings';

  function renderAdminReports() {
    const container = document.getElementById('reports-table-container');
    if (!container) return;

    const bookings = getAllBookings();
    const months = getLast6Months();

    // Sync tab button styles
    const tabButtons = document.querySelectorAll('#reports-tab-buttons [data-rep-tab]');
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-rep-tab') === currentReportTab) {
        btn.className = 'btn btn-gold';
      } else {
        btn.className = 'btn btn-ghost';
      }
    });

    let html = '';

    if (currentReportTab === 'bookings') {
      const tableRows = months.map(m => {
        const mBookings = bookings.filter(b => (b.createdAt || b.checkin || '').includes(m.key));
        const pending = mBookings.filter(b => b.status === 'pending').length;
        const confirmed = mBookings.filter(b => b.status === 'confirmed').length;
        const completed = mBookings.filter(b => b.status === 'completed').length;
        const total = mBookings.length;
        const nonPending = total - pending;
        const successRate = nonPending > 0 ? Math.round(((confirmed + completed) / nonPending) * 100) + '%' : '—';

        return `
          <tr>
            <td style="font-weight: 600; color: var(--gold);">${m.name} ${m.year}</td>
            <td>${total}</td>
            <td><span class="dash-reservation-status pending" style="margin:0;">${pending}</span></td>
            <td><span class="dash-reservation-status confirmed" style="margin:0;">${confirmed}</span></td>
            <td><span class="dash-reservation-status completed" style="margin:0;">${completed}</span></td>
            <td style="font-weight: 600; color: var(--gold);">${successRate}</td>
          </tr>
        `;
      }).reverse().join('');

      html = `
        <table class="dash-data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Total Bookings</th>
              <th>Pending</th>
              <th>Confirmed</th>
              <th>Completed</th>
              <th>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="6" style="text-align:center;">No data available</td></tr>'}
          </tbody>
        </table>
      `;
    } else if (currentReportTab === 'revenue') {
      const tableRows = months.map(m => {
        const mBookings = bookings.filter(b => (b.status === 'confirmed' || b.status === 'completed') && (b.createdAt || b.checkin || '').includes(m.key));
        const totalRev = mBookings.reduce((sum, b) => sum + (b.amount ? b.amount.total : 0), 0);
        const baseRev = Math.round(totalRev / 1.12);
        const tax = totalRev - baseRev;
        const avgVal = mBookings.length > 0 ? Math.round(totalRev / mBookings.length) : 0;

        return `
          <tr>
            <td style="font-weight: 600; color: var(--gold);">${m.name} ${m.year}</td>
            <td>₹${baseRev.toLocaleString('en-IN')}</td>
            <td>₹${tax.toLocaleString('en-IN')}</td>
            <td style="font-weight: 600; color: var(--gold);">₹${totalRev.toLocaleString('en-IN')}</td>
            <td>₹${avgVal.toLocaleString('en-IN')}</td>
          </tr>
        `;
      }).reverse().join('');

      html = `
        <table class="dash-data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Base Revenue</th>
              <th>Luxury Tax (12%)</th>
              <th>Total Revenue</th>
              <th>Avg. Booking Value</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="5" style="text-align:center;">No data available</td></tr>'}
          </tbody>
        </table>
      `;
    } else if (currentReportTab === 'packages') {
      const suiteStats = {};
      const suiteNames = ['Ocean Villa', 'Royal Penthouse', 'Garden Suite', 'Beach Bungalow'];
      suiteNames.forEach(s => {
        suiteStats[s] = { name: s, count: 0, revenue: 0, nights: 0 };
      });

      bookings.forEach(b => {
        const s = b.package ? b.package.suite : 'Other';
        if (!suiteStats[s]) {
          suiteStats[s] = { name: s, count: 0, revenue: 0, nights: 0 };
        }
        suiteStats[s].count++;
        if (b.status === 'confirmed' || b.status === 'completed') {
          suiteStats[s].revenue += b.amount ? b.amount.total : 0;
        }
        const nights = b.package ? (parseInt(b.package.nights) || 1) : 1;
        suiteStats[s].nights += nights;
      });

      const totalAllRev = Object.values(suiteStats).reduce((sum, item) => sum + item.revenue, 0) || 1;

      const tableRows = Object.values(suiteStats)
        .sort((a, b) => b.revenue - a.revenue)
        .map(item => {
          const contributionPct = Math.round((item.revenue / totalAllRev) * 100);
          const avgNights = item.count > 0 ? (item.nights / item.count).toFixed(1) : '—';
          return `
            <tr>
              <td style="font-weight: 600; color: var(--gold);">${item.name}</td>
              <td>${item.count}</td>
              <td style="font-weight: 600; color: var(--gold);">₹${item.revenue.toLocaleString('en-IN')}</td>
              <td>${contributionPct}%</td>
              <td>${avgNights} nights</td>
            </tr>
          `;
        }).join('');

      html = `
        <table class="dash-data-table">
          <thead>
            <tr>
              <th>Suite Name</th>
              <th>Total Bookings</th>
              <th>Total Revenue</th>
              <th>Revenue Contribution</th>
              <th>Avg. Stay Length</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="5" style="text-align:center;">No data available</td></tr>'}
          </tbody>
        </table>
      `;
    } else if (currentReportTab === 'users') {
      const userStats = {};
      bookings.forEach(b => {
        if (!b.user || !b.user.email) return;
        const email = b.user.email;
        if (!userStats[email]) {
          userStats[email] = {
            name: b.user.name || 'Guest',
            email: email,
            bookingsCount: 0,
            nights: 0,
            totalSpent: 0
          };
        }
        userStats[email].bookingsCount++;
        if (b.status === 'confirmed' || b.status === 'completed') {
          userStats[email].totalSpent += b.amount ? b.amount.total : 0;
        }
        const nights = b.package ? (parseInt(b.package.nights) || 1) : 1;
        userStats[email].nights += nights;
      });

      const allRegisteredUsers = getAllUsers();
      allRegisteredUsers.forEach(u => {
        if (u.email && !userStats[u.email]) {
          userStats[u.email] = {
            name: u.name || 'Guest',
            email: u.email,
            bookingsCount: 0,
            nights: 0,
            totalSpent: 0
          };
        }
      });

      const tableRows = Object.values(userStats)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .map(item => {
          let tier = 'Silver';
          if (item.totalSpent >= 800000) tier = 'Platinum';
          else if (item.totalSpent >= 300000) tier = 'Gold';
          
          let tierClass = 'pending';
          if (tier === 'Platinum') tierClass = 'completed';
          else if (tier === 'Gold') tierClass = 'confirmed';

          return `
            <tr>
              <td style="font-weight: 600; color: var(--gold);">${item.name}</td>
              <td>${item.email}</td>
              <td>${item.bookingsCount}</td>
              <td>${item.nights} nights</td>
              <td style="font-weight: 600; color: var(--gold);">₹${item.totalSpent.toLocaleString('en-IN')}</td>
              <td><span class="dash-reservation-status ${tierClass}" style="margin:0;">${tier}</span></td>
            </tr>
          `;
        }).join('');

      html = `
        <table class="dash-data-table">
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Email</th>
              <th>Bookings</th>
              <th>Nights Stayed</th>
              <th>Total Spent</th>
              <th>Loyalty Tier</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="6" style="text-align:center;">No data available</td></tr>'}
          </tbody>
        </table>
      `;
    }

    container.innerHTML = html;
  }

  function bindReportsTabs() {
    const tabButtons = document.querySelectorAll('#reports-tab-buttons [data-rep-tab]');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        currentReportTab = btn.getAttribute('data-rep-tab');
        renderAdminReports();
      });
    });
  }

  // ═══════════════════════════════════════════
  //  ADMIN 1: USER MANAGEMENT
  // ═══════════════════════════════════════════
  function getAllUsers() {
    let users = [];
    try {
      const raw = localStorage.getItem('velora_users');
      if (raw) users = JSON.parse(raw);
    } catch {}

    // Seed default users if only admin or empty
    const nonAdmin = users.filter(u => u.role !== 'admin');
    if (nonAdmin.length === 0) {
      const adminUser = users.find(u => u.role === 'admin');
      const seedUsers = [
        { name: 'Arjun Mehta', email: 'arjun.mehta@example.com', role: 'user', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'user', createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Vikram Iyer', email: 'vikram.iyer@example.com', role: 'user', createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Meera Kapoor', email: 'meera.kapoor@example.com', role: 'user', createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Rohit Gupta', email: 'rohit.gupta@example.com', role: 'user', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Neha Kapoor', email: 'neha.kapoor@example.com', role: 'user', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
      ];
      users = adminUser ? [adminUser, ...seedUsers] : seedUsers;
      localStorage.setItem('velora_users', JSON.stringify(users));
    }

    return users.filter(u => u.role !== 'admin');
  }

  function renderAdminUsers() {
    const container = document.getElementById('admin-users-container');
    if (!container) return;
    const users = getAllUsers();

    if (users.length === 0) {
      container.innerHTML = '<div class="dash-glass-card"><div class="dash-card-header"><h3 class="dash-card-title">Registered Users</h3><span class="dash-card-action">0 users</span></div><div class="dash-empty-state"><div class="dash-empty-title">No Registered Users</div><div class="dash-empty-desc">Users who sign up will appear here.</div></div></div>';
      return;
    }

    container.innerHTML = `<div class="dash-glass-card" style="overflow-x:auto;">
      <div class="dash-card-header"><h3 class="dash-card-title">Registered Users</h3><span class="dash-card-action">${users.length} user${users.length !== 1 ? 's' : ''}</span></div>
      <table class="dash-data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
        <tbody>
          ${users.map(u => `<tr>
            <td>${u.name || '—'}</td>
            <td>${u.email}</td>
            <td><span class="dash-reservation-status confirmed">${u.role || 'user'}</span></td>
            <td>${u.createdAt ? formatDate(u.createdAt) : '—'}</td>
            <td><button class="dash-delete-btn" data-delete-user="${u.email}">Delete</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

    container.querySelectorAll('[data-delete-user]').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.getAttribute('data-delete-user');
        if (!confirm('Delete user ' + email + '? This cannot be undone.')) return;
        const raw = localStorage.getItem('velora_users');
        if (raw) {
          try {
            let users = JSON.parse(raw);
            users = users.filter(u => u.email !== email);
            localStorage.setItem('velora_users', JSON.stringify(users));
            refreshAdminUI();
            showToast('✦ User deleted');
          } catch {}
        }
      });
    });
  }

  // ═══════════════════════════════════════════
  //  ADMIN 2: REVIEW MANAGEMENT
  // ═══════════════════════════════════════════
  const defaultAdminReviews = [
    { id: 'ar1', property: 'Ocean Villa', author: 'Arjun Mehta', rating: 5, text: 'An extraordinary experience. The staff anticipated our every need before we even knew it ourselves.', status: 'pending', time: '2026-05-28T10:00:00Z' },
    { id: 'ar2', property: 'Spa & Wellness', author: 'Priya Sharma', rating: 4, text: 'The Ayurvedic wellness journey was transformative. Four stars only because the booking process could be smoother.', status: 'pending', time: '2026-05-25T14:00:00Z' },
    { id: 'ar3', property: 'Sunset Cruise', author: 'Deepa Menon', rating: 5, text: 'Watching the sun dip below the horizon with champagne in hand — this is what luxury means.', status: 'pending', time: '2026-05-22T18:00:00Z' },
    { id: 'ar4', property: 'Royal Penthouse', author: 'Karthik Nair', rating: 5, text: 'The penthouse exceeded every expectation. Waking up to panoramic ocean views was truly magical.', status: 'pending', time: '2026-05-20T09:00:00Z' },
    { id: 'ar5', property: 'Garden Suite', author: 'Ananya Reddy', rating: 4, text: 'Peaceful surroundings, impeccable service. The garden view was serene and rejuvenating.', status: 'pending', time: '2026-05-18T12:00:00Z' },
    { id: 'ar6', property: 'Dining Experience', author: 'Vikram Iyer', rating: 5, text: 'Chef Rajan curated a 7-course tasting menu that was nothing short of art. Truly world-class.', status: 'pending', time: '2026-05-15T20:00:00Z' }
  ];

  function getAdminReviews() {
    let list = getAdminData(ADMIN_KEYS.REVIEWS);
    if (!list) { list = defaultAdminReviews; setAdminData(ADMIN_KEYS.REVIEWS, list); }
    return list;
  }

  function renderAdminReviews() {
    const container = document.getElementById('admin-reviews-container');
    if (!container) return;
    const list = getAdminReviews();
    const pending = list.filter(r => r.status === 'pending');
    const approved = list.filter(r => r.status === 'approved');

    // Update sidebar badge
    const badge = document.querySelector('[data-panel="panel-reviews"] .dash-nav-badge');
    if (badge) { badge.textContent = pending.length || ''; badge.style.display = pending.length ? 'flex' : 'none'; }

    let html = '';

    if (pending.length > 0) {
      html += `<div class="dash-glass-card" style="margin-bottom:var(--space-lg);">
        <div class="dash-card-header"><h3 class="dash-card-title">Pending Reviews</h3><span class="dash-card-action">${pending.length} pending</span></div>
        <div class="dash-review-list">${pending.map(r => `
          <div class="dash-review-item">
            <div class="dash-review-header"><div class="dash-review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div><div class="dash-review-date">${formatDate(r.time)}</div></div>
            <div class="dash-review-property">${r.property} — ${r.author}</div>
            <div class="dash-review-text">"${r.text}"</div>
            <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-md);">
              <button class="btn btn-gold" style="padding:8px 20px;font-size:0.65rem;" data-review-approve="${r.id}">Approve</button>
              <button class="dash-delete-btn" data-review-reject="${r.id}">Reject</button>
            </div>
          </div>
        `).join('')}</div>
      </div>`;
    }

    if (approved.length > 0) {
      html += `<div class="dash-glass-card">
        <div class="dash-card-header"><h3 class="dash-card-title">Approved Reviews</h3><span class="dash-card-action">${approved.length} published</span></div>
        <div class="dash-review-list">${approved.map(r => `
          <div class="dash-review-item">
            <div class="dash-review-header"><div class="dash-review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div><div class="dash-review-date">${formatDate(r.time)}</div></div>
            <div class="dash-review-property">${r.property} — ${r.author}</div>
            <div class="dash-review-text">"${r.text}"</div>
            <div style="margin-top:var(--space-sm);"><span class="dash-reservation-status confirmed">Published</span></div>
          </div>
        `).join('')}</div>
      </div>`;
    }

    if (list.length === 0) {
      html = '<div class="dash-glass-card"><div class="dash-empty-state"><div class="dash-empty-title">No Reviews</div><div class="dash-empty-desc">Guest reviews will appear here for moderation.</div></div></div>';
    }

    container.innerHTML = html;

    container.querySelectorAll('[data-review-approve]').forEach(btn => {
      btn.addEventListener('click', () => {
        const list = getAdminReviews();
        const review = list.find(r => r.id === btn.getAttribute('data-review-approve'));
        if (review) { review.status = 'approved'; setAdminData(ADMIN_KEYS.REVIEWS, list); refreshAdminUI(); showToast('✦ Review approved & published'); }
      });
    });

    container.querySelectorAll('[data-review-reject]').forEach(btn => {
      btn.addEventListener('click', () => {
        let list = getAdminReviews();
        list = list.filter(r => r.id !== btn.getAttribute('data-review-reject'));
        setAdminData(ADMIN_KEYS.REVIEWS, list);
        refreshAdminUI();
        showToast('✦ Review rejected & removed');
      });
    });
  }

  // ═══════════════════════════════════════════
  //  ADMIN 3: CONCIERGE MANAGEMENT
  // ═══════════════════════════════════════════
  const defaultAdminConcierge = [
    { id: 'ac1', subject: 'Private Dining', guest: 'Arjun Mehta', category: 'dining', message: 'Requesting a candlelit dinner setup on the private beach for 2 guests. Anniversary celebration on Jun 17th.', status: 'open', time: new Date(Date.now() - 3600000).toISOString() },
    { id: 'ac2', subject: 'Airport Transfer', guest: 'Priya Sharma', category: 'transport', message: 'Requesting luxury sedan pickup from Chennai Airport on Jul 1st at 2:30 PM. Flight AI-542.', status: 'open', time: new Date(Date.now() - 14400000).toISOString() },
    { id: 'ac3', subject: 'Spa Booking', guest: 'Vikram Iyer', category: 'spa', message: 'Requesting couples Ayurvedic treatment on Jun 12th morning. Prefer therapist Meera.', status: 'open', time: new Date(Date.now() - 86400000).toISOString() }
  ];

  function getAdminConcierge() {
    let list = getAdminData(ADMIN_KEYS.CONCIERGE);
    if (!list) { list = defaultAdminConcierge; setAdminData(ADMIN_KEYS.CONCIERGE, list); }
    return list;
  }

  function renderAdminConcierge() {
    const container = document.getElementById('admin-concierge-container');
    if (!container) return;
    const list = getAdminConcierge();
    const openReqs = list.filter(r => r.status === 'open');
    const closedReqs = list.filter(r => r.status === 'closed');

    // Update badge
    const badge = document.querySelector('[data-panel="panel-concierge"] .dash-nav-badge');
    if (badge) { badge.textContent = openReqs.length || ''; badge.style.display = openReqs.length ? 'flex' : 'none'; }

    if (list.length === 0) {
      container.innerHTML = '<div class="dash-glass-card"><div class="dash-empty-state"><div class="dash-empty-title">No Concierge Requests</div></div></div>';
      return;
    }

    let html = '';
    if (openReqs.length > 0) {
      html += `<div class="dash-glass-card" style="margin-bottom:var(--space-lg);">
        <div class="dash-card-header"><h3 class="dash-card-title">Open Requests</h3><span class="dash-card-action">${openReqs.length} open</span></div>
        <div class="dash-concierge-list">${openReqs.map(r => `
          <div class="dash-concierge-item">
            <div class="dash-concierge-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="dash-concierge-content">
              <div class="dash-concierge-subject">${r.subject} — ${r.guest}</div>
              <div class="dash-concierge-preview">${r.message}</div>
              <span class="dash-concierge-status open">Open</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
              <div class="dash-concierge-time">${timeAgo(r.time)}</div>
              <button class="btn btn-gold" style="padding:6px 16px;font-size:0.6rem;" data-concierge-close="${r.id}">Resolve</button>
            </div>
          </div>
        `).join('')}</div>
      </div>`;
    }
    if (closedReqs.length > 0) {
      html += `<div class="dash-glass-card">
        <div class="dash-card-header"><h3 class="dash-card-title">Resolved</h3><span class="dash-card-action">${closedReqs.length} closed</span></div>
        <div class="dash-concierge-list">${closedReqs.map(r => `
          <div class="dash-concierge-item" style="opacity:0.6;">
            <div class="dash-concierge-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="dash-concierge-content">
              <div class="dash-concierge-subject">${r.subject} — ${r.guest}</div>
              <div class="dash-concierge-preview">${r.message.substring(0, 80)}...</div>
              <span class="dash-concierge-status" style="color:var(--gray);background:rgba(161,161,170,0.1);">Closed</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
              <div class="dash-concierge-time">${timeAgo(r.time)}</div>
              <button class="dash-delete-btn" style="font-size:0.55rem;padding:4px 10px;" data-concierge-reopen="${r.id}">Re-open</button>
            </div>
          </div>
        `).join('')}</div>
      </div>`;
    }

    container.innerHTML = html;

    container.querySelectorAll('[data-concierge-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const list = getAdminConcierge();
        const req = list.find(r => r.id === btn.getAttribute('data-concierge-close'));
        if (req) { req.status = 'closed'; setAdminData(ADMIN_KEYS.CONCIERGE, list); refreshAdminUI(); showToast('✦ Request resolved'); }
      });
    });

    container.querySelectorAll('[data-concierge-reopen]').forEach(btn => {
      btn.addEventListener('click', () => {
        const list = getAdminConcierge();
        const req = list.find(r => r.id === btn.getAttribute('data-concierge-reopen'));
        if (req) { req.status = 'open'; setAdminData(ADMIN_KEYS.CONCIERGE, list); refreshAdminUI(); showToast('✦ Request re-opened'); }
      });
    });
  }

  // ═══════════════════════════════════════════
  //  ADMIN 4: PACKAGE MANAGEMENT
  // ═══════════════════════════════════════════
  const defaultPackages = [
    { id: 'p1', name: 'Monsoon Serenity Package', price: '₹2,49,999', nights: 3, desc: 'Ocean Villa + Spa + Private Dining', status: 'active' },
    { id: 'p2', name: 'Honeymoon Bliss', price: '₹8,99,999', nights: 5, desc: 'Royal Penthouse + Sunset Cruise + Couples Spa', status: 'active' },
    { id: 'p3', name: 'Family Retreat', price: '₹1,69,999', nights: 4, desc: 'Garden Suite + Kids Activities + Cultural Tour', status: 'active' },
    { id: 'p4', name: 'Corporate Wellness', price: '₹1,29,999', nights: 2, desc: 'Beach Bungalow + Team Spa + Conference Room', status: 'draft' }
  ];

  function getPackages() {
    let list = getAdminData(ADMIN_KEYS.PACKAGES);
    if (!list) { list = defaultPackages; setAdminData(ADMIN_KEYS.PACKAGES, list); }
    return list;
  }

  function renderAdminPackages() {
    const container = document.getElementById('admin-packages-container');
    if (!container) return;
    const list = getPackages();

    if (list.length === 0) {
      container.innerHTML = '<div class="dash-glass-card"><div class="dash-empty-state"><div class="dash-empty-title">No Packages</div><div class="dash-empty-desc">Create your first luxury package above.</div></div></div>';
      return;
    }

    container.innerHTML = `<div class="dash-glass-card">
      <div class="dash-card-header"><h3 class="dash-card-title">All Packages</h3><span class="dash-card-action">${list.length} package${list.length !== 1 ? 's' : ''}</span></div>
      <div class="dash-concierge-list">
        ${list.map(p => `
          <div class="dash-concierge-item">
            <div class="dash-concierge-content" style="flex:1;">
              <div class="dash-concierge-subject">${p.name}</div>
              <div class="dash-concierge-preview">${p.nights} night${p.nights !== 1 ? 's' : ''} · ${p.desc} · ${p.price} · <span style="color:${p.status === 'active' ? 'var(--success)' : '#FBBF24'};">${p.status === 'active' ? 'Active' : 'Draft'}</span></div>
            </div>
            <div style="display:flex;gap:var(--space-sm);">
              <button class="dash-delete-btn" data-pkg-edit="${p.id}">Edit</button>
              <button class="dash-delete-btn" data-pkg-remove="${p.id}">Remove</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;

    // Edit
    container.querySelectorAll('[data-pkg-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const list = getPackages();
        const pkg = list.find(p => p.id === btn.getAttribute('data-pkg-edit'));
        if (!pkg) return;
        document.getElementById('pkg-edit-id').value = pkg.id;
        document.getElementById('pkg-name').value = pkg.name;
        document.getElementById('pkg-price').value = pkg.price.replace('₹', '');
        document.getElementById('pkg-nights').value = pkg.nights;
        document.getElementById('pkg-desc').value = pkg.desc;
        document.getElementById('pkg-status').value = pkg.status;
        document.getElementById('pkg-form-title').textContent = 'Edit Package';
        document.getElementById('pkg-submit-btn').textContent = 'Update Package';
        document.getElementById('pkg-cancel-btn').style.display = '';
        document.querySelector('#panel-packages .dash-main, #panel-packages')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Remove
    container.querySelectorAll('[data-pkg-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Remove this package?')) return;
        let list = getPackages();
        list = list.filter(p => p.id !== btn.getAttribute('data-pkg-remove'));
        setAdminData(ADMIN_KEYS.PACKAGES, list);
        refreshAdminUI();
        showToast('✦ Package removed');
      });
    });
  }

  // Package form
  const pkgForm = document.getElementById('admin-package-form');
  const pkgCancelBtn = document.getElementById('pkg-cancel-btn');
  if (pkgForm) {
    pkgForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('pkg-edit-id').value;
      const name = document.getElementById('pkg-name').value.trim();
      const price = document.getElementById('pkg-price').value.trim();
      const nights = parseInt(document.getElementById('pkg-nights').value) || 1;
      const desc = document.getElementById('pkg-desc').value.trim();
      const status = document.getElementById('pkg-status').value;

      if (!name || !price) { showToast('Please fill in package name and price'); return; }

      const list = getPackages();
      if (editId) {
        const pkg = list.find(p => p.id === editId);
        if (pkg) { pkg.name = name; pkg.price = '₹' + price; pkg.nights = nights; pkg.desc = desc; pkg.status = status; }
        showToast('✦ Package updated');
      } else {
        list.push({ id: genId(), name, price: '₹' + price, nights, desc, status });
        showToast('✦ Package added');
      }
      setAdminData(ADMIN_KEYS.PACKAGES, list);
      refreshAdminUI();
      resetPkgForm();
    });
  }

  function resetPkgForm() {
    if (pkgForm) pkgForm.reset();
    const editId = document.getElementById('pkg-edit-id');
    if (editId) editId.value = '';
    const title = document.getElementById('pkg-form-title');
    if (title) title.textContent = 'Add New Package';
    const submitBtn = document.getElementById('pkg-submit-btn');
    if (submitBtn) submitBtn.textContent = 'Add Package';
    if (pkgCancelBtn) pkgCancelBtn.style.display = 'none';
  }

  if (pkgCancelBtn) pkgCancelBtn.addEventListener('click', resetPkgForm);

  // ═══════════════════════════════════════════
  //  ADMIN 5: NEWSLETTER MANAGEMENT
  // ═══════════════════════════════════════════
  const defaultCampaigns = [
    { id: 'nc1', subject: 'Summer Escape Collection', audience: 'All Subscribers', sent: '2026-05-24T10:00:00Z', openRate: '68%', status: 'delivered' },
    { id: 'nc2', subject: 'Gold Member Exclusive', audience: 'Gold Members', sent: '2026-05-15T10:00:00Z', openRate: '82%', status: 'delivered' },
    { id: 'nc3', subject: 'Wellness Retreat Preview', audience: 'Recent Guests', sent: '2026-05-01T10:00:00Z', openRate: '55%', status: 'delivered' }
  ];

  function getCampaigns() {
    let list = getAdminData(ADMIN_KEYS.CAMPAIGNS);
    if (!list) { list = defaultCampaigns; setAdminData(ADMIN_KEYS.CAMPAIGNS, list); }
    return list;
  }

  function renderAdminSubscribers() {
    const container = document.getElementById('admin-subscribers-container');
    if (!container) return;
    const users = getAllUsers();

    container.innerHTML = `<div class="dash-glass-card">
      <div class="dash-card-header"><h3 class="dash-card-title">Subscribers</h3><span class="dash-card-action">${users.length} subscriber${users.length !== 1 ? 's' : ''}</span></div>
      ${users.length === 0
        ? '<div class="dash-empty-state"><div class="dash-empty-title">No Subscribers</div><div class="dash-empty-desc">Users who register will appear here.</div></div>'
        : `<table class="dash-data-table"><thead><tr><th>Name</th><th>Email</th><th>Joined</th></tr></thead><tbody>${users.map(u => `<tr><td>${u.name || '—'}</td><td>${u.email}</td><td>${u.createdAt ? formatDate(u.createdAt) : '—'}</td></tr>`).join('')}</tbody></table>`
      }
    </div>`;
  }

  function renderAdminCampaigns() {
    const container = document.getElementById('admin-campaigns-container');
    if (!container) return;
    const list = getCampaigns();

    if (list.length === 0) {
      container.innerHTML = '<div class="dash-glass-card"><div class="dash-empty-state"><div class="dash-empty-title">No Campaigns</div></div></div>';
      return;
    }

    container.innerHTML = `<div class="dash-glass-card" style="overflow-x:auto;">
      <div class="dash-card-header"><h3 class="dash-card-title">Campaign History</h3><span class="dash-card-action">${list.length} sent</span></div>
      <table class="dash-data-table"><thead><tr><th>Subject</th><th>Audience</th><th>Sent</th><th>Open Rate</th><th>Status</th></tr></thead>
        <tbody>${list.map(c => `<tr>
          <td>${c.subject}</td>
          <td>${c.audience}</td>
          <td>${formatDate(c.sent)}</td>
          <td>${c.openRate}</td>
          <td><span class="dash-reservation-status confirmed">Delivered</span></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
  }

  // Newsletter form
  const nlForm = document.getElementById('admin-newsletter-form');
  if (nlForm) {
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const subject = document.getElementById('nl-subject').value.trim();
      const audience = document.getElementById('nl-audience').value;
      const body = document.getElementById('nl-body').value.trim();

      if (!subject || !body) { showToast('Please fill in subject and content'); return; }

      const list = getCampaigns();
      list.unshift({ id: genId(), subject, audience, sent: new Date().toISOString(), openRate: '—', status: 'delivered' });
      setAdminData(ADMIN_KEYS.CAMPAIGNS, list);
      renderAdminCampaigns();
      nlForm.reset();
      showToast('✦ Newsletter sent to ' + audience);
    });
  }

  // ═══════════════════════════════════════════
  //  ADMIN 6: BOOKING MANAGEMENT
  // ═══════════════════════════════════════════
  function getAllBookings() {
    let bookings = [];
    try {
      const raw = localStorage.getItem('velora_all_bookings');
      if (raw) bookings = JSON.parse(raw);
    } catch {}

    const stages = [
      'Booking Submitted',
      'Under Review',
      'Reservation Confirmed',
      'Villa Assigned',
      'Ready For Arrival',
      'Checked In'
    ];

    // Seed default data if empty
    if (bookings.length === 0) {
      const suites = [
        { name: 'Ocean Villa Suite', suite: 'Ocean Villa', price: 79999, destination: 'Maldives' },
        { name: 'Royal Penthouse Suite', suite: 'Royal Penthouse', price: 149999, destination: 'Santorini' },
        { name: 'Garden Suite', suite: 'Garden Suite', price: 32999, destination: 'Bali' },
        { name: 'Beach Bungalow Suite', suite: 'Beach Bungalow', price: 49999, destination: 'Maldives' }
      ];
      
      const guestsList = [
        { name: 'Arjun Mehta', email: 'arjun.mehta@example.com', userId: 'u1' },
        { name: 'Priya Sharma', email: 'priya.sharma@example.com', userId: 'u2' },
        { name: 'Vikram Iyer', email: 'vikram.iyer@example.com', userId: 'u3' },
        { name: 'Meera Kapoor', email: 'meera.kapoor@example.com', userId: 'u4' },
        { name: 'Rohit Gupta', email: 'rohit.gupta@example.com', userId: 'u5' },
        { name: 'Neha Kapoor', email: 'neha.kapoor@example.com', userId: 'u6' }
      ];

      const today = new Date();
      // Generate 15 bookings spread across the last 6 months
      for (let i = 0; i < 15; i++) {
        const monthsAgo = (i % 6);
        const checkinDate = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 10 + (i * 2));
        const checkoutDate = new Date(checkinDate.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 nights
        
        const guest = guestsList[i % guestsList.length];
        const suiteInfo = suites[i % suites.length];
        const nights = 4;
        const subtotal = suiteInfo.price * nights;
        const total = Math.round(subtotal * 1.12); // with 12% luxury tax
        
        let status = 'completed';
        let step = 5;
        if (monthsAgo === 0) {
          if (i % 3 === 0) {
            status = 'pending';
            step = 1;
          } else {
            status = 'confirmed';
            step = 3;
          }
        }

        bookings.push({
          bookingId: 'VEL-2026-' + String(i + 1).padStart(4, '0'),
          trackingId: 'TRK-VEL-' + String(i + 1).padStart(4, '0'),
          user: {
            userId: guest.userId,
            name: guest.name,
            email: guest.email
          },
          package: {
            id: 'p_' + suiteInfo.suite.toLowerCase().replace(' ', '_'),
            name: suiteInfo.name,
            suite: suiteInfo.suite,
            price: '₹' + suiteInfo.price.toLocaleString('en-IN'),
            nights: nights,
            destination: suiteInfo.destination
          },
          checkin: checkinDate.toLocaleDateString('en-CA'),
          checkout: checkoutDate.toLocaleDateString('en-CA'),
          amount: {
            total: total
          },
          status: status,
          trackingStep: step,
          createdAt: new Date(checkinDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          trackingHistory: [
            {
              status: 'Booking Submitted',
              date: new Date(checkinDate.getTime() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
              time: '10:00:00'
            }
          ]
        });
      }
      localStorage.setItem('velora_all_bookings', JSON.stringify(bookings));
    }

    let updated = false;
    bookings.forEach((b, index) => {
      if (!b.trackingId || b.trackingStep === undefined || !b.trackingHistory) {
        if (!b.trackingId) {
          b.trackingId = 'TRK-VEL-' + String(index + 1).padStart(4, '0');
        }
        if (b.trackingStep === undefined) {
          let step = 0;
          if (b.status === 'pending') step = 1;
          else if (b.status === 'confirmed') step = 2;
          else if (b.status === 'completed') step = 5;
          b.trackingStep = step;
        }
        if (!b.trackingHistory) {
          const initialStage = stages[b.trackingStep] || 'Booking Submitted';
          b.trackingHistory = [
            {
              status: initialStage,
              date: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
              time: b.createdAt ? new Date(b.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }
          ];
        }
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('velora_all_bookings', JSON.stringify(bookings));
    }
    return bookings;
  }

  function setAllBookings(bookings) {
    localStorage.setItem('velora_all_bookings', JSON.stringify(bookings));
  }

  function syncUserBookingStatus(bookingId, status, userId, trackingStep, trackingHistory) {
    if (!userId) return;
    const userKey = 'velora_bookings_' + userId;
    try {
      const userBookings = JSON.parse(localStorage.getItem(userKey) || '[]');
      const uB = userBookings.find(item => item.id === bookingId);
      if (uB) {
        uB.status = status;
        if (trackingStep !== undefined) {
          uB.trackingStep = trackingStep;
        } else {
          let step = 0;
          if (status === 'pending') step = 1;
          else if (status === 'confirmed') step = 2;
          else if (status === 'completed') step = 5;
          uB.trackingStep = step;
        }
        if (trackingHistory !== undefined) {
          uB.trackingHistory = trackingHistory;
        }
        localStorage.setItem(userKey, JSON.stringify(userBookings));
      }
    } catch (e) {
      console.error('Failed to sync user booking status', e);
    }
  }

  function renderAdminBookings() {
    const container = document.getElementById('admin-bookings-container');
    if (!container) return;
    const bookings = getAllBookings();

    // Update sidebar badge
    const badge = document.querySelector('[data-panel="panel-bookings"] .dash-nav-badge');
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    if (badge) { badge.textContent = pendingCount || ''; badge.style.display = pendingCount ? 'flex' : 'none'; }

    if (bookings.length === 0) {
      container.innerHTML = '<div class="dash-glass-card"><div class="dash-card-header"><h3 class="dash-card-title">All Bookings</h3><span class="dash-card-action">0 bookings</span></div><div class="dash-empty-state"><div class="dash-empty-title">No Bookings Yet</div><div class="dash-empty-desc">Bookings made by guests will appear here.</div></div></div>';
      return;
    }

    const statusClass = { pending: 'pending', confirmed: 'confirmed', rejected: '', completed: 'completed' };
    const statusLabel = { pending: 'Pending', confirmed: 'Confirmed', rejected: 'Rejected', completed: 'Completed' };

    container.innerHTML = `<div class="dash-glass-card" style="overflow-x:auto;">
      <div class="dash-card-header"><h3 class="dash-card-title">All Bookings</h3><span class="dash-card-action">${bookings.length} total</span></div>
      <table class="dash-data-table">
        <thead><tr><th>ID</th><th>Guest</th><th>Suite</th><th>Destination</th><th>Check-in</th><th>Check-out</th><th>Status</th><th>Total</th></tr></thead>
        <tbody>
          ${bookings.slice().reverse().map(b => {
            const total = b.amount ? b.amount.total : 0;
            const st = b.status || 'pending';
            return `<tr>
              <td style="font-weight:600;color:var(--gold);">${b.bookingId}</td>
              <td>${b.user ? b.user.name : '—'}</td>
              <td>${b.package ? b.package.suite : '—'}</td>
              <td>${b.package ? b.package.destination : '—'}</td>
              <td>${b.checkin ? formatDate(b.checkin) : '—'}</td>
              <td>${b.checkout ? formatDate(b.checkout) : '—'}</td>
              <td>
                <select class="dash-settings-input" style="padding:4px 8px;font-size:0.6rem;min-width:100px;background:rgba(255,255,255,0.03);border:1px solid rgba(214,179,106,0.15);color:var(--ivory);border-radius:6px;" data-booking-status="${b.bookingId}">
                  <option value="pending" ${st === 'pending' ? 'selected' : ''}>Pending</option>
                  <option value="confirmed" ${st === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                  <option value="rejected" ${st === 'rejected' ? 'selected' : ''}>Rejected</option>
                  <option value="completed" ${st === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
              </td>
              <td style="color:var(--gold);font-weight:600;">₹${total.toLocaleString('en-IN')}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

    // Status change handlers
    container.querySelectorAll('[data-booking-status]').forEach(select => {
      select.addEventListener('change', () => {
        const bookingId = select.getAttribute('data-booking-status');
        const newStatus = select.value;
        const bookings = getAllBookings();
        const booking = bookings.find(b => b.bookingId === bookingId);
        if (booking) {
          booking.status = newStatus;

          // Sync trackingStep and history if status changes
          let step = booking.trackingStep !== undefined ? booking.trackingStep : 0;
          if (newStatus === 'pending' && (step < 0 || step > 1)) step = 1;
          else if (newStatus === 'confirmed' && (step < 2 || step > 4)) step = 2;
          else if (newStatus === 'completed' && step !== 5) step = 5;

          if (step !== booking.trackingStep) {
            booking.trackingStep = step;
            const stages = [
              'Booking Submitted',
              'Under Review',
              'Reservation Confirmed',
              'Villa Assigned',
              'Ready For Arrival',
              'Checked In'
            ];
            const newStage = stages[step];
            if (!booking.trackingHistory) booking.trackingHistory = [];
            booking.trackingHistory.push({
              status: newStage,
              date: new Date().toLocaleDateString('en-IN'),
              time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });
          }

          setAllBookings(bookings);
          if (booking.user && booking.user.userId) {
            syncUserBookingStatus(bookingId, newStatus, booking.user.userId, booking.trackingStep, booking.trackingHistory);
          }
          refreshAdminUI();
          showToast('✦ ' + bookingId + ' → ' + newStatus.charAt(0).toUpperCase() + newStatus.slice(1));
        }
      });
    });
  }

  // ═══════════════════════════════════════════
  //  ADMIN 7: APPROVAL PANEL (Dynamic)
  // ═══════════════════════════════════════════
  function renderAdminApprovals() {
    const container = document.getElementById('panel-approvals');
    if (!container) return;
    const bookings = getAllBookings().filter(b => b.status === 'pending');

    // Update badge
    const badge = document.querySelector('[data-panel="panel-approvals"] .dash-nav-badge');
    if (badge) { badge.textContent = bookings.length || ''; badge.style.display = bookings.length ? 'flex' : 'none'; }

    // Keep header, replace body
    const header = container.querySelector('.dash-panel-header');
    const headerHtml = header ? header.outerHTML : '<div class="dash-panel-header"><h2 class="dash-panel-title">Reservation <em>Approvals</em></h2><p class="dash-panel-subtitle">Review and approve pending guest reservations</p></div>';

    if (bookings.length === 0) {
      container.innerHTML = headerHtml + '<div class="dash-glass-card"><div class="dash-empty-state"><div class="dash-empty-title">No Pending Approvals</div><div class="dash-empty-desc">All reservations have been processed.</div></div></div>';
      return;
    }

    container.innerHTML = headerHtml + '<div class="dash-concierge-list">' + bookings.map(b => {
      const total = b.amount ? b.amount.total : 0;
      const guestCount = b.guests ? (b.guests.adults + b.guests.children) : 2;
      return `<div class="dash-glass-card" style="margin-bottom:var(--space-md);">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-lg);flex-wrap:wrap;">
          <div style="flex:1;min-width:200px;">
            <div class="dash-concierge-subject" style="font-size:var(--text-lg);margin-bottom:6px;">${b.user ? b.user.name : 'Guest'} — ${b.package ? b.package.suite : 'Suite'}</div>
            <div class="dash-reservation-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>${b.checkin ? formatDate(b.checkin) : '—'} → ${b.checkout ? formatDate(b.checkout) : '—'}</div>
            <div class="dash-reservation-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>${guestCount} Guest${guestCount !== 1 ? 's' : ''}</div>
            <div class="dash-reservation-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg><span style="color:var(--gold);font-weight:600;">₹${total.toLocaleString('en-IN')}</span></div>
            <div style="font-size:0.6rem;color:var(--gray);margin-top:4px;">${b.bookingId} · ${b.package ? b.package.destination : ''}</div>
          </div>
          <div style="display:flex;gap:var(--space-sm);align-items:flex-start;">
            <button class="btn btn-gold" style="padding:10px 24px;" data-approve-booking="${b.bookingId}">Approve</button>
            <button class="dash-delete-btn" data-reject-booking="${b.bookingId}">Decline</button>
          </div>
        </div>
      </div>`;
    }).join('') + '</div>';

    container.querySelectorAll('[data-approve-booking]').forEach(btn => {
      btn.addEventListener('click', () => {
        const bookingId = btn.getAttribute('data-approve-booking');
        const allB = getAllBookings();
        const booking = allB.find(b => b.bookingId === bookingId);
        if (booking) {
          booking.status = 'confirmed';
          booking.trackingStep = 2; // Reservation Confirmed
          if (!booking.trackingHistory) booking.trackingHistory = [];
          booking.trackingHistory.push({
            status: 'Reservation Confirmed',
            date: new Date().toLocaleDateString('en-IN'),
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });
          setAllBookings(allB);
          if (booking.user && booking.user.userId) {
            syncUserBookingStatus(bookingId, 'confirmed', booking.user.userId, 2, booking.trackingHistory);
          }
          refreshAdminUI();
          showToast('✦ Booking approved');
        }
      });
    });

    container.querySelectorAll('[data-reject-booking]').forEach(btn => {
      btn.addEventListener('click', () => {
        const bookingId = btn.getAttribute('data-reject-booking');
        const allB = getAllBookings();
        const booking = allB.find(b => b.bookingId === bookingId);
        if (booking) {
          booking.status = 'rejected';
          setAllBookings(allB);
          if (booking.user && booking.user.userId) {
            syncUserBookingStatus(bookingId, 'rejected', booking.user.userId, booking.trackingStep, booking.trackingHistory);
          }
          refreshAdminUI();
          showToast('✦ Booking declined');
        }
      });
    });
  }

  // ═══════════════════════════════════════════
  //  ADMIN 8: TRACKING CONTROL SYSTEM
  // ═══════════════════════════════════════════
  function updateBookingStep(bookingId, newStep) {
    const bookings = getAllBookings();
    const booking = bookings.find(b => b.bookingId === bookingId);
    if (!booking) return;

    newStep = Math.max(0, Math.min(5, newStep));
    booking.trackingStep = newStep;

    // Update parent status
    if (newStep === 0 || newStep === 1) {
      booking.status = 'pending';
    } else if (newStep >= 2 && newStep <= 4) {
      booking.status = 'confirmed';
    } else if (newStep === 5) {
      booking.status = 'completed';
    }

    const stages = [
      'Booking Submitted',
      'Under Review',
      'Reservation Confirmed',
      'Villa Assigned',
      'Ready For Arrival',
      'Checked In'
    ];
    const stageName = stages[newStep];

    if (!booking.trackingHistory) booking.trackingHistory = [];
    booking.trackingHistory.push({
      status: stageName,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    setAllBookings(bookings);

    if (booking.user && booking.user.userId) {
      syncUserBookingStatus(bookingId, booking.status, booking.user.userId, newStep, booking.trackingHistory);
      
      // Trigger user notifications for stay progression milestones
      addUserNotification(booking.user.userId, 'Stay Progress Updated', `Your stay progression for booking ${bookingId} is now at: ${stageName}`, 'booking');
      
      if (newStep === 3) {
        addUserNotification(booking.user.userId, 'Villa Assigned', `A luxury villa has been assigned for your reservation ${bookingId}.`, 'booking');
      } else if (newStep === 5) {
        addUserNotification(booking.user.userId, 'Check-In Completed', `Welcome to VÉLORA RESERVE! Your check-in for booking ${bookingId} is complete.`, 'booking');
      }
    }

    refreshAdminUI();
    showToast(`✦ Stage updated to: ${stageName}`);
  }

  function renderAdminTracking() {
    const container = document.getElementById('admin-tracking-list-container');
    if (!container) return;
    const bookings = getAllBookings();

    const stages = [
      'Booking Submitted',
      'Under Review',
      'Reservation Confirmed',
      'Villa Assigned',
      'Ready For Arrival',
      'Checked In'
    ];

    const icons = {
      'Booking Submitted': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
      'Under Review': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      'Reservation Confirmed': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
      'Villa Assigned': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
      'Ready For Arrival': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
      'Checked In': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
    };

    const statusClass = { pending: 'pending', confirmed: 'confirmed', rejected: '', completed: 'completed' };

    // Filter bookings
    const filteredBookings = bookings.filter(b => {
      // 1. Search Query
      const query = trkSearchQuery.trim().toLowerCase();
      let matchQuery = true;
      if (query) {
        const trkId = (b.trackingId || '').toLowerCase();
        const bId = (b.bookingId || '').toLowerCase();
        const gName = (b.user && b.user.name || '').toLowerCase();
        matchQuery = trkId.includes(query) || bId.includes(query) || gName.includes(query);
      }

      // 2. Filter Stage
      let matchStage = true;
      if (trkFilterStage !== 'all') {
        const filterStepVal = parseInt(trkFilterStage);
        matchStage = b.trackingStep === filterStepVal;
      }

      return matchQuery && matchStage;
    });

    if (filteredBookings.length === 0) {
      container.innerHTML = `
        <div class="dash-glass-card">
          <div class="dash-empty-state">
            <div class="dash-empty-title">No Matching Stays</div>
            <div class="dash-empty-desc">Adjust your filters or search keywords.</div>
          </div>
        </div>`;
      return;
    }

    container.innerHTML = filteredBookings.slice().reverse().map(b => {
      const currentStep = b.trackingStep !== undefined ? b.trackingStep : 0;
      return `
        <div class="dash-glass-card" style="margin-bottom: var(--space-md);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-sm); border-bottom: 1px solid var(--glass-border); padding-bottom: var(--space-sm); margin-bottom: var(--space-md);">
            <div>
              <h3 style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--ivory); font-weight: 500; margin: 0;">
                ${b.user ? b.user.name : 'Guest'} — <span style="color: var(--gold);">${b.package ? b.package.suite : 'Suite'}</span>
              </h3>
              <p style="font-family: var(--font-ui); font-size: var(--text-xs); color: var(--gray); margin: 4px 0 0 0;">
                Tracking ID: <strong style="color: var(--ivory);">${b.trackingId}</strong> | Ref: <strong style="color: var(--ivory);">${b.bookingId}</strong> | ${b.package ? b.package.destination : ''}
              </p>
            </div>
            <span class="dash-reservation-status ${statusClass[b.status] || ''}" style="margin:0;">
              ${b.status.charAt(0).toUpperCase() + b.status.slice(1)}
            </span>
          </div>
          
          <div class="dash-tracking-steps">
            ${stages.map((step, i) => {
              let cls = '';
              if (i < currentStep) cls = 'completed';
              else if (i === currentStep) cls = 'active';
              return `<div class="dash-tracking-step ${cls}">
                <div class="dash-tracking-dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor">${icons[step]}</svg></div>
                <div class="dash-tracking-label">${step}</div>
              </div>`;
            }).join('')}
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md); border-top: 1px solid var(--glass-border); border-bottom: 1px solid var(--glass-border); padding: var(--space-sm) 0; margin-bottom: var(--space-sm);">
            <div style="display: flex; gap: var(--space-sm);">
              <button class="btn btn-ghost" style="padding: 8px 16px; font-size: 0.7rem;" data-prev-step="${b.bookingId}" ${currentStep === 0 ? 'disabled' : ''}>
                ← Prev Stage
              </button>
              <button class="btn btn-gold" style="padding: 8px 16px; font-size: 0.7rem;" data-next-step="${b.bookingId}" ${currentStep === 5 ? 'disabled' : ''}>
                Next Stage →
              </button>
            </div>
            <div style="display: flex; align-items: center; gap: var(--space-xs);">
              <label style="font-family: var(--font-ui); font-size: var(--text-xs); color: var(--gray);">Jump to Stage:</label>
              <select class="dash-settings-input" style="padding: 6px 12px; font-size: 0.7rem; width: 180px; background: var(--charcoal); color: var(--ivory); border: 1px solid var(--glass-border); border-radius: 6px;" data-select-step="${b.bookingId}">
                ${stages.map((stName, idx) => `<option value="${idx}" ${currentStep === idx ? 'selected' : ''}>${idx}: ${stName}</option>`).join('')}
              </select>
            </div>
          </div>

          <div>
            <h4 style="font-family: var(--font-ui); font-size: var(--text-xs); color: var(--gold); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: var(--space-xs);">Curation Timeline History</h4>
            <div style="display: flex; flex-direction: column; gap: 4px; max-height: 120px; overflow-y: auto; padding-left: var(--space-xs);">
              ${b.trackingHistory ? b.trackingHistory.slice().reverse().map(h => `
                <div style="display: flex; justify-content: space-between; font-family: var(--font-ui); font-size: 0.65rem; border-left: 1px solid var(--gold); padding-left: var(--space-sm); margin-bottom: 2px;">
                  <span style="color: var(--ivory); font-weight: 500;">${h.status}</span>
                  <span style="color: var(--gray);">${h.date} at ${h.time}</span>
                </div>
              `).join('') : ''}
            </div>
          </div>
        </div>`;
    }).join('');

    // Bind card event handlers
    container.querySelectorAll('[data-prev-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        const bookingId = btn.getAttribute('data-prev-step');
        const b = bookings.find(item => item.bookingId === bookingId);
        if (b && b.trackingStep > 0) {
          updateBookingStep(bookingId, b.trackingStep - 1);
        }
      });
    });

    container.querySelectorAll('[data-next-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        const bookingId = btn.getAttribute('data-next-step');
        const b = bookings.find(item => item.bookingId === bookingId);
        if (b && b.trackingStep < 5) {
          updateBookingStep(bookingId, b.trackingStep + 1);
        }
      });
    });

    container.querySelectorAll('[data-select-step]').forEach(select => {
      select.addEventListener('change', () => {
        const bookingId = select.getAttribute('data-select-step');
        const newStep = parseInt(select.value);
        updateBookingStep(bookingId, newStep);
      });
    });
  }

  // Bind Search and Filter input listeners
  const trkSearch = document.getElementById('trk-search-input');
  if (trkSearch) {
    trkSearch.addEventListener('input', (e) => {
      trkSearchQuery = e.target.value;
      renderAdminTracking();
    });
  }

  const trkFilter = document.getElementById('trk-filter-status');
  if (trkFilter) {
    trkFilter.addEventListener('change', (e) => {
      trkFilterStage = e.target.value;
      renderAdminTracking();
    });
  }

  // ═══════════════════════════════════════════
  //  ADMIN 9: SYSTEM NOTIFICATION SYSTEM
  // ═══════════════════════════════════════════
  function getAdminNotifications() {
    try {
      const raw = localStorage.getItem('velora_admin_notifications');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function setAdminNotifications(list) {
    localStorage.setItem('velora_admin_notifications', JSON.stringify(list));
  }

  function updateAdminNotifications() {
    let notified = { bookings: [], signups: [], concierge: [], reviews: [] };
    try {
      const raw = localStorage.getItem('velora_admin_notified_keys');
      if (raw) notified = JSON.parse(raw);
    } catch {}

    if (!notified.bookings) notified.bookings = [];
    if (!notified.signups) notified.signups = [];
    if (!notified.concierge) notified.concierge = [];
    if (!notified.reviews) notified.reviews = [];

    const adminNotifications = getAdminNotifications();
    let newNotifs = false;
    const nowStr = new Date().toISOString();

    const isFirstRun = !localStorage.getItem('velora_admin_notified_keys');

    // A. Bookings
    const bookings = getAllBookings();
    bookings.forEach(b => {
      if (b.bookingId && !notified.bookings.includes(b.bookingId)) {
        if (!isFirstRun) {
          adminNotifications.unshift({
            id: 'an_' + Math.random().toString(36).substr(2, 9),
            title: 'New Booking Received',
            desc: `Booking ${b.bookingId} for ${b.package ? b.package.suite : 'Suite'} by ${b.user ? b.user.name : 'Guest'}`,
            type: 'booking',
            refId: b.bookingId,
            read: false,
            time: b.createdAt || nowStr
          });
          newNotifs = true;
        }
        notified.bookings.push(b.bookingId);
      }
    });

    // B. Signups
    const users = getAllUsers();
    users.forEach(u => {
      if (u.email && !notified.signups.includes(u.email)) {
        if (!isFirstRun) {
          adminNotifications.unshift({
            id: 'an_' + Math.random().toString(36).substr(2, 9),
            title: 'New Signup Created',
            desc: `${u.name || 'Guest'} (${u.email}) registered a new guest account`,
            type: 'signup',
            refId: u.email,
            read: false,
            time: u.createdAt || nowStr
          });
          newNotifs = true;
        }
        notified.signups.push(u.email);
      }
    });

    // C. Concierge Requests
    const concierge = getAdminConcierge();
    concierge.forEach(c => {
      if (c.id && !notified.concierge.includes(c.id)) {
        if (!isFirstRun) {
          adminNotifications.unshift({
            id: 'an_' + Math.random().toString(36).substr(2, 9),
            title: 'Concierge Request Received',
            desc: `Request "${c.subject}" submitted by ${c.guest || 'Guest'}`,
            type: 'concierge',
            refId: c.id,
            read: false,
            time: c.time || nowStr
          });
          newNotifs = true;
        }
        notified.concierge.push(c.id);
      }
    });

    // D. Reviews
    const reviews = getAdminReviews();
    reviews.forEach(r => {
      if (r.id && !notified.reviews.includes(r.id)) {
        if (!isFirstRun) {
          adminNotifications.unshift({
            id: 'an_' + Math.random().toString(36).substr(2, 9),
            title: 'Review Submitted',
            desc: `${r.rating}-star review for ${r.property} by ${r.author}`,
            type: 'review',
            refId: r.id,
            read: false,
            time: r.time || nowStr
          });
          newNotifs = true;
        }
        notified.reviews.push(r.id);
      }
    });

    if (isFirstRun) {
      adminNotifications.push({
        id: 'an_welcome',
        title: 'System Active',
        desc: 'VÉLORA RESERVE notification center is now active.',
        type: 'system',
        refId: 'system',
        read: false,
        time: nowStr
      });
      newNotifs = true;
    }

    localStorage.setItem('velora_admin_notified_keys', JSON.stringify(notified));

    if (newNotifs) {
      if (adminNotifications.length > 50) adminNotifications.splice(50);
      setAdminNotifications(adminNotifications);
    }
  }

  function renderAdminNotificationCenter() {
    updateAdminNotifications();

    const alertsList = document.getElementById('admin-alerts-list');
    const pendingList = document.getElementById('admin-pending-list');
    const activitiesList = document.getElementById('admin-activities-list');

    if (!alertsList && !pendingList && !activitiesList) return;

    const allBookings = getAllBookings();
    const adminNotifications = getAdminNotifications();

    const unreadCount = adminNotifications.filter(n => !n.read).length;
    
    const badge = document.getElementById('admin-notif-badge-count');
    if (badge) {
      badge.textContent = unreadCount || '';
      badge.style.display = unreadCount ? 'flex' : 'none';
    }

    const bellBadge = document.getElementById('nav-notif-count');
    if (bellBadge) {
      bellBadge.textContent = unreadCount || '';
      bellBadge.style.display = unreadCount ? 'flex' : 'none';
    }

    // Alerts
    if (alertsList) {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const tomorrowStr = tomorrow.toLocaleDateString('en-CA');

      const arrivalAlerts = allBookings.filter(b => b.status === 'confirmed' && b.checkin === todayStr);
      const departureAlerts = allBookings.filter(b => b.status === 'confirmed' && b.checkout === tomorrowStr);
      const criticalPendingAlerts = allBookings.filter(b => {
        if (b.status !== 'pending') return false;
        const created = new Date(b.createdAt || Date.now());
        return (Date.now() - created.getTime()) > (24 * 60 * 60 * 1000);
      });

      const totalAlerts = arrivalAlerts.length + departureAlerts.length + criticalPendingAlerts.length;
      const countLabel = document.getElementById('admin-alerts-count');
      if (countLabel) {
        countLabel.textContent = `${totalAlerts} alert${totalAlerts !== 1 ? 's' : ''}`;
      }

      let alertsHtml = '';

      criticalPendingAlerts.forEach(b => {
        alertsHtml += `
          <div style="background: rgba(239, 68, 68, 0.06); border-left: 3px solid #EF4444; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
            <div style="color: #EF4444; font-weight: 600; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em;">Action Required</div>
            <div style="color: var(--ivory); font-size: 0.65rem; margin-top: 2px;">Booking <strong>${b.bookingId}</strong> has been pending for over 24 hours.</div>
            <button class="btn btn-gold" style="padding: 4px 10px; font-size: 0.55rem; margin-top: 8px;" onclick="document.querySelector('[data-panel=panel-approvals]').click()">Review Approvals</button>
          </div>
        `;
      });

      arrivalAlerts.forEach(b => {
        alertsHtml += `
          <div style="background: rgba(245, 158, 11, 0.06); border-left: 3px solid #F59E0B; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
            <div style="color: #F59E0B; font-weight: 600; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em;">Guest Arrival Today</div>
            <div style="color: var(--ivory); font-size: 0.65rem; margin-top: 2px;">Guest <strong>${b.user ? b.user.name : 'Guest'}</strong> is checking into <em>${b.package ? b.package.suite : 'Suite'}</em> today.</div>
            <button class="btn btn-ghost" style="padding: 4px 10px; font-size: 0.55rem; margin-top: 8px;" onclick="document.querySelector('[data-panel=panel-tracking]').click()">Manage Stay</button>
          </div>
        `;
      });

      departureAlerts.forEach(b => {
        alertsHtml += `
          <div style="background: rgba(59, 130, 246, 0.06); border-left: 3px solid #3B82F6; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
            <div style="color: #3B82F6; font-weight: 600; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em;">Departure Tomorrow</div>
            <div style="color: var(--ivory); font-size: 0.65rem; margin-top: 2px;">Guest <strong>${b.user ? b.user.name : 'Guest'}</strong> is checking out tomorrow.</div>
          </div>
        `;
      });

      if (!alertsHtml) {
        alertsHtml = `
          <div class="dash-empty-state" style="padding: var(--space-lg) 0;">
            <div style="font-size: 1.5rem; margin-bottom: 6px; color: var(--gold);">✦</div>
            <div class="dash-empty-title" style="font-size: 0.75rem;">System Operational</div>
            <div class="dash-empty-desc" style="font-size: 0.6rem;">All sanctuaries operating smoothly. No urgent alerts.</div>
          </div>
        `;
      }

      alertsList.innerHTML = alertsHtml;
    }

    // Pending Approvals
    if (pendingList) {
      const pendingBookings = allBookings.filter(b => b.status === 'pending');
      const countLabel = document.getElementById('admin-pending-count');
      if (countLabel) {
        countLabel.textContent = `${pendingBookings.length} pending`;
      }

      if (pendingBookings.length === 0) {
        pendingList.innerHTML = `
          <div class="dash-empty-state" style="padding: var(--space-lg) 0;">
            <div class="dash-empty-title" style="font-size: 0.75rem;">No Pending Approvals</div>
            <div class="dash-empty-desc" style="font-size: 0.6rem;">All guest reservations have been processed.</div>
          </div>
        `;
      } else {
        pendingList.innerHTML = pendingBookings.map(b => {
          const total = b.amount ? b.amount.total : 0;
          return `
            <div class="dash-glass-card" style="padding: 12px; margin-bottom: 8px; background: rgba(255, 255, 255, 0.01); border-color: rgba(214,179,106,0.15);">
              <div style="font-weight: 600; color: var(--gold); font-size: 0.7rem; margin-bottom: 4px;">
                ${b.user ? b.user.name : 'Guest'}
              </div>
              <div style="color: var(--ivory); font-size: 0.65rem; margin-bottom: 4px;">
                ${b.package ? b.package.suite : 'Suite'} — ₹${total.toLocaleString('en-IN')}
              </div>
              <div style="color: var(--gray); font-size: 0.55rem; font-family: var(--font-ui);">
                ${formatDate(b.checkin)} → ${formatDate(b.checkout)}
              </div>
              <div style="display: flex; gap: var(--space-xs); margin-top: 8px;">
                <button class="btn btn-gold" style="padding: 4px 10px; font-size: 0.55rem;" data-admin-notif-approve="${b.bookingId}">Approve</button>
                <button class="dash-delete-btn" style="padding: 4px 10px; font-size: 0.52rem;" data-admin-notif-reject="${b.bookingId}">Decline</button>
              </div>
            </div>
          `;
        }).join('');

        pendingList.querySelectorAll('[data-admin-notif-approve]').forEach(btn => {
          btn.addEventListener('click', () => {
            const bookingId = btn.getAttribute('data-admin-notif-approve');
            const allB = getAllBookings();
            const booking = allB.find(item => item.bookingId === bookingId);
            if (booking) {
              booking.status = 'confirmed';
              booking.trackingStep = 2;
              if (!booking.trackingHistory) booking.trackingHistory = [];
              booking.trackingHistory.push({
                status: 'Reservation Confirmed',
                date: new Date().toLocaleDateString('en-IN'),
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              });
              setAllBookings(allB);
              if (booking.user && booking.user.userId) {
                syncUserBookingStatus(bookingId, 'confirmed', booking.user.userId, 2, booking.trackingHistory);
                addUserNotification(booking.user.userId, 'Booking Approved', `Your reservation ${bookingId} has been approved!`, 'booking');
              }
              refreshAdminUI();
              showToast('✦ Booking approved');
            }
          });
        });

        pendingList.querySelectorAll('[data-admin-notif-reject]').forEach(btn => {
          btn.addEventListener('click', () => {
            const bookingId = btn.getAttribute('data-admin-notif-reject');
            const allB = getAllBookings();
            const booking = allB.find(item => item.bookingId === bookingId);
            if (booking) {
              booking.status = 'rejected';
              setAllBookings(allB);
              if (booking.user && booking.user.userId) {
                syncUserBookingStatus(bookingId, 'rejected', booking.user.userId, booking.trackingStep, booking.trackingHistory);
                addUserNotification(booking.user.userId, 'Booking Rejected', `Your reservation ${bookingId} has been declined. Please contact our concierge.`, 'booking');
              }
              refreshAdminUI();
              showToast('✦ Booking declined');
            }
          });
        });
      }
    }

    // Activities
    if (activitiesList) {
      const countLabel = document.getElementById('admin-activities-count');
      if (countLabel) {
        countLabel.textContent = `${adminNotifications.length} item${adminNotifications.length !== 1 ? 's' : ''}`;
      }

      if (adminNotifications.length === 0) {
        activitiesList.innerHTML = `
          <div class="dash-empty-state" style="padding: var(--space-lg) 0;">
            <div class="dash-empty-title" style="font-size: 0.75rem;">No Activities</div>
            <div class="dash-empty-desc" style="font-size: 0.6rem;">System logs will appear here.</div>
          </div>
        `;
      } else {
        activitiesList.innerHTML = adminNotifications.map(n => `
          <div class="dash-notification-item ${n.read ? '' : 'unread'}" style="padding: 10px; margin-bottom: 8px; border-radius: 6px; cursor: pointer; position: relative;" data-admin-notif-id="${n.id}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-xs);">
              <div style="flex: 1; padding-right: 24px;">
                <div style="font-weight: 600; color: var(--ivory); font-size: 0.65rem;">${n.title}</div>
                <div style="color: var(--gray); font-size: 0.6rem; margin-top: 2px;">${n.desc}</div>
                <div style="color: var(--gold); font-size: 0.55rem; margin-top: 4px;">${timeAgo(n.time)}</div>
              </div>
              <button class="dash-delete-btn" style="padding: 2px 6px; font-size: 0.55rem; background: none; border: 1px solid rgba(239, 68, 68, 0.15); color: var(--error); border-radius: 4px; z-index: 10; position: absolute; top: 10px; right: 10px;" data-admin-delete-notif="${n.id}">Delete</button>
            </div>
          </div>
        `).join('');

        activitiesList.querySelectorAll('[data-admin-notif-id]').forEach(el => {
          el.addEventListener('click', (e) => {
            if (e.target.closest('[data-admin-delete-notif]')) return;
            const id = el.getAttribute('data-admin-notif-id');
            const list = getAdminNotifications();
            const item = list.find(n => n.id === id);
            if (item && !item.read) {
              item.read = true;
              setAdminNotifications(list);
              renderAdminNotificationCenter();
            }
          });
        });

        activitiesList.querySelectorAll('[data-admin-delete-notif]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-admin-delete-notif');
            let list = getAdminNotifications();
            list = list.filter(n => n.id !== id);
            setAdminNotifications(list);
            renderAdminNotificationCenter();
            showToast('✦ Notification removed');
          });
        });
      }
    }
  }

  // Bind Admin Notification Center controls
  const adminMarkRead = document.getElementById('admin-mark-all-read-btn');
  if (adminMarkRead) {
    adminMarkRead.addEventListener('click', () => {
      const list = getAdminNotifications();
      list.forEach(n => n.read = true);
      setAdminNotifications(list);
      renderAdminNotificationCenter();
      showToast('✦ All admin notifications marked as read');
    });
  }

  const adminClearAll = document.getElementById('admin-clear-all-btn');
  if (adminClearAll) {
    adminClearAll.addEventListener('click', () => {
      setAdminNotifications([]);
      renderAdminNotificationCenter();
      showToast('✦ Admin notifications cleared');
    });
  }

  // ═══════════════════════════════════════════
  //  ADMIN INIT
  // ═══════════════════════════════════════════
  refreshAdminUI();
  bindReportsTabs();
  }

  // ═══════════════════════════════════════════
  //  PROFILE MANAGEMENT SYSTEM
  // ═══════════════════════════════════════════

  // Temporary base64 store for photos
  let tempProfilePhoto = null;
  let tempAdminProfilePhoto = null;

  // Update sidebar profile elements on load and on update
  function updateSidebarProfile() {
    const currentUser = typeof VeloraAuth !== 'undefined' ? VeloraAuth.getCurrentUser() : null;
    if (!currentUser) return;

    // Update sidebar elements
    const sidebarAvatar = document.querySelector('.dash-sidebar-avatar');
    if (sidebarAvatar) {
      if (currentUser.profilePhoto) {
        sidebarAvatar.innerHTML = `<img src="${currentUser.profilePhoto}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        if (currentUser.role === 'admin') {
          sidebarAvatar.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: var(--error);"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
        } else {
          sidebarAvatar.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        }
      }
    }

    const sidebarName = document.getElementById('dash-sidebar-name');
    if (sidebarName) sidebarName.textContent = currentUser.name;

    const sidebarEmail = document.getElementById('dash-sidebar-email');
    if (sidebarEmail) sidebarEmail.textContent = currentUser.email;

    const welcomeUser = document.getElementById('dash-welcome-user');
    if (welcomeUser) welcomeUser.textContent = currentUser.name;
  }

  // Populate guest settings inputs
  function populateGuestProfile() {
    const currentUser = typeof VeloraAuth !== 'undefined' ? VeloraAuth.getCurrentUser() : null;
    if (!currentUser) return;

    // Profile Preview fields
    const pfName = document.getElementById('dash-pf-name');
    if (pfName) pfName.textContent = currentUser.name || '—';
    const pfEmail = document.getElementById('dash-pf-email');
    if (pfEmail) pfEmail.textContent = currentUser.email || '—';

    // Form inputs
    const nameInput = document.getElementById('settings-name');
    if (nameInput) nameInput.value = currentUser.name || '';
    const emailInput = document.getElementById('settings-email');
    if (emailInput) emailInput.value = currentUser.email || '';
    const phoneInput = document.getElementById('settings-phone');
    if (phoneInput) phoneInput.value = currentUser.mobile || '';
    const dobInput = document.getElementById('settings-dob');
    if (dobInput) dobInput.value = currentUser.dob || '';
    const addressInput = document.getElementById('settings-address');
    if (addressInput) addressInput.value = currentUser.address || '';

    // Settings Avatar preview
    const avatarImg = document.getElementById('settings-avatar-img');
    const avatarSvg = document.getElementById('settings-avatar-svg');
    if (avatarImg && avatarSvg) {
      if (currentUser.profilePhoto) {
        avatarImg.src = currentUser.profilePhoto;
        avatarImg.style.display = 'block';
        avatarSvg.style.display = 'none';
      } else {
        avatarImg.src = '';
        avatarImg.style.display = 'none';
        avatarSvg.style.display = 'block';
      }
    }
  }

  // Populate admin settings inputs
  function populateAdminProfile() {
    const currentUser = typeof VeloraAuth !== 'undefined' ? VeloraAuth.getCurrentUser() : null;
    if (!currentUser) return;

    const nameInput = document.getElementById('admin-settings-name');
    if (nameInput) nameInput.value = currentUser.name || '';
    const emailInput = document.getElementById('admin-settings-email');
    if (emailInput) emailInput.value = currentUser.email || '';
    const phoneInput = document.getElementById('admin-settings-phone');
    if (phoneInput) phoneInput.value = currentUser.mobile || '';

    // Settings Avatar preview
    const avatarImg = document.getElementById('admin-settings-avatar-img');
    const avatarSvg = document.getElementById('admin-settings-avatar-svg');
    if (avatarImg && avatarSvg) {
      if (currentUser.profilePhoto) {
        avatarImg.src = currentUser.profilePhoto;
        avatarImg.style.display = 'block';
        avatarSvg.style.display = 'none';
      } else {
        avatarImg.src = '';
        avatarImg.style.display = 'none';
        avatarSvg.style.display = 'block';
      }
    }
  }

  // --- Guest Interactive Settings Flow ---
  const settingsEditBtn = document.getElementById('settings-edit-btn');
  const settingsForm = document.getElementById('settings-form');
  const settingsCancelBtn = document.getElementById('settings-cancel');
  const settingsActionsRow = document.getElementById('settings-actions-row');
  const photoUploadInput = document.getElementById('profile-photo-upload');
  const photoUploadLabel = document.getElementById('profile-photo-upload-label');

  if (settingsEditBtn && settingsForm) {
    settingsEditBtn.addEventListener('click', () => {
      // Toggle disabled state
      const inputs = settingsForm.querySelectorAll('.dash-settings-input');
      inputs.forEach(input => input.removeAttribute('disabled'));

      // Show photo upload and actions
      if (photoUploadLabel) photoUploadLabel.style.display = 'inline-block';
      if (settingsActionsRow) settingsActionsRow.style.display = 'flex';
      settingsEditBtn.style.display = 'none';
      tempProfilePhoto = null;
    });
  }

  if (settingsCancelBtn) {
    settingsCancelBtn.addEventListener('click', () => {
      populateGuestProfile();
      
      // Toggle disabled state back
      if (settingsForm) {
        const inputs = settingsForm.querySelectorAll('.dash-settings-input');
        inputs.forEach(input => input.setAttribute('disabled', true));
      }

      // Hide photo upload and actions
      if (photoUploadLabel) photoUploadLabel.style.display = 'none';
      if (settingsActionsRow) settingsActionsRow.style.display = 'none';
      if (settingsEditBtn) settingsEditBtn.style.display = 'inline-block';
      tempProfilePhoto = null;
    });
  }

  // Guest photo selection & base64 conversion
  if (photoUploadInput) {
    photoUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // 1MB Size check
      if (file.size > 1024 * 1024) {
        showToast('✦ File size exceeds 1MB limit.');
        photoUploadInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = function(evt) {
        tempProfilePhoto = evt.target.result;
        const avatarImg = document.getElementById('settings-avatar-img');
        const avatarSvg = document.getElementById('settings-avatar-svg');
        if (avatarImg && avatarSvg) {
          avatarImg.src = tempProfilePhoto;
          avatarImg.style.display = 'block';
          avatarSvg.style.display = 'none';
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Guest Save Profile changes
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('settings-name').value.trim();
      const emailVal = document.getElementById('settings-email').value.trim();
      const phoneVal = document.getElementById('settings-phone').value.trim();
      const dobVal = document.getElementById('settings-dob').value;
      const addressVal = document.getElementById('settings-address').value.trim();

      if (!nameVal) {
        showToast('✦ Full Name is required.');
        return;
      }
      if (!emailVal || !VeloraAuth.validateEmail(emailVal)) {
        showToast('✦ Please enter a valid email address.');
        return;
      }
      if (!phoneVal || !VeloraAuth.validateMobile(phoneVal)) {
        showToast('✦ Please enter a valid phone number.');
        return;
      }

      const updatedFields = {
        name: nameVal,
        email: emailVal,
        mobile: phoneVal,
        dob: dobVal,
        address: addressVal
      };

      if (tempProfilePhoto) {
        updatedFields.profilePhoto = tempProfilePhoto;
      }

      const result = VeloraAuth.updateCurrentUser(updatedFields);
      if (result.success) {
        showToast('✦ Profile updated successfully.');
        
        // Disable inputs
        const inputs = settingsForm.querySelectorAll('.dash-settings-input');
        inputs.forEach(input => input.setAttribute('disabled', true));

        // Hide upload and actions
        if (photoUploadLabel) photoUploadLabel.style.display = 'none';
        if (settingsActionsRow) settingsActionsRow.style.display = 'none';
        if (settingsEditBtn) settingsEditBtn.style.display = 'inline-block';
        tempProfilePhoto = null;

        populateGuestProfile();
      } else {
        showToast('✦ ' + result.message);
      }
    });
  }

  // --- Admin Interactive Settings Flow ---
  const adminSettingsEditBtn = document.getElementById('admin-settings-edit-btn');
  const adminSettingsForm = document.getElementById('admin-settings-form');
  const adminSettingsCancelBtn = document.getElementById('admin-settings-cancel');
  const adminSettingsActionsRow = document.getElementById('admin-settings-actions-row');
  const adminPhotoUploadInput = document.getElementById('admin-profile-photo-upload');
  const adminPhotoUploadLabel = document.getElementById('admin-profile-photo-upload-label');

  if (adminSettingsEditBtn && adminSettingsForm) {
    adminSettingsEditBtn.addEventListener('click', () => {
      const inputs = adminSettingsForm.querySelectorAll('.dash-settings-input');
      inputs.forEach(input => input.removeAttribute('disabled'));

      if (adminPhotoUploadLabel) adminPhotoUploadLabel.style.display = 'inline-block';
      if (adminSettingsActionsRow) adminSettingsActionsRow.style.display = 'flex';
      adminSettingsEditBtn.style.display = 'none';
      tempAdminProfilePhoto = null;
    });
  }

  if (adminSettingsCancelBtn) {
    adminSettingsCancelBtn.addEventListener('click', () => {
      populateAdminProfile();
      
      if (adminSettingsForm) {
        const inputs = adminSettingsForm.querySelectorAll('.dash-settings-input');
        inputs.forEach(input => input.setAttribute('disabled', true));
      }

      if (adminPhotoUploadLabel) adminPhotoUploadLabel.style.display = 'none';
      if (adminSettingsActionsRow) adminSettingsActionsRow.style.display = 'none';
      if (adminSettingsEditBtn) adminSettingsEditBtn.style.display = 'inline-block';
      tempAdminProfilePhoto = null;
    });
  }

  // Admin photo selection & base64 conversion
  if (adminPhotoUploadInput) {
    adminPhotoUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 1024 * 1024) {
        showToast('✦ File size exceeds 1MB limit.');
        adminPhotoUploadInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = function(evt) {
        tempAdminProfilePhoto = evt.target.result;
        const avatarImg = document.getElementById('admin-settings-avatar-img');
        const avatarSvg = document.getElementById('admin-settings-avatar-svg');
        if (avatarImg && avatarSvg) {
          avatarImg.src = tempAdminProfilePhoto;
          avatarImg.style.display = 'block';
          avatarSvg.style.display = 'none';
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Admin Save Profile changes
  if (adminSettingsForm) {
    adminSettingsForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('admin-settings-name').value.trim();
      const emailVal = document.getElementById('admin-settings-email').value.trim();
      const phoneVal = document.getElementById('admin-settings-phone').value.trim();

      if (!nameVal) {
        showToast('✦ Full Name is required.');
        return;
      }
      if (!emailVal || !VeloraAuth.validateEmail(emailVal)) {
        showToast('✦ Please enter a valid email address.');
        return;
      }
      if (!phoneVal || !VeloraAuth.validateMobile(phoneVal)) {
        showToast('✦ Please enter a valid phone number.');
        return;
      }

      const updatedFields = {
        name: nameVal,
        email: emailVal,
        mobile: phoneVal
      };

      if (tempAdminProfilePhoto) {
        updatedFields.profilePhoto = tempAdminProfilePhoto;
      }

      const result = VeloraAuth.updateCurrentUser(updatedFields);
      if (result.success) {
        showToast('✦ Admin profile updated successfully.');
        
        const inputs = adminSettingsForm.querySelectorAll('.dash-settings-input');
        inputs.forEach(input => input.setAttribute('disabled', true));

        if (adminPhotoUploadLabel) adminPhotoUploadLabel.style.display = 'none';
        if (adminSettingsActionsRow) adminSettingsActionsRow.style.display = 'none';
        if (adminSettingsEditBtn) adminSettingsEditBtn.style.display = 'inline-block';
        tempAdminProfilePhoto = null;

        populateAdminProfile();
      } else {
        showToast('✦ ' + result.message);
      }
    });
  }

  // --- Password Forms Submit Actions ---
  // Guest Security Form
  const passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const curPwd = document.getElementById('sec-current').value;
      const newPwd = document.getElementById('sec-new').value;
      const conPwd = document.getElementById('sec-confirm').value;

      if (newPwd.length < 8) {
        showToast('✦ Password must be at least 8 characters.');
        return;
      }
      if (newPwd !== conPwd) {
        showToast('✦ New passwords do not match.');
        return;
      }

      const result = VeloraAuth.changePassword(curPwd, newPwd);
      if (result.success) {
        showToast('✦ Password updated successfully.');
        passwordForm.reset();
      } else {
        showToast('✦ ' + result.message);
      }
    });
  }

  // Admin Security Form
  const adminPasswordForm = document.getElementById('admin-password-form');
  if (adminPasswordForm) {
    adminPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const curPwd = document.getElementById('admin-sec-current').value;
      const newPwd = document.getElementById('admin-sec-new').value;
      const conPwd = document.getElementById('admin-sec-confirm').value;

      if (newPwd.length < 8) {
        showToast('✦ Password must be at least 8 characters.');
        return;
      }
      if (newPwd !== conPwd) {
        showToast('✦ New passwords do not match.');
        return;
      }

      const result = VeloraAuth.changePassword(curPwd, newPwd);
      if (result.success) {
        showToast('✦ Password updated successfully.');
        adminPasswordForm.reset();
      } else {
        showToast('✦ ' + result.message);
      }
    });
  }

  // --- Hash Routing Trigger ---
  function handleHashRoute() {
    const hash = window.location.hash;
    if (hash === '#profile') {
      const isSystemAdmin = window.location.pathname.includes('admin-dashboard');
      if (isSystemAdmin) {
        switchPanel('panel-admin-profile');
      } else {
        switchPanel('panel-profile');
      }
    }
  }
  window.addEventListener('hashchange', handleHashRoute);

  // --- Initialize on load ---
  updateSidebarProfile();
  populateGuestProfile();
  populateAdminProfile();
  handleHashRoute();

  // Listen to profile updates from authentication triggers
  document.addEventListener('velora-profile-updated', () => {
    updateSidebarProfile();
  });
});
