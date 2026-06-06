/* ============================================================
   VÉLORA RESERVE — Authentication Engine (Frontend-Only)
   ============================================================
   Tech: Vanilla JS + LocalStorage + SessionStorage
   No backend, no Firebase, no frameworks.
   ============================================================ */

const VeloraAuth = (() => {
  'use strict';

  // ─── Storage Keys ───
  const KEYS = {
    USERS: 'velora_users',
    SESSION: 'velora_session',
    REMEMBER: 'velora_remember'
  };

  // ─── Utility: Generate a unique ID ───
  function generateId() {
    return 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  // ─── Utility: Hash password (simple frontend-only hash) ───
  function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'vhash_' + Math.abs(hash).toString(36) + '_' + password.length;
  }

  // ─── Get all users from LocalStorage ───
  function getUsers() {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // ─── Save users to LocalStorage ───
  function saveUsers(users) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  // ─── Create a default admin account if none exists ───
  function ensureAdminExists() {
    const users = getUsers();
    const adminExists = users.some(u => u.role === 'admin');
    if (!adminExists) {
      users.push({
        userId: 'usr_admin_001',
        name: 'VÉLORA Admin',
        email: 'admin@velorareserve.com',
        mobile: '+919840012345',
        password: hashPassword('Admin@123'),
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      saveUsers(users);
    }
  }

  // ─── Sign Up ───
  function signup({ name, email, mobile, password }) {
    const users = getUsers();

    // Check if email already exists
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser = {
      userId: generateId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      password: hashPassword(password),
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true, message: 'Account created successfully.', user: newUser };
  }

  // ─── Login ───
  function login({ email, password, remember }) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return { success: false, message: 'Account not found' };
    }

    if (user.password !== hashPassword(password)) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Set session
    const session = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      loginStatus: true,
      loginTime: new Date().toISOString()
    };

    sessionStorage.setItem(KEYS.SESSION, JSON.stringify(session));

    // Remember me
    if (remember) {
      localStorage.setItem(KEYS.REMEMBER, JSON.stringify({ email: user.email }));
    } else {
      localStorage.removeItem(KEYS.REMEMBER);
    }

    return { success: true, message: 'Welcome back, ' + user.name + '.', user: session };
  }

  // ─── Google Sign In (Simulated) ───
  function googleSignIn() {
    const googleUser = {
      userId: generateId(),
      name: 'Luxury Guest',
      email: 'guest@gmail.com',
      mobile: '',
      role: 'user'
    };

    // Check if this simulated google user already exists
    const users = getUsers();
    let existing = users.find(u => u.email === googleUser.email);

    if (!existing) {
      const newUser = {
        ...googleUser,
        password: hashPassword('GoogleUser@' + Date.now()),
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      saveUsers(users);
      existing = newUser;
    }

    const session = {
      userId: existing.userId,
      name: existing.name,
      email: existing.email,
      role: existing.role,
      loginStatus: true,
      loginTime: new Date().toISOString()
    };

    sessionStorage.setItem(KEYS.SESSION, JSON.stringify(session));

    return { success: true, message: 'Signed in with Google successfully.', user: session };
  }

  // ─── Logout ───
  function logout() {
    sessionStorage.removeItem(KEYS.SESSION);
    window.location.href = 'index.html';
    return { success: true, message: 'You have been logged out.' };
  }

  // ─── Get Role-Based Redirect URL ───
  function getRedirectUrl(role) {
    return role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
  }

  // ─── Route Guard: Protect a page by required role ───
  function guardRoute(requiredRole) {
    // Authentication Bypass: always allow direct access to both dashboards without checks
    return true;
  }

  // ─── Get Current Session ───
  function getSession() {
    try {
      const data = sessionStorage.getItem(KEYS.SESSION);
      if (data) return JSON.parse(data);
    } catch {}

    // Authentication Bypass Fallback: return simulated sessions if not logged in
    const isAdminPage = window.location.pathname.includes('admin-dashboard');
    if (isAdminPage) {
      return {
        userId: 'usr_admin_001',
        name: 'VÉLORA Admin',
        email: 'admin@velorareserve.com',
        role: 'admin',
        loginStatus: true,
        loginTime: new Date().toISOString()
      };
    } else {
      return {
        userId: 'usr_guest_001',
        name: 'Luxury Guest',
        email: 'guest@velorareserve.com',
        role: 'user',
        loginStatus: true,
        loginTime: new Date().toISOString()
      };
    }
  }

  // ─── Is Logged In ───
  function isLoggedIn() {
    // Authentication Bypass: always return true so all login-sensitive UI controls are active
    return true;
  }

  // ─── Get Remembered Email ───
  function getRememberedEmail() {
    try {
      const data = localStorage.getItem(KEYS.REMEMBER);
      return data ? JSON.parse(data).email : '';
    } catch {
      return '';
    }
  }

  // ─── Check if email exists (for forgot password) ───
  function emailExists(email) {
    const users = getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  // ─── Reset Password ───
  function resetPassword(email, newPassword) {
    const users = getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (index === -1) {
      return { success: false, message: 'No account found with this email.' };
    }

    users[index].password = hashPassword(newPassword);
    saveUsers(users);

    return { success: true, message: 'Password has been reset successfully.' };
  }

  // ─── Validation Helpers ───
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateMobile(mobile) {
    return /^[\+]?[0-9\s\-]{8,15}$/.test(mobile.replace(/\s/g, ''));
  }

  function validatePassword(password) {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const passed = Object.values(checks).filter(Boolean).length;
    let strength = 'weak';
    if (passed >= 4) strength = 'strong';
    else if (passed >= 3) strength = 'medium';

    return { ...checks, strength, score: passed };
  }

  function getCurrentUser() {
    const session = getSession();
    if (!session) return null;
    const users = getUsers();
    const user = users.find(u => u.userId === session.userId);
    if (user) return user;

    // Fallback: return simulated user objects
    if (session.role === 'admin') {
      return {
        userId: 'usr_admin_001',
        name: 'VÉLORA Admin',
        email: 'admin@velorareserve.com',
        mobile: '+919840012345',
        role: 'admin',
        profilePhoto: '',
        dob: '1985-05-15',
        address: 'Adyar, Chennai, India'
      };
    } else {
      return {
        userId: 'usr_guest_001',
        name: 'Luxury Guest',
        email: 'guest@velorareserve.com',
        mobile: '+919840012345',
        role: 'user',
        profilePhoto: '',
        dob: '1995-10-10',
        address: 'Adyar, Chennai, India'
      };
    }
  }

  function updateCurrentUser(updatedFields) {
    const session = getSession();
    if (!session) return { success: false, message: 'No active session.' };
    const users = getUsers();
    const index = users.findIndex(u => u.userId === session.userId);
    if (index === -1) return { success: false, message: 'User account not found.' };

    if (updatedFields.email && updatedFields.email.toLowerCase() !== users[index].email.toLowerCase()) {
      const emailTaken = users.some((u, i) => i !== index && u.email.toLowerCase() === updatedFields.email.toLowerCase());
      if (emailTaken) {
        return { success: false, message: 'An account with this email address already exists.' };
      }
    }

    users[index] = { ...users[index], ...updatedFields };
    saveUsers(users);

    session.name = users[index].name;
    session.email = users[index].email;
    sessionStorage.setItem(KEYS.SESSION, JSON.stringify(session));

    document.dispatchEvent(new CustomEvent('velora-profile-updated', { detail: users[index] }));

    return { success: true, message: 'Profile updated successfully.', user: users[index] };
  }

  function changePassword(currentPassword, newPassword) {
    const session = getSession();
    if (!session) return { success: false, message: 'No active session.' };
    const users = getUsers();
    const index = users.findIndex(u => u.userId === session.userId);
    if (index === -1) return { success: false, message: 'User account not found.' };

    const user = users[index];
    if (user.password !== hashPassword(currentPassword)) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    users[index].password = hashPassword(newPassword);
    saveUsers(users);

    return { success: true, message: 'Password updated successfully.' };
  }

  // ─── Initialize ───
  ensureAdminExists();

  // ─── Public API ───
  return {
    signup,
    login,
    logout,
    googleSignIn,
    getSession,
    isLoggedIn,
    getRememberedEmail,
    emailExists,
    resetPassword,
    validateEmail,
    validateMobile,
    validatePassword,
    getRedirectUrl,
    guardRoute,
    getCurrentUser,
    updateCurrentUser,
    changePassword
  };
})();


/* ============================================================
   NAVBAR PROFILE DROPDOWN CONTROLLER
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // ─── Render Profile Dropdown ───
  function renderProfileDropdowns() {
    const profileWraps = document.querySelectorAll('.nav-profile-wrap');
    const mobileNavs = document.querySelectorAll('.mobile-nav');
    const session = VeloraAuth.getSession();
    const hasRealSession = sessionStorage.getItem('velora_session') !== null;

    // Desktop profile dropdowns
    profileWraps.forEach(wrap => {
      const btn = wrap.querySelector('.nav-profile-btn');
      const dropdown = wrap.querySelector('.nav-profile-dropdown');
      if (!btn || !dropdown) return;

      // Accessibility enhancement: Add ARIA roles/states
      btn.setAttribute('aria-haspopup', 'menu');
      btn.setAttribute('aria-expanded', 'false');

      if (hasRealSession) {
        btn.classList.add('logged-in');
        const currentUser = VeloraAuth.getCurrentUser();
        
        if (currentUser && currentUser.profilePhoto) {
          btn.innerHTML = `<img src="${currentUser.profilePhoto}" alt="${session.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
          btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        }

        const photoHtml = currentUser && currentUser.profilePhoto
          ? `<img src="${currentUser.profilePhoto}" class="nav-dropdown-avatar" alt="${session.name}">`
          : `<div class="nav-dropdown-avatar-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`;

        dropdown.innerHTML = `
          <div class="nav-dropdown-user" style="display: flex; align-items: center; gap: 12px; padding: 12px var(--space-md);">
            ${photoHtml}
            <div>
              <div class="nav-dropdown-name">${session.name}</div>
              <div class="nav-dropdown-email">${session.email}</div>
              ${session.role === 'admin' ? '<span class="nav-dropdown-role">Admin</span>' : ''}
            </div>
          </div>
          <div class="nav-dropdown-separator"></div>
          
          <a href="login.html" class="nav-dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Login / Signup
          </a>
          <a href="user-dashboard.html" class="nav-dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            User Dashboard
          </a>
          <a href="admin-dashboard.html" class="nav-dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Admin Dashboard
          </a>
          <a href="${session.role === 'admin' ? 'admin-dashboard.html#profile' : 'user-dashboard.html#profile'}" class="nav-dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Profile Settings
          </a>
          <div class="nav-dropdown-separator"></div>
          <button class="nav-dropdown-item danger" id="nav-logout-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        `;

        // Re-bind logout
        const logoutBtn = dropdown.querySelector('#nav-logout-btn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            VeloraAuth.logout();
          });
        }
      } else {
        btn.classList.remove('logged-in');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        dropdown.innerHTML = `
          <a href="login.html" class="nav-dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Login / Signup
          </a>
          <a href="user-dashboard.html" class="nav-dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            User Dashboard
          </a>
          <a href="admin-dashboard.html" class="nav-dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Admin Dashboard
          </a>
        `;
      }
    });

    mobileNavs.forEach(mobileNav => {
      let authSection = mobileNav.querySelector('.mobile-nav-auth');
      if (authSection) authSection.remove();

      authSection = document.createElement('div');
      authSection.className = 'mobile-nav-auth';

      const lockIcon = `<svg class="mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
      const userIcon = `<svg class="mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
      const settingsIcon = `<svg class="mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
      const logoutIcon = `<svg class="mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--error);"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;

      if (hasRealSession) {
        authSection.innerHTML = `
          <a href="login.html" class="mobile-nav-item" style="transition-delay: 0.6s;">${lockIcon}<span>Login / Signup</span></a>
          <a href="user-dashboard.html" class="mobile-nav-item" style="transition-delay: 0.65s;">${userIcon}<span>User Dashboard</span></a>
          <a href="admin-dashboard.html" class="mobile-nav-item" style="transition-delay: 0.7s;">${settingsIcon}<span>Admin Dashboard</span></a>
          <a href="#" onclick="event.preventDefault(); VeloraAuth.logout();" class="mobile-nav-item" style="transition-delay: 0.75s; color: var(--error);">${logoutIcon}<span>Logout</span></a>
        `;
      } else {
        authSection.innerHTML = `
          <a href="login.html" class="mobile-nav-item" style="transition-delay: 0.6s;">${lockIcon}<span>Login / Signup</span></a>
          <a href="user-dashboard.html" class="mobile-nav-item" style="transition-delay: 0.65s;">${userIcon}<span>User Dashboard</span></a>
          <a href="admin-dashboard.html" class="mobile-nav-item" style="transition-delay: 0.7s;">${settingsIcon}<span>Admin Dashboard</span></a>
        `;
      }

      mobileNav.appendChild(authSection);
    });
  }

  // ─── Toggle Desktop Dropdown ───
  document.addEventListener('click', (e) => {
    const profileBtn = e.target.closest('.nav-profile-btn');
    const profileWrap = e.target.closest('.nav-profile-wrap');

    if (profileBtn) {
      const dropdown = profileBtn.nextElementSibling;
      if (dropdown) {
        dropdown.classList.toggle('active');
        const isActive = dropdown.classList.contains('active');
        profileBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      }
      return;
    }

    // Close all dropdowns if clicking outside
    if (!profileWrap) {
      document.querySelectorAll('.nav-profile-dropdown.active').forEach(d => {
        d.classList.remove('active');
        const pBtn = d.previousElementSibling;
        if (pBtn && pBtn.classList.contains('nav-profile-btn')) {
          pBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });

  // Listen for real-time profile updates
  document.addEventListener('velora-profile-updated', () => {
    renderProfileDropdowns();
  });

  // ─── Initialize on load ───
  renderProfileDropdowns();
});


/* ============================================================
   LOGIN PAGE CONTROLLER
   ============================================================ */
function initLoginPage() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const rememberCheckbox = document.getElementById('login-remember');
  const alertBanner = document.getElementById('login-alert');
  const toggleBtn = document.getElementById('login-toggle-password');

  // Pre-fill remembered email
  const remembered = VeloraAuth.getRememberedEmail();
  if (remembered && emailInput) {
    emailInput.value = remembered;
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }

  // Password visibility toggle
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggleBtn.innerHTML = isPassword
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
  }

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert(alertBanner);

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const remember = rememberCheckbox ? rememberCheckbox.checked : false;

    // Validate
    if (!email || !password) {
      showAlert(alertBanner, 'Please fill in all fields.');
      return;
    }

    if (!VeloraAuth.validateEmail(email)) {
      showAlert(alertBanner, 'Please enter a valid email address.');
      return;
    }

    const result = VeloraAuth.login({ email, password, remember });

    if (result.success) {
      // Redirect based on role
      window.location.href = VeloraAuth.getRedirectUrl(result.user.role);
    } else {
      showAlert(alertBanner, result.message);
    }
  });

  // Google sign-in
  const googleBtn = document.getElementById('login-google-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      const result = VeloraAuth.googleSignIn();
      if (result.success) {
        window.location.href = VeloraAuth.getRedirectUrl(result.user.role);
      }
    });
  }
}


