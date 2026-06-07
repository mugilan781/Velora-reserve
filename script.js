/* ============================================================
   VÉLORA RESERVE — Luxury Cinematic Resort JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---- Preloader ----
  initPreloader();
  // ---- Scroll Progress Line ----
  initScrollProgress();
  // ---- Custom Cursor ----
  initCursor();
  // ---- Navigation ----
  initNavigation();
  // ---- Scroll Reveal ----
  initScrollReveal();
  // ---- Parallax ----
  initParallax();
  // ---- Hero ----
  initHero();
  // ---- Testimonial Carousel ----
  initCarousel();
  // ---- Gallery & Lightbox ----
  initGallery();
  // ---- Booking Form ----
  initBookingForm();
  // ---- Accordion ----
  initAccordion();
  // ---- Counter Animation ----
  initCounters();
  // ---- Smooth Anchor Links ----
  initSmoothScroll();
  // ---- Contact Form ----
  initContactForm();
  // ---- Review Form ----
  initReviewForm();
  // ---- Floating Booking Panel ----
  initFloatingBookingPanel();
  // ---- Custom Content Expansions ----
  initCustomExpansions();
});

/* ============================================================
   PRELOADER
   ============================================================ */
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  if (!preloader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 1400);
  });

  // Fallback - hide preloader after 4 seconds even if images haven't loaded
  setTimeout(() => {
    if (!preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }, 4000);
}

/* ============================================================
   SCROLL PROGRESS LINE
   ============================================================ */
function initScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  document.body.appendChild(progressBar);

  function updateProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = scrollPercent + '%';
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateProgress);
  }, { passive: true });

  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
}

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  if (window.innerWidth <= 1024) return;

  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  // Smooth ring follow - refined with ultra-creamy follow lag physics
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Tactile press & click effects
  document.addEventListener('mousedown', () => {
    dot.classList.add('clicking');
    ring.classList.add('clicking');
  });

  document.addEventListener('mouseup', () => {
    dot.classList.remove('clicking');
    ring.classList.remove('clicking');
  });

  // Enlarge ring on interactive elements
  const interactives = document.querySelectorAll('a, button, .card, .gallery-item, .destination-card, .suite-select-card, input, textarea, select');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('active'));
  });

  // Hide on mouse leave window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '0.5';
  });
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (!nav) return;

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // Hamburger toggle
  if (hamburger && mobileNav) {
    // Check if links are already rendered to avoid duplicate appends
    const existingLogo = mobileNav.querySelector('.mobile-nav-logo');
    const existingItems = mobileNav.querySelectorAll('.mobile-nav-item');

    if (!existingLogo || existingItems.length === 0) {
      mobileNav.innerHTML = '';

      // 1. Add premium centered brand logo at the top
      const mobileLogo = document.createElement('div');
      mobileLogo.className = 'mobile-nav-logo';
      mobileLogo.innerHTML = `
        <a href="index.html" class="mobile-brand-logo">
          <svg class="brand-logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2L14.85 8.15L21.6 9.15L16.7 13.93L17.85 20.65L12 17.5L6.15 20.65L7.3 13.93L2.4 9.15L9.15 8.15L12 2Z" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="4" />
          </svg>
          <span class="brand-text-velora">VÉLORA</span><span class="brand-text-reserve">RESERVE</span>
        </a>
      `;
      mobileNav.appendChild(mobileLogo);

      // 2. Build the 10 core pages direct flat navigation list with champagne gold vector SVG icons
      const mobileLinks = [
        { text: 'Home', href: 'index.html', icon: '<svg class="mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
        { text: 'About', href: 'about.html', icon: '<svg class="mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' },
        { text: 'Experiences', href: 'experiences.html', icon: '<svg class="mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
        { text: 'Suites', href: 'suites.html', icon: '<svg class="mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 17h18M3 12h18M3 7h18M21 21v-4M3 21v-4"/></svg>' },
        { text: 'Destinations', href: 'destinations.html', icon: '<svg class="mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' },
        { text: 'Sunsets', href: 'sunsets.html', icon: '<svg class="mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>' },
        { text: 'Weddings', href: 'wedding.html', icon: '<svg class="mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' },
        { text: 'Gallery', href: 'gallery.html', icon: '<svg class="mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' },
        { text: 'Reviews', href: 'reviews.html', icon: '<svg class="mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
        { text: 'Contact', href: 'contact.html', icon: '<svg class="mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' }
      ];

      mobileLinks.forEach((linkData, index) => {
        const link = document.createElement('a');
        link.href = linkData.href;
        link.style.transitionDelay = `${0.05 * (index + 1)}s`;
        link.className = 'mobile-nav-item';
        link.innerHTML = `${linkData.icon}<span>${linkData.text}</span>`;
        mobileNav.appendChild(link);
      });
    }

    // Set initial ARIA state for the hamburger button
    hamburger.setAttribute('role', 'button');
    hamburger.setAttribute('tabindex', '0');
    if (!hamburger.hasAttribute('aria-label')) {
      hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    }
    if (!hamburger.hasAttribute('aria-expanded')) {
      hamburger.setAttribute('aria-expanded', 'false');
    }

    // Keydown event listener for Enter/Space on hamburger button
    hamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hamburger.click();
      }
    });

    // Close mobile nav on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('active');
        if (nav) {
          nav.classList.remove('mobile-menu-open');
        }
        document.body.style.overflow = '';
        hamburger.focus(); // return focus to hamburger
      }
    });

    // Toggle menu active status
    hamburger.addEventListener('click', () => {
      const isActive = hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      mobileNav.classList.toggle('active');
      if (nav) {
        nav.classList.toggle('mobile-menu-open', mobileNav.classList.contains('active'));
      }
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close on link click
    mobileNav.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('active');
        if (nav) {
          nav.classList.remove('mobile-menu-open');
        }
        document.body.style.overflow = '';
      }
    });
  }

  // Active page highlight
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const suiteSubPages = ['suites.html', 'destinations.html', 'sunsets.html', 'wedding.html'];

  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Highlight parent link in desktop nav if any of its sub-pages are active
  if (suiteSubPages.includes(currentPage)) {
    const parentToggle = document.querySelector('.nav-dropdown-toggle');
    if (parentToggle) {
      parentToggle.classList.add('active');
    }
  }

  // Suites dropdown desktop hover delay and tablet touch support
  const dropdownWrapper = document.querySelector('.nav-dropdown-wrapper');
  const dropdownToggle = document.querySelector('.nav-dropdown-toggle');

  if (dropdownWrapper && dropdownToggle) {
    let dropdownTimeout = null;

    // Desktop hover delay handlers (150ms - 250ms close delay)
    dropdownWrapper.addEventListener('mouseenter', () => {
      if (window.innerWidth > 1024) {
        if (dropdownTimeout) {
          clearTimeout(dropdownTimeout);
          dropdownTimeout = null;
        }
        dropdownWrapper.classList.add('hovered');
      }
    });

    dropdownWrapper.addEventListener('mouseleave', () => {
      if (window.innerWidth > 1024) {
        dropdownTimeout = setTimeout(() => {
          dropdownWrapper.classList.remove('hovered');
        }, 200); // 200ms close delay
      }
    });

    dropdownToggle.addEventListener('click', (e) => {
      // On tablet or touch capable screen widths <= 1024px
      if (window.innerWidth <= 1024) {
        if (!dropdownWrapper.classList.contains('active')) {
          e.preventDefault();
          dropdownWrapper.classList.add('active');
        }
      }
    });

    // Collapse dropdown menu if user clicks/taps outside
    document.addEventListener('click', (e) => {
      if (!dropdownWrapper.contains(e.target)) {
        dropdownWrapper.classList.remove('active');
      }
    });
  }

  // Handle viewport changes: close mobile menu when crossing to desktop breakpoint
  const mediaQuery = window.matchMedia('(max-width: 1024px)');
  function handleBreakpointChange(e) {
    if (!e.matches) {
      if (mobileNav && mobileNav.classList.contains('active')) {
        if (hamburger) hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        if (nav) {
          nav.classList.remove('mobile-menu-open');
        }
        document.body.style.overflow = '';
      }
    }
  }
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleBreakpointChange);
  } else {
    mediaQuery.addListener(handleBreakpointChange);
  }
}

