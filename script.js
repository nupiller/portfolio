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

// Hilfsfunktion: Wert von einem Bereich in einen anderen mappen, geklemmt
function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  const t = (value - inMin) / (inMax - inMin);
  const clamped = Math.max(0, Math.min(1, t));
  return outMin + clamped * (outMax - outMin);
}

// Szenen-System: Bild -> abdunkeln + Text einblenden -> zu Weiss ausblenden
function initScenes() {
  const scenes = document.querySelectorAll('[data-scene]');
  if (scenes.length === 0) return;

  const items = Array.from(scenes).map((wrapper) => {
    return {
      wrapper,
      darkOverlay: wrapper.querySelector('.scene-overlay'),
      whiteOverlay: wrapper.querySelector('.scene-overlay-white'),
      text: wrapper.querySelector('.scene-text'),
      credit: wrapper.querySelector('.scene-credit')
    };
  });

  function render() {
    items.forEach(({ wrapper, darkOverlay, whiteOverlay, text, credit }) => {
      const rect = wrapper.getBoundingClientRect();
      const wrapperHeight = wrapper.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollable = wrapperHeight - viewportHeight;
      if (scrollable <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollable));

      const darkOpacity = mapRange(progress, 0.15, 0.35, 0, 0.55);
      const textOpacity = mapRange(progress, 0.2, 0.4, 0, 1) * (1 - mapRange(progress, 0.65, 0.82, 0, 1));
      const whiteOpacity = mapRange(progress, 0.65, 0.9, 0, 1);

      if (darkOverlay) darkOverlay.style.opacity = darkOpacity;
      if (whiteOverlay) whiteOverlay.style.opacity = whiteOpacity;
      if (text) text.style.opacity = textOpacity;
      if (credit) credit.style.opacity = textOpacity;
    });
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      render();
      ticking = false;
    });
  }

  render();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

// Scroll-Scrubbing Chart Race: Balken reagieren live auf die Scroll-Position
function initScrubChart() {
  const wrapper = document.getElementById('scrubChartWrapper');
  const bars = document.getElementById('scrubBars');
  const yearEl = document.getElementById('scrubYear');
  const dataScript = document.getElementById('scrubData');
  if (!wrapper || !bars || !yearEl || !dataScript) return;

  let payload;
  try {
    payload = JSON.parse(dataScript.textContent);
  } catch (e) {
    console.error('Scrub-Chart: Daten konnten nicht gelesen werden', e);
    return;
  }

  const years = payload.years;
  const names = payload.names;
  const data = payload.data;
  const n = years.length;

  const colors = {
    'Kohle': '#3a3a3a',
    'Erdoel': '#b23a2f',
    'Gas': '#e08a2b',
    'Kernkraft': '#7a5ba6',
    'Wasserkraft': '#2c6fa8',
    'Wind': '#3fa796',
    'Solar': '#e0b02b',
    'Biotreibstoffe': '#5a8f4f',
    'Andere Erneuerbare': '#9dbf8f'
  };

  // Baue die Balken-Elemente einmalig
  const rows = {};
  names.forEach((name) => {
    const row = document.createElement('div');
    row.className = 'scrub-bar-row';

    const label = document.createElement('div');
    label.className = 'scrub-bar-label';
    label.textContent = name;

    const track = document.createElement('div');
    track.className = 'scrub-bar-track';

    const fill = document.createElement('div');
    fill.className = 'scrub-bar-fill';
    fill.style.background = colors[name] || '#999';
    track.appendChild(fill);

    const value = document.createElement('div');
    value.className = 'scrub-bar-value';

    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(value);
    bars.appendChild(row);

    rows[name] = { row, fill, value };
  });

  const ROW_GAP = 8; // Abstand zwischen den Balken in px
  function getRowHeight() {
    const firstRow = rows[names[0]].row;
    return firstRow.offsetHeight + ROW_GAP;
  }

  function interpolate(progress) {
    // progress: 0..1 über den gesamten Datensatz
    const pos = progress * (n - 1);
    const i0 = Math.floor(pos);
    const i1 = Math.min(i0 + 1, n - 1);
    const frac = pos - i0;

    const year = Math.round(years[i0] + (years[i1] - years[i0]) * frac);
    const values = {};
    names.forEach((name) => {
      const v0 = data[i0][name];
      const v1 = data[i1][name];
      values[name] = v0 + (v1 - v0) * frac;
    });
    return { year, values };
  }

  function render(progress) {
    const { year, values } = interpolate(progress);
    yearEl.textContent = year;

    const maxVal = Math.max(...names.map((name) => values[name]), 1);
    const sorted = [...names].sort((a, b) => values[b] - values[a]);
    const rowHeight = getRowHeight();

    sorted.forEach((name, rank) => {
      const r = rows[name];
      const pct = (values[name] / maxVal) * 100;
      r.fill.style.width = pct + '%';
      r.value.textContent = Math.round(values[name]).toLocaleString('de-CH') + ' TWh';
      r.row.style.transform = `translateY(${rank * rowHeight}px)`;
    });
  }

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = wrapper.getBoundingClientRect();
      const wrapperHeight = wrapper.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollable = wrapperHeight - viewportHeight;

      // Wie weit sind wir in den Wrapper reingescrollt (0 = Start, 1 = Ende)
      const scrolled = -rect.top;
      let progress = scrollable > 0 ? scrolled / scrollable : 0;
      progress = Math.max(0, Math.min(1, progress));

      render(progress);
      ticking = false;
    });
  }

  render(0);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setYear();
  initLazyBg();
  initNavToggle();
  initScrollFade();
  initCountUp();
  initScrollProgress();
  initScrubChart();
  initScenes();
});