/* ============================================================
   SIGNUP PAGE CONTROLLER
   ============================================================ */
function initSignupPage() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const mobileInput = document.getElementById('signup-mobile');
  const passwordInput = document.getElementById('signup-password');
  const confirmInput = document.getElementById('signup-confirm');
  const alertBanner = document.getElementById('signup-alert');
  const togglePassword = document.getElementById('signup-toggle-password');
  const toggleConfirm = document.getElementById('signup-toggle-confirm');
  const strengthBars = document.querySelectorAll('.auth-strength-bar');
  const strengthText = document.querySelector('.auth-strength-text');

  // Password toggles
  [
    { btn: togglePassword, input: passwordInput },
    { btn: toggleConfirm, input: confirmInput }
  ].forEach(({ btn, input }) => {
    if (btn && input) {
      btn.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.innerHTML = isPassword
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
      });
    }
  });

  // Password strength indicator
  if (passwordInput && strengthBars.length) {
    passwordInput.addEventListener('input', () => {
      const result = VeloraAuth.validatePassword(passwordInput.value);
      strengthBars.forEach((bar, i) => {
        bar.className = 'auth-strength-bar';
        if (i < result.score - 1) bar.classList.add(result.strength);
      });
      if (strengthText) {
        if (passwordInput.value.length === 0) {
          strengthText.textContent = '';
        } else {
          strengthText.textContent = result.strength + ' password';
          strengthText.style.color = result.strength === 'strong'
            ? 'var(--success)'
            : result.strength === 'medium'
              ? '#FBBF24'
              : 'var(--error)';
        }
      }
    });
  }

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert(alertBanner);
    clearFieldErrors(form);

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const mobile = mobileInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    let hasError = false;

    if (!name) {
      showFieldError(nameInput, 'Full name is required.');
      hasError = true;
    }

    if (!email) {
      showFieldError(emailInput, 'Email is required.');
      hasError = true;
    } else if (!VeloraAuth.validateEmail(email)) {
      showFieldError(emailInput, 'Please enter a valid email address.');
      hasError = true;
    }

    if (!mobile) {
      showFieldError(mobileInput, 'Mobile number is required.');
      hasError = true;
    } else if (!VeloraAuth.validateMobile(mobile)) {
      showFieldError(mobileInput, 'Please enter a valid mobile number.');
      hasError = true;
    }

    if (!password) {
      showFieldError(passwordInput, 'Password is required.');
      hasError = true;
    } else if (password.length < 8) {
      showFieldError(passwordInput, 'Password must be at least 8 characters.');
      hasError = true;
    }

    if (!confirm) {
      showFieldError(confirmInput, 'Please confirm your password.');
      hasError = true;
    } else if (password !== confirm) {
      showFieldError(confirmInput, 'Passwords do not match.');
      hasError = true;
    }

    if (hasError) return;

    const result = VeloraAuth.signup({ name, email, mobile, password });

    if (result.success) {
      window.location.href = 'login.html?registered=1';
    } else {
      showAlert(alertBanner, result.message);
    }
  });

  // Google sign-in
  const googleBtn = document.getElementById('signup-google-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      const result = VeloraAuth.googleSignIn();
      if (result.success) {
        window.location.href = VeloraAuth.getRedirectUrl(result.user.role);
      }
    });
  }
}