/* ============================================================
   SCROLL REVEAL (Intersection Observer)
   ============================================================ */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (reveals.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Don't unobserve - allows re-reveal if desired
        // observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ============================================================
   PARALLAX
   ============================================================ */
function initParallax() {
  const parallaxElements = document.querySelectorAll('.parallax-bg');
  if (parallaxElements.length === 0) return;

  function updateParallax() {
    const scrollY = window.pageYOffset;
    parallaxElements.forEach(el => {
      const section = el.closest('.parallax-section') || el.closest('.hero');
      if (!section) return;

      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Only apply parallax when section is in view
      if (scrollY + viewportHeight > sectionTop && scrollY < sectionTop + sectionHeight) {
        const progress = (scrollY - sectionTop + viewportHeight) / (sectionHeight + viewportHeight);
        const translateY = (progress - 0.5) * 80; // -40px to +40px
        el.style.transform = `translateY(${translateY}px)`;
      }
    });
  }

  window.addEventListener('scroll', () => requestAnimationFrame(updateParallax));
  updateParallax();
}

/* ============================================================
   HERO
   ============================================================ */
function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Mark as loaded for CSS animation trigger
  setTimeout(() => hero.classList.add('loaded'), 100);

  // Subtle mouse-follow parallax on hero content
  const heroContent = hero.querySelector('.hero-content');
  if (heroContent && window.innerWidth > 1024) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      heroContent.style.transform = `translate(${x * 10}px, ${y * 8}px)`;
    });
  }
}

/* ============================================================
   TESTIMONIAL CAROUSEL
   ============================================================ */
