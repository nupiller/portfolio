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

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setYear();
  initLazyBg();
  initNavToggle();
});