/* ============================================================
   FORGOT PASSWORD PAGE CONTROLLER
   ============================================================ */
function initForgotPage() {
  const emailForm = document.getElementById('forgot-email-form');
  const resetForm = document.getElementById('forgot-reset-form');
  if (!emailForm) return;

  const step1 = document.getElementById('forgot-step-1');
  const step2 = document.getElementById('forgot-step-2');
  const step3 = document.getElementById('forgot-step-3');
  const alertBanner = document.getElementById('forgot-alert');
  let resetEmail = '';

  // Step 1: Verify email
  emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert(alertBanner);

    const emailInput = document.getElementById('forgot-email');
    const email = emailInput.value.trim();

    if (!email) {
      showAlert(alertBanner, 'Please enter your email address.');
      return;
    }

    if (!VeloraAuth.validateEmail(email)) {
      showAlert(alertBanner, 'Please enter a valid email address.');
      return;
    }

    const user = VeloraAuth.emailExists(email);
    if (!user) {
      showAlert(alertBanner, 'No account found with this email address.');
      return;
    }

    resetEmail = email;
    step1.classList.remove('active');
    step2.classList.add('active');
  });

  // Step 2: Reset password
  if (resetForm) {
    const toggleNew = document.getElementById('forgot-toggle-new');
    const toggleConfirm = document.getElementById('forgot-toggle-confirm');
    const newInput = document.getElementById('forgot-new-password');
    const confirmInput = document.getElementById('forgot-confirm-password');

    [
      { btn: toggleNew, input: newInput },
      { btn: toggleConfirm, input: confirmInput }
    ].forEach(({ btn, input }) => {
      if (btn && input) {
        btn.addEventListener('click', () => {
          const isPassword = input.type === 'password';
          input.type = isPassword ? 'text' : 'password';
          btn.innerHTML = isPassword
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
        });
      }
    });

    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearFieldErrors(resetForm);

      const newPassword = newInput.value;
      const confirmPassword = confirmInput.value;
      let hasError = false;

      if (!newPassword || newPassword.length < 8) {
        showFieldError(newInput, 'Password must be at least 8 characters.');
        hasError = true;
      }

      if (newPassword !== confirmPassword) {
        showFieldError(confirmInput, 'Passwords do not match.');
        hasError = true;
      }

      if (hasError) return;

      const result = VeloraAuth.resetPassword(resetEmail, newPassword);

      if (result.success) {
        step2.classList.remove('active');
        step3.classList.add('active');
      }
    });
  }
}