function initCarousel() {
  const carousels = document.querySelectorAll('.testimonial-carousel');
  carousels.forEach(carousel => {
    const track = carousel.querySelector('.testimonial-track');
    const slides = carousel.querySelectorAll('.testimonial-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const prevBtn = carousel.querySelector('.carousel-arrow.prev');
    const nextBtn = carousel.querySelector('.carousel-arrow.next');

    if (!track || slides.length === 0) return;

    let current = 0;
    const total = slides.length;

    function goToSlide(index) {
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      current = index;

      track.style.transform = `translateX(-${current * 100}%)`;

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }

    // Dot clicks
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goToSlide(i));
    });

    // Arrow clicks
    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(current + 1));

    // Auto-play
    let autoplay = setInterval(() => goToSlide(current + 1), 5000);

    carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
    carousel.addEventListener('mouseleave', () => {
      autoplay = setInterval(() => goToSlide(current + 1), 5000);
    });

    // Touch swipe
    let startX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
    });

    track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goToSlide(current + 1) : goToSlide(current - 1);
      }
    });
  });
}

/* ============================================================
   GALLERY & LIGHTBOX
   ============================================================ */
function initGallery() {
  // Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = '';
          setTimeout(() => item.style.opacity = '1', 50);
        } else {
          item.style.opacity = '0';
          setTimeout(() => item.style.display = 'none', 300);
        }
      });
    });
  });

  // Lightbox
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox-image');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxPrev = lightbox.querySelector('.lightbox-prev');
  const lightboxNext = lightbox.querySelector('.lightbox-next');
  const lightboxCounter = lightbox.querySelector('.lightbox-counter');

  let lightboxImages = [];
  let lightboxIndex = 0;

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      lightboxImages = Array.from(document.querySelectorAll('.gallery-item:not([style*="display: none"]) img'));
      lightboxIndex = lightboxImages.indexOf(item.querySelector('img'));
      if (lightboxIndex === -1) lightboxIndex = 0;
      openLightbox();
    });
  });

  function openLightbox() {
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateLightbox();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    if (lightboxImages[lightboxIndex]) {
      lightboxImg.src = lightboxImages[lightboxIndex].src;
      lightboxImg.alt = lightboxImages[lightboxIndex].alt || '';
    }
    if (lightboxCounter) {
      lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
    }
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    updateLightbox();
  });
  if (lightboxNext) lightboxNext.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    updateLightbox();
  });

  // Close on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
    if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
  });
}

/* ============================================================
   BOOKING FORM (Multi-Step)
   ============================================================ */
