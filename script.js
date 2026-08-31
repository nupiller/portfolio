// Consolidated scripts for root site

// Set current year in footer if element exists
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

// Lazy‑load background images declared via data-bg
function initLazyBg() {
  const els = document.querySelectorAll('.bg-lazy');
  if (!('IntersectionObserver' in window) || els.length === 0) {
    // Fallback: load all immediately
    els.forEach(el => {
      const bg = el.getAttribute('data-bg');
      if (bg) el.style.backgroundImage = `url('${bg}')`;
    });
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const bg = el.getAttribute('data-bg');
        if (bg) {
          el.style.backgroundImage = `url('${bg}')`;
          el.removeAttribute('data-bg');
        }
        obs.unobserve(el);
      }
    });
  }, { rootMargin: '200px 0px' });

  els.forEach(el => io.observe(el));
}

// Mobile navigation toggle (if present)
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
  });
}

// Fade-in Elemente beim Scrollen (Scrollytelling-Effekt)
function initScrollFade() {
  const selector = [
    '.single-post p',
    '.single-post h2',
    '.single-post h3',
    '.single-post blockquote',
    '.single-post figure',
    '.single-post .post-media',
    '.single-post .post-summary',
    '.single-post .post-books',
    '.single-post .post-sources',
    '.single-post .post-cta'
  ].join(',');

  const els = document.querySelectorAll(selector);
  if (els.length === 0) return;

  els.forEach(el => {
    if (el.closest('.lead-visual')) return; // Lead bleibt unverändert
    el.classList.add('fade-in');
  });

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.fade-in').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
}

// Zahlen beim Scrollen hochzählen
function initCountUp() {
  const els = document.querySelectorAll('.count-up');
  if (els.length === 0) return;

  const animate = (el) => {
    const target = parseFloat(el.getAttribute('data-target'));
    const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out
      const value = target * eased;
      el.textContent = value.toFixed(decimals);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toFixed(decimals);
      }
    }
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    els.forEach(animate);
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  els.forEach(el => io.observe(el));
}

// Lesefortschritts-Balken oben auf der Seite
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setYear();
  initLazyBg();
  initNavToggle();
  initScrollFade();
  initCountUp();
  initScrollProgress();
});