/* ============================================================
   SHARED FORM HELPERS
   ============================================================ */
function showAlert(banner, message) {
  if (!banner) return;
  const span = banner.querySelector('span');
  if (span) span.textContent = message;
  banner.classList.add('visible');
}

function hideAlert(banner) {
  if (!banner) return;
  banner.classList.remove('visible');
}

function showFieldError(input, message) {
  if (!input) return;
  input.classList.add('error');
  input.setAttribute('aria-invalid', 'true');
  const group = input.closest('.auth-form-group');
  if (group) {
    let errEl = group.querySelector('.auth-error-msg');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'auth-error-msg';
      // Generate ID for validation error element to link with input
      errEl.id = input.id ? (input.id + '-error') : ('err-' + Math.random().toString(36).substr(2, 9));
      group.appendChild(errEl);
    }
    errEl.textContent = message;
    errEl.classList.add('visible');
    input.setAttribute('aria-describedby', errEl.id);
  }
}

function clearFieldErrors(form) {
  if (!form) return;
  form.querySelectorAll('.auth-form-input').forEach(el => {
    el.classList.remove('error');
    el.removeAttribute('aria-invalid');
    el.removeAttribute('aria-describedby');
  });
  form.querySelectorAll('.auth-error-msg.visible').forEach(el => el.classList.remove('visible'));
}


/* ============================================================
   AUTO-INIT: Detect page and initialize controller
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initLoginPage();
  initSignupPage();
  initForgotPage();

  // Show success banner on login page after registration
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('registered') === '1') {
    const successBanner = document.getElementById('login-success');
    if (successBanner) successBanner.style.display = 'flex';
  }
});