function initBookingForm() {
  const form = document.querySelector('.booking-form');
  if (!form) return;

  const steps = form.querySelectorAll('.step-panel');
  const stepIndicators = document.querySelectorAll('.booking-step');
  const nextBtns = form.querySelectorAll('.btn-next');
  const prevBtns = form.querySelectorAll('.btn-prev');

  let currentStep = 0;
  let isTransitioning = false;

  // Pricing elements
  const checkinInput = form.querySelector('[name="checkin"]');
  const checkoutInput = form.querySelector('[name="checkout"]');
  const durationRow = document.querySelector('.pricing-duration');
  const resortFeeRow = document.querySelector('.pricing-resort-fee');
  const taxesRow = document.querySelector('.pricing-taxes');
  const totalRow = document.querySelector('.pricing-grand-total');

  function updatePricingSummary() {
    // 1. Get selected suite price
    const selectedSuite = document.querySelector('.suite-selection-list .suite-select-card.selected');
    let suitePrice = 199999; // default
    if (selectedSuite) {
      const priceText = selectedSuite.querySelector('.suite-select-price').textContent;
      const parsedPrice = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsedPrice)) suitePrice = parsedPrice;
    }

    // 2. Calculate nights
    let nights = 0;
    if (checkinInput && checkoutInput && checkinInput.value && checkoutInput.value) {
      const checkinDate = new Date(checkinInput.value);
      const checkoutDate = new Date(checkoutInput.value);
      if (checkoutDate > checkinDate) {
        nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
      }
    }

    // 3. Calculate enhancements (packages in Step 3)
    let enhancementsTotal = 0;
    const activePackages = document.querySelectorAll('.package-checkbox:checked');
    activePackages.forEach(checkbox => {
      const val = parseInt(checkbox.value, 10);
      if (!isNaN(val)) enhancementsTotal += val;
    });

    // 4. Calculate total & update DOM elements
    if (nights > 0) {
      const resortFee = nights * 12500;
      const baseSuiteCost = suitePrice * nights;
      const subtotal = baseSuiteCost + resortFee + enhancementsTotal;
      const tax = Math.round(subtotal * 0.12);
      const grandTotal = subtotal + tax;

      if (durationRow) durationRow.textContent = `${nights} night${nights > 1 ? 's' : ''}`;
      if (resortFeeRow) resortFeeRow.textContent = `₹${resortFee.toLocaleString('en-IN')}`;
      if (taxesRow) taxesRow.textContent = `₹${tax.toLocaleString('en-IN')}`;
      if (totalRow) {
        totalRow.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
        totalRow.style.color = 'var(--gold)';
      }
    } else {
      if (durationRow) durationRow.textContent = '— nights';
      if (resortFeeRow) resortFeeRow.textContent = '₹12,500 / night';
      if (taxesRow) taxesRow.textContent = '12%';
      if (totalRow) {
        totalRow.textContent = 'Select dates';
        totalRow.style.color = '';
      }
    }
  }

  // Trigger pricing update on date entries
  if (checkinInput) checkinInput.addEventListener('change', updatePricingSummary);
  if (checkoutInput) checkoutInput.addEventListener('change', updatePricingSummary);

  // ─── Pre-fill fields from URL query parameters ───
  const urlParams = new URLSearchParams(window.location.search);
  const paramDest = urlParams.get('destination');
  const paramGuests = urlParams.get('guests');

  if (paramDest) {
    const destSelect = form.querySelector('[name="destination"]');
    if (destSelect) {
      for (let i = 0; i < destSelect.options.length; i++) {
        if (destSelect.options[i].value.toLowerCase() === paramDest.toLowerCase() || 
            destSelect.options[i].text.toLowerCase().includes(paramDest.toLowerCase())) {
          destSelect.selectedIndex = i;
          break;
        }
      }
    }
  }

  if (paramGuests) {
    const adultsSelect = form.querySelector('#adults');
    if (adultsSelect) {
      const guestsNum = parseInt(paramGuests, 10);
      if (!isNaN(guestsNum) && guestsNum >= 1 && guestsNum <= 4) {
        adultsSelect.value = String(guestsNum);
      } else if (guestsNum > 4) {
        adultsSelect.value = "4";
      }
    }
  }

  // ─── Pre-fill guest details from session if logged in ───
  const session = (typeof VeloraAuth !== 'undefined') ? VeloraAuth.getSession() : null;
  if (session) {
    const fnameInput = form.querySelector('#fname');
    const lnameInput = form.querySelector('#lname');
    const emailInput = form.querySelector('#b-email');
    const phoneInput = form.querySelector('#b-phone');

    if (fnameInput && !fnameInput.value) {
      const nameParts = session.name.trim().split(' ');
      fnameInput.value = nameParts[0] || '';
      if (lnameInput) {
        lnameInput.value = nameParts.slice(1).join(' ') || '';
      }
    }
    if (emailInput && !emailInput.value) {
      emailInput.value = session.email || '';
    }
    if (phoneInput && !phoneInput.value && session.mobile) {
      phoneInput.value = session.mobile || '';
    }
  }

  // Update pricing summary initially
  updatePricingSummary();

  // ─── Form Validation Helpers ───
  function showInputError(input, message) {
    if (!input) return;
    input.style.borderColor = 'var(--error)';
    const group = input.closest('.form-group');
    if (group) {
      let errMsg = group.querySelector('.field-error-msg');
      if (!errMsg) {
        errMsg = document.createElement('div');
        errMsg.className = 'field-error-msg';
        errMsg.style.color = 'var(--error)';
        errMsg.style.fontSize = 'var(--text-xs)';
        errMsg.style.marginTop = '4px';
        errMsg.style.fontFamily = 'var(--font-ui)';
        group.appendChild(errMsg);
      }
      errMsg.textContent = message;
    }
  }

  function clearErrors() {
    form.querySelectorAll('.form-input, select').forEach(el => {
      el.style.borderColor = '';
      const group = el.closest('.form-group');
      if (group) {
        const errMsg = group.querySelector('.field-error-msg');
        if (errMsg) errMsg.remove();
      }
    });
  }

  function validateStep1() {
    clearErrors();
    let isValid = true;
    const destSelect = form.querySelector('[name="destination"]');
    const checkin = form.querySelector('[name="checkin"]');
    const checkout = form.querySelector('[name="checkout"]');

    if (destSelect && !destSelect.value) {
      showInputError(destSelect, 'Sanctuary destination is required');
      isValid = false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkin) {
      if (!checkin.value) {
        showInputError(checkin, 'Check-in date is required');
        isValid = false;
      } else {
        const checkinDate = new Date(checkin.value);
        checkinDate.setHours(0, 0, 0, 0);
        if (checkinDate < today) {
          showInputError(checkin, 'Check-in date cannot be in the past');
          isValid = false;
        }
      }
    }

    if (checkout) {
      if (!checkout.value) {
        showInputError(checkout, 'Check-out date is required');
        isValid = false;
      } else if (checkin && checkin.value) {
        const checkinDate = new Date(checkin.value);
        const checkoutDate = new Date(checkout.value);
        checkinDate.setHours(0, 0, 0, 0);
        checkoutDate.setHours(0, 0, 0, 0);
        if (checkoutDate <= checkinDate) {
          showInputError(checkout, 'Check-out date must be after check-in date');
          isValid = false;
        }
      }
    }

    return isValid;
  }

  function validateStep2() {
    const selectedSuite = document.querySelector('.suite-selection-list .suite-select-card.selected');
    if (!selectedSuite) {
      showLuxuryToast('Please select a suite sanctuary to continue.');
      return false;
    }
    return true;
  }

  function validateStep3() {
    let isValid = true;
    const fname = form.querySelector('#fname');
    const lname = form.querySelector('#lname');
    const email = form.querySelector('#b-email');
    const phone = form.querySelector('#b-phone');

    [fname, lname, email, phone].forEach(el => {
      if (el) {
        el.style.borderColor = '';
        const group = el.closest('.form-group');
        if (group) {
          const errMsg = group.querySelector('.field-error-msg');
          if (errMsg) errMsg.remove();
        }
      }
    });

    if (fname && !fname.value.trim()) {
      showInputError(fname, 'First name is required');
      isValid = false;
    }
    if (lname && !lname.value.trim()) {
      showInputError(lname, 'Last name is required');
      isValid = false;
    }
    if (email) {
      const val = email.value.trim();
      if (!val) {
        showInputError(email, 'Email address is required');
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        showInputError(email, 'Please enter a valid email address');
        isValid = false;
      }
    }
    if (phone && phone.value.trim() && phone.value.trim().length < 6) {
      showInputError(phone, 'Please enter a valid phone number');
      isValid = false;
    }

    return isValid;
  }

  function showStep(index) {
    if (isTransitioning) return;

    const currentPanel = steps[currentStep];
    const nextPanel = steps[index];

    if (currentStep !== index && currentPanel) {
      isTransitioning = true;

      // Add fade-out animation to current active panel
      currentPanel.classList.add('fade-out');
      currentPanel.classList.remove('active');

      // Update progress indicators immediately for immediate feedback
      stepIndicators.forEach((indicator, i) => {
        indicator.classList.remove('active', 'completed');
        if (i === index) indicator.classList.add('active');
        if (i < index) indicator.classList.add('completed');
      });

      // Swap step panels after the exit transition completes
      setTimeout(() => {
        currentPanel.classList.remove('fade-out');
        nextPanel.classList.add('active');
        currentStep = index;
        isTransitioning = false;
        updatePricingSummary();

        // Accessibility focus shift: Focus the heading of the new panel
        const heading = nextPanel.querySelector('h3, h2');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
      }, 350);
    } else {
      steps.forEach((step, i) => {
        step.classList.toggle('active', i === index);
      });
      stepIndicators.forEach((indicator, i) => {
        indicator.classList.remove('active', 'completed');
        if (i === index) indicator.classList.add('active');
        if (i < index) indicator.classList.add('completed');
      });
      currentStep = index;
      updatePricingSummary();
    }
  }

  nextBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Step-specific validation before proceeding
      if (currentStep === 0) {
        if (!validateStep1()) {
          showLuxuryToast('Please resolve the highlighted validation errors.');
          return;
        }
      } else if (currentStep === 1) {
        if (!validateStep2()) {
          return;
        }
      }

      if (currentStep < steps.length - 1 && !isTransitioning) {
        showStep(currentStep + 1);
        window.scrollTo({ top: form.offsetTop - 120, behavior: 'smooth' });
      }
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStep > 0 && !isTransitioning) {
        showStep(currentStep - 1);
        window.scrollTo({ top: form.offsetTop - 120, behavior: 'smooth' });
      }
    });
  });

  // Suite selection cards
  const suiteCards = document.querySelectorAll('.suite-selection-list .suite-select-card');
  suiteCards.forEach(card => {
    card.addEventListener('click', () => {
      suiteCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      // Update pricing summary if present
      const pricingName = document.querySelector('.pricing-suite-name');
      const pricingPrice = document.querySelector('.pricing-suite-price');
      if (pricingName) pricingName.textContent = card.querySelector('.suite-select-name').textContent;
      if (pricingPrice) pricingPrice.textContent = card.querySelector('.suite-select-price').textContent;

      updatePricingSummary();
    });
  });

  // Package selection checkboxes (Step 3)
  const packageCheckboxes = document.querySelectorAll('.package-checkbox');
  packageCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const card = checkbox.closest('.suite-select-card');
      if (card) {
        card.classList.toggle('selected', checkbox.checked);
      }
      updatePricingSummary();
    });
  });

  // Confirm booking
  const confirmBtn = form.querySelector('.btn-confirm');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isTransitioning) return;

      if (!validateStep3()) {
        showLuxuryToast('Please resolve the highlighted validation errors.');
        return;
      }

      // ─── Gather all booking data ───
      const destination = form.querySelector('[name="destination"]')?.value || '';
      const checkin = form.querySelector('[name="checkin"]')?.value || '';
      const checkout = form.querySelector('[name="checkout"]')?.value || '';
      const adults = form.querySelector('#adults')?.value || '2';
      const children = form.querySelector('#children')?.value || '0';
      const fname = form.querySelector('#fname')?.value?.trim() || '';
      const lname = form.querySelector('#lname')?.value?.trim() || '';
      const email = form.querySelector('#b-email')?.value?.trim() || '';
      const phone = form.querySelector('#b-phone')?.value?.trim() || '';
      const requests = form.querySelector('#b-requests')?.value?.trim() || '';

      // Selected suite
      const selectedSuite = document.querySelector('.suite-selection-list .suite-select-card.selected');
      const suiteName = selectedSuite ? selectedSuite.querySelector('.suite-select-name').textContent : 'Ocean Villa';
      let suitePrice = 199999;
      if (selectedSuite) {
        const pp = parseInt(selectedSuite.querySelector('.suite-select-price').textContent.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(pp)) suitePrice = pp;
      }

      // Calculate nights and total
      let nights = 0;
      if (checkin && checkout) {
        const diff = new Date(checkout) - new Date(checkin);
        if (diff > 0) nights = Math.ceil(diff / 86400000);
      }
      let enhancementsTotal = 0;
      document.querySelectorAll('.package-checkbox:checked').forEach(cb => {
        const v = parseInt(cb.value, 10);
        if (!isNaN(v)) enhancementsTotal += v;
      });
      const resortFee = nights * 12500;
      const baseCost = suitePrice * nights;
      const subtotal = baseCost + resortFee + enhancementsTotal;
      const tax = Math.round(subtotal * 0.12);
      const grandTotal = subtotal + tax;

      // Enhancements list
      const enhancements = [];
      document.querySelectorAll('.package-checkbox:checked').forEach(cb => {
        const card = cb.closest('.package-card');
        if (card) {
          const title = card.querySelector('.package-card-title');
          if (title) enhancements.push(title.textContent);
        }
      });

      // ─── Generate Booking ID: VEL-2026-XXXX ───
      const year = new Date().getFullYear();
      const allBookings = JSON.parse(localStorage.getItem('velora_all_bookings') || '[]');
      const yearBookings = allBookings.filter(b => b.bookingId && b.bookingId.includes('VEL-' + year));
      const nextNum = yearBookings.length + 1;
      const bookingId = 'VEL-' + year + '-' + String(nextNum).padStart(4, '0');

      // ─── Generate Tracking ID: TRK-VEL-XXXX ───
      const trackingId = 'TRK-VEL-' + String(allBookings.length + 1).padStart(4, '0');

      // ─── Build booking object ───
      const booking = {
        bookingId: bookingId,
        trackingId: trackingId,
        user: {
          name: fname && lname ? fname + ' ' + lname : (session ? session.name : 'Guest'),
          email: email || (session ? session.email : ''),
          phone: phone,
          userId: session ? session.userId : null
        },
        package: {
          suite: suiteName,
          destination: destination,
          enhancements: enhancements
        },
        checkin: checkin,
        checkout: checkout,
        nights: nights,
        guests: { adults: parseInt(adults), children: parseInt(children) },
        amount: {
          suiteRate: suitePrice,
          baseCost: baseCost,
          resortFee: resortFee,
          enhancements: enhancementsTotal,
          tax: tax,
          total: grandTotal
        },
        status: 'pending',
        trackingStep: 0, // initial stage (Booking Submitted)
        specialRequests: requests,
        createdAt: new Date().toISOString()
      };

      // ─── Store globally (admin + cross-user) ───
      allBookings.push(booking);
      localStorage.setItem('velora_all_bookings', JSON.stringify(allBookings));

      // ─── Store user-scoped (for user dashboard) ───
      if (session) {
        const userKey = 'velora_bookings_' + session.userId;
        const userBookings = JSON.parse(localStorage.getItem(userKey) || '[]');
        userBookings.push({
          id: bookingId,
          trackingId: trackingId,
          property: suiteName + ' — ' + destination,
          checkIn: checkin,
          checkOut: checkout,
          guests: parseInt(adults) + parseInt(children),
          status: 'pending',
          trackingStep: 0,
          total: '₹' + grandTotal.toLocaleString('en-IN')
        });
        localStorage.setItem(userKey, JSON.stringify(userBookings));

        // ─── Add Activity to User Dashboard ───
        const activityKey = 'velora_activity_' + session.userId;
        const activityList = JSON.parse(localStorage.getItem(activityKey) || '[]');
        activityList.unshift({
          title: 'Booking Created',
          desc: 'Created booking reference ' + bookingId + ' for ' + suiteName + ' — ' + destination + '.',
          time: new Date().toISOString()
        });
        localStorage.setItem(activityKey, JSON.stringify(activityList));

        // ─── Add Notification to User Dashboard ───
        const notifKey = 'velora_notifications_' + session.userId;
        const notifList = JSON.parse(localStorage.getItem(notifKey) || '[]');
        notifList.unshift({
          id: 'notif_' + Math.random().toString(36).substr(2, 9),
          title: 'Booking Reference ' + bookingId + ' Created',
          desc: 'Your reservation at ' + suiteName + ' is pending admin approval.',
          icon: 'calendar',
          read: false,
          time: new Date().toISOString()
        });
        localStorage.setItem(notifKey, JSON.stringify(notifList));
      }

      // ─── Show success toast ───
      showLuxuryToast('✦ Booking ' + bookingId + ' created successfully.');

      // ─── Show confirmation step ───
      showStep(steps.length - 1);

      // Update confirmation ID and Tracking ID display
      const confirmIdEl = document.querySelector('.booking-id');
      if (confirmIdEl) confirmIdEl.textContent = bookingId;

      const confirmTrkEl = document.querySelector('.tracking-id');
      if (confirmTrkEl) confirmTrkEl.textContent = trackingId;
    });
  }

}

/* ============================================================
   ACCORDION
   ============================================================ */
function initAccordion() {
  const items = document.querySelectorAll('.accordion-item');
  items.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const body = item.querySelector('.accordion-body');
    if (!header || !body) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all others in the same accordion group
      const parent = item.closest('.accordion');
      if (parent) {
        parent.querySelectorAll('.accordion-item.active').forEach(openItem => {
          if (openItem !== item) {
            openItem.classList.remove('active');
            openItem.querySelector('.accordion-body').style.maxHeight = '0';
          }
        });
      }

      item.classList.toggle('active');
      body.style.maxHeight = isOpen ? '0' : body.scrollHeight + 'px';
    });
  });
}

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    el.textContent = prefix + current.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.nav')?.offsetHeight || 80;
        const targetTop = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Basic validation
    const inputs = form.querySelectorAll('.form-input[required]');
    let valid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        valid = false;
        input.style.borderColor = 'var(--error)';
        input.setAttribute('aria-invalid', 'true');
        input.addEventListener('input', () => {
          input.style.borderColor = '';
          input.removeAttribute('aria-invalid');
        }, { once: true });
      }
    });

    // Email validation
    const emailInput = form.querySelector('[type="email"]');
    if (emailInput && emailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
      valid = false;
      emailInput.style.borderColor = 'var(--error)';
      emailInput.setAttribute('aria-invalid', 'true');
      emailInput.addEventListener('input', () => {
        emailInput.style.borderColor = '';
        emailInput.removeAttribute('aria-invalid');
      }, { once: true });
    }

    if (valid) {
      // Store in localStorage
      const formData = {
        id: Date.now(),
        name: form.querySelector('[name="name"]')?.value || '',
        email: form.querySelector('[name="email"]')?.value || '',
        subject: form.querySelector('[name="subject"]')?.value || '',
        message: form.querySelector('[name="message"]')?.value || '',
        date: new Date().toISOString()
      };

      let messages = JSON.parse(localStorage.getItem('velora_messages') || '[]');
      messages.push(formData);
      localStorage.setItem('velora_messages', JSON.stringify(messages));

      // Show luxury feedback message matching reviews sequence
      const successMsg = document.createElement('div');
      successMsg.className = 'review-form-success';
      successMsg.innerHTML = `
        <div class="review-form-success-icon">✦</div>
        <h3 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--gold);">Message Received</h3>
        <p style="color: var(--gray); font-family: var(--font-heading); font-size: 1.1rem; font-style: italic; max-width: 450px; margin: 0 auto; line-height: 1.6;">
          Your inquiry has been successfully delivered. Our Private Concierge team is reviewing your request and will connect with you shortly.
        </p>
      `;
      form.innerHTML = '';
      form.appendChild(successMsg);
    }
  });
}

/* ============================================================
   FLOATING BOOKING PANEL
   ============================================================ */
function initFloatingBookingPanel() {
  const panel = document.getElementById('floating-booking-panel');
  if (!panel) return;

  const footer = document.querySelector('.footer');
  if (footer) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          panel.classList.add('footer-hidden');
        } else {
          panel.classList.remove('footer-hidden');
        }
      });
    }, {
      root: null,
      threshold: 0
    });
    observer.observe(footer);
  }

  window.addEventListener('scroll', throttle(() => {
    const scrollY = window.pageYOffset;
    if (scrollY > 400) {
      panel.classList.add('visible');
    } else {
      panel.classList.remove('visible');
    }
  }, 100));
}

/* ============================================================
   REVIEW FORM
   ============================================================ */
function initReviewForm() {
  const form = document.querySelector('.review-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Basic validation
    const inputs = form.querySelectorAll('.form-input[required]');
    let valid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        valid = false;
        input.style.borderColor = 'var(--error)';
        input.setAttribute('aria-invalid', 'true');
        input.addEventListener('input', () => {
          input.style.borderColor = '';
          input.removeAttribute('aria-invalid');
        }, { once: true });
      }
    });

    // Email validation
    const emailInput = form.querySelector('[type="email"]');
    if (emailInput && emailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
      valid = false;
      emailInput.style.borderColor = 'var(--error)';
      emailInput.setAttribute('aria-invalid', 'true');
      emailInput.addEventListener('input', () => {
        emailInput.style.borderColor = '';
        emailInput.removeAttribute('aria-invalid');
      }, { once: true });
    }

    if (valid) {
      // Store in localStorage
      const reviewData = {
        id: Date.now(),
        name: form.querySelector('#r-name')?.value || '',
        email: form.querySelector('#r-email')?.value || '',
        destination: form.querySelector('#r-dest')?.value || '',
        review: form.querySelector('#r-review')?.value || '',
        date: new Date().toISOString()
      };

      let reviews = JSON.parse(localStorage.getItem('velora_reviews') || '[]');
      reviews.push(reviewData);
      localStorage.setItem('velora_reviews', JSON.stringify(reviews));

      // Show luxury feedback message
      const successMsg = document.createElement('div');
      successMsg.className = 'review-form-success';
      successMsg.innerHTML = `
        <div class="review-form-success-icon">✦</div>
        <h3 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--gold);">Story Shared</h3>
        <p style="color: var(--gray); font-family: var(--font-heading); font-size: 1.1rem; font-style: italic; max-width: 450px; margin: 0 auto; line-height: 1.6;">
          Thank you for letting us be part of your memory. Your reflections have been received by our guest relations team.
        </p>
      `;
      form.innerHTML = '';
      form.appendChild(successMsg);
    }
  });
}

/* ============================================================
   UTILITY: Throttle
   ============================================================ */
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/* ============================================================
   CUSTOM CONTENT EXPANSIONS (Prompt 3 Additions)
   ============================================================ */
function initCustomExpansions() {
  // 1. Package Selection Cards (booking.html)
  const packageCards = document.querySelectorAll('.package-selection-card');
  if (packageCards.length > 0) {
    packageCards.forEach(card => {
      card.addEventListener('click', () => {
        // Toggle selected on clicked card and remove from siblings
        packageCards.forEach(c => {
          if (c !== card) c.classList.remove('selected');
        });
        const isSelected = card.classList.toggle('selected');

        // Sync with corresponding checkboxes in the booking form if they exist
        const honeymoonCheckbox = document.querySelector('input[name="package_honeymoon"]');
        const proposalCheckbox = document.querySelector('input[name="package_proposal"]');

        if (card.id === 'package-honeymoon' && honeymoonCheckbox) {
          honeymoonCheckbox.checked = isSelected;
          // Trigger change event to update pricing summary
          honeymoonCheckbox.dispatchEvent(new Event('change'));
          // Visually toggle parent selected class in step 3 checklist
          const parentCard = honeymoonCheckbox.closest('.suite-select-card');
          if (parentCard) parentCard.classList.toggle('selected', isSelected);
        } else if (card.id === 'package-signature' && proposalCheckbox) {
          // Sync "Ultimate Reserve" with "Sanctuary Proposal" or toggle it
          proposalCheckbox.checked = isSelected;
          proposalCheckbox.dispatchEvent(new Event('change'));
          const parentCard = proposalCheckbox.closest('.suite-select-card');
          if (parentCard) parentCard.classList.toggle('selected', isSelected);
        }

        // Show a premium glass Toast Notification
        showLuxuryToast(
          isSelected 
            ? `✦ Sanctuary Package Selected: ${card.querySelector('h3').textContent}` 
            : `✦ Package Deselected`
        );
      });
    });
  }

  // 2. VIP WhatsApp Assistance Trigger (contact.html)
  const whatsappBtns = document.querySelectorAll('.whatsapp-support-btn');
  whatsappBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      showLuxuryConfirmation(
        "Initiating Secure Curation Chat",
        "You are connecting to VÉLORA RESERVE's Private Concierge via secure WhatsApp. A dedicated Butler Alchemist will synchronize your timeline immediately.",
        "Connect Chat",
        () => {
          window.open('https://wa.me/919500088888?text=Welcome%20to%20V%C3%89LORA%20RESERVE.%20I%20wish%20to%20request%20private%20sanctuary%20curation.', '_blank');
        }
      );
    });
  });

  // 3. Secured Emergency Line Dial (contact.html)
  const emergencyBtns = document.querySelectorAll('.emergency-line-btn');
  emergencyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      showLuxuryConfirmation(
        "✦ Secured Emergency Hotline ✦",
        "This line coordinates directly with VÉLORA Sanctuary Security, private medical evacuation, and diplomatic aviation command. Press proceed to dial.",
        "Proceed to Dial",
        () => {
          window.location.href = 'tel:+919500088888';
        }
      );
    });
  });
}

// Helper: Custom Premium Luxury Toast Notification
function showLuxuryToast(message) {
  let toast = document.querySelector('.luxury-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'luxury-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span style="color: var(--gold); margin-inline-end: 8px;">✦</span> ${message}`;
  toast.classList.add('visible');
  
  // Clear previous timeout if any
  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
  }, 3500);
}

// Helper: Custom Premium Luxury Modal Dialog
function showLuxuryConfirmation(title, description, confirmText, onConfirm) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'luxury-modal-overlay';
  
  // Create dialog content
  const dialog = document.createElement('div');
  dialog.className = 'luxury-modal-dialog';
  dialog.innerHTML = `
    <div style="font-size: 2rem; color: var(--gold); margin-bottom: 0.5rem; animation: float 3s ease-in-out infinite;">✦</div>
    <h3 style="font-family: var(--font-display); font-size: var(--text-xl); color: var(--ivory); margin-bottom: 1rem; letter-spacing: 0.05em; text-transform: uppercase;">${title}</h3>
    <p style="font-size: var(--text-sm); color: var(--gray); line-height: 1.8; margin-bottom: 2rem; max-width: 400px; margin-inline: auto;">${description}</p>
    <div style="display: flex; gap: var(--space-md); justify-content: center; width: 100%;">
      <button class="btn btn-outline btn-sm cancel-btn" style="flex: 1;">Cancel</button>
      <button class="btn btn-gold btn-sm confirm-btn" style="flex: 1.5;">${confirmText}</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Fade in
  setTimeout(() => {
    overlay.classList.add('visible');
  }, 10);
  
  // Close helper
  const close = () => {
    overlay.classList.remove('visible');
    setTimeout(() => {
      overlay.remove();
    }, 400);
  };
  
  dialog.querySelector('.cancel-btn').addEventListener('click', close);
  dialog.querySelector('.confirm-btn').addEventListener('click', () => {
    onConfirm();
    close();
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
}
