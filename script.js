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
    '.single-post .post-cta',
    '.single-post .chapter-announce'
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
      const isFigure = entry.target.tagName === 'FIGURE';
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        if (!isFigure) obs.unobserve(entry.target); // Text bleibt sichtbar
      } else if (isFigure) {
        entry.target.classList.remove('is-visible'); // Bilder faden auch wieder aus
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

// Fly-Card: Textbox fliegt rein, sobald das Bild im Viewport ist
function initFlyCards() {
  const cards = document.querySelectorAll('[data-fly-card]');
  if (cards.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    cards.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  cards.forEach(el => io.observe(el));
}

// YouTube-Embeds: Video erst laden, wenn das jeweilige Deck weggeklickt wird
function initYouTubeDeck() {
  const frames = document.querySelectorAll('.yt-embed-frame');
  if (frames.length === 0) return;

  frames.forEach((frame) => {
    const deck = frame.querySelector('.yt-deck');
    if (!deck) return;

    const videoId = frame.getAttribute('data-yt-id');

    function reveal() {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('title', 'YouTube-Video');
      frame.appendChild(iframe);

      deck.classList.add('is-hidden');
      setTimeout(() => deck.remove(), 400);
    }

    deck.addEventListener('click', reveal);
    deck.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        reveal();
      }
    });
  });
}

// Pop-up: Fallbeispiel-Modal
function initCaseModal() {
  const overlay = document.getElementById('caseModalOverlay');
  const closeBtn = document.getElementById('caseModalClose');
  const triggers = document.querySelectorAll('[data-case-open]');
  if (!overlay || triggers.length === 0) return;

  let lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    // Reflow erzwingen, damit die Transition greift
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { overlay.hidden = true; }, 250);
    if (lastFocused) lastFocused.focus();
  }

  triggers.forEach((btn) => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closeModal();
  });
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

// Echte Kante-zu-Kante-Breite: per JS gemessen statt per CSS-Formel berechnet
// (umgeht Scrollbar-Breite- und verschachtelte-Container-Probleme zuverlässig)
function initViewportBleed() {
  const els = document.querySelectorAll('.bleed-viewport');
  if (els.length === 0) return;

  function apply() {
    const viewportWidth = document.documentElement.clientWidth;
    els.forEach((el) => {
      el.style.marginLeft = '';
      el.style.marginRight = '';
      el.style.width = '';
      const rect = el.getBoundingClientRect();
      const leftGap = rect.left;
      const rightGap = viewportWidth - rect.right;
      el.style.marginLeft = `${-leftGap}px`;
      el.style.marginRight = `${-rightGap}px`;
      el.style.width = `${viewportWidth}px`;
    });
  }

  apply();
  window.addEventListener('resize', apply);
}

// Hero-Sequenz: Bild -> Titel (h\u00e4lt) -> beim Scrollen: Label allein -> Lead -> Weiss
function initHero() {
  const wrapper = document.getElementById('heroWrapper');
  if (!wrapper) return;

  const panels = wrapper.querySelectorAll('[data-hero-panel]');
  const white = document.getElementById('heroWhite');
  const scrollHint = document.getElementById('heroScrollHint');
  if (panels.length === 0) return;

  // Zeitfenster pro Panel: [start, end] jeweils fuer Einblenden und Ausblenden.
  // Grosszuegige Luecken dazwischen, damit sich nie zwei Panels gleichzeitig
  // ueberlappen koennen.
  const schedule = {
    title: { in: [-0.02, -0.001], out: [0.14, 0.22] },
    label: { in: [0.3, 0.38], out: [0.5, 0.58] },
    lead:  { in: [0.66, 0.76], out: [0.98, 1.0] }
  };

  function opacityFor(name, progress) {
    const s = schedule[name];
    if (!s) return 0;
    const fadeIn = mapRange(progress, s.in[0], s.in[1], 0, 1);
    const fadeOut = mapRange(progress, s.out[0], s.out[1], 0, 1);
    return fadeIn * (1 - fadeOut);
  }

  function render(progress) {
    panels.forEach((panel) => {
      const name = panel.getAttribute('data-hero-panel');
      panel.style.opacity = opacityFor(name, progress);
    });
    if (white) white.style.opacity = mapRange(progress, 0.88, 1, 0, 1);
    if (scrollHint) scrollHint.style.opacity = progress <= 0.02 ? 1 : 0;
  }

  function currentProgress() {
    const rect = wrapper.getBoundingClientRect();
    const scrollable = wrapper.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.max(0, Math.min(1, -rect.top / scrollable));
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      render(currentProgress());
      ticking = false;
    });
  }

  render(currentProgress()); // sofort initialisieren, nicht erst beim ersten Scroll
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

// Scroll-Scrubbing Line Chart Race: Linien zeichnen sich synchron zum Scrollen
function initScrubChart() {
  const wrapper = document.getElementById('scrubChartWrapper');
  const svg = document.getElementById('scrubSvg');
  const legendEl = document.getElementById('scrubLegend');
  const yearEl = document.getElementById('scrubYear');
  const dataScript = document.getElementById('scrubData');
  if (!wrapper || !svg || !legendEl || !yearEl || !dataScript) return;

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

  const svgNS = 'http://www.w3.org/2000/svg';
  const W = 900, H = 420;
  const marginLeft = 45, marginRight = 15, marginTop = 15, marginBottom = 35;
  const plotW = W - marginLeft - marginRight;
  const plotH = H - marginTop - marginBottom;

  const maxVal = Math.max(...names.map((name) => Math.max(...data.map((d) => d[name]))));

  function xForIndex(i) {
    return marginLeft + (i / (n - 1)) * plotW;
  }
  function yForValue(v) {
    return marginTop + plotH - (v / maxVal) * plotH;
  }

  // X-Achse (Jahre) + Y-Achsen-Grundlinie
  const axis = document.createElementNS(svgNS, 'g');
  axis.setAttribute('class', 'scrub-axis');

  const baseline = document.createElementNS(svgNS, 'line');
  baseline.setAttribute('x1', marginLeft);
  baseline.setAttribute('x2', W - marginRight);
  baseline.setAttribute('y1', marginTop + plotH);
  baseline.setAttribute('y2', marginTop + plotH);
  baseline.setAttribute('class', 'scrub-axis-line');
  axis.appendChild(baseline);

  [years[0], years[Math.round((n - 1) / 2)], years[n - 1]].forEach((yr) => {
    const idx = years.indexOf(yr);
    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', xForIndex(idx));
    label.setAttribute('y', H - 10);
    label.setAttribute('class', 'scrub-axis-label');
    label.setAttribute('text-anchor', idx === 0 ? 'start' : idx === n - 1 ? 'end' : 'middle');
    label.textContent = yr;
    axis.appendChild(label);
  });

  svg.appendChild(axis);

  // Playhead (vertikale Linie an der aktuellen Scroll-Position)
  const playhead = document.createElementNS(svgNS, 'line');
  playhead.setAttribute('y1', marginTop);
  playhead.setAttribute('y2', marginTop + plotH);
  playhead.setAttribute('class', 'scrub-playhead');
  svg.appendChild(playhead);

  // Linien + Endpunkte pro Kategorie
  const lines = {};
  names.forEach((name) => {
    const path = document.createElementNS(svgNS, 'path');
    let d = '';
    for (let i = 0; i < n; i++) {
      const x = xForIndex(i);
      const y = yForValue(data[i][name]);
      d += (i === 0 ? 'M' : 'L') + x + ',' + y + ' ';
    }
    path.setAttribute('d', d.trim());
    path.setAttribute('class', 'scrub-line');
    path.style.stroke = colors[name] || '#999';
    svg.appendChild(path);

    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;

    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('r', 4.5);
    dot.setAttribute('class', 'scrub-dot');
    dot.style.fill = colors[name] || '#999';
    dot.style.opacity = 0;
    svg.appendChild(dot);

    lines[name] = { path, len, dot };
  });

  // Legende (aktuelle Werte, live aktualisiert)
  const legendRows = {};
  names.forEach((name) => {
    const row = document.createElement('div');
    row.className = 'scrub-legend-row';

    const swatch = document.createElement('span');
    swatch.className = 'scrub-legend-swatch';
    swatch.style.background = colors[name] || '#999';

    const label = document.createElement('span');
    label.className = 'scrub-legend-label';
    label.textContent = name;

    const value = document.createElement('span');
    value.className = 'scrub-legend-value';

    row.appendChild(swatch);
    row.appendChild(label);
    row.appendChild(value);
    legendEl.appendChild(row);

    legendRows[name] = { row, value };
  });

  function interpolate(progress) {
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
    return { year, values, pos };
  }

  function render(progress) {
    const { year, values, pos } = interpolate(progress);
    yearEl.textContent = year;

    const px = marginLeft + (pos / (n - 1)) * plotW;
    playhead.setAttribute('x1', px);
    playhead.setAttribute('x2', px);

    // Kategorien nach aktuellem Wert sortieren, damit die Legende mitwandert
    const sorted = [...names].sort((a, b) => values[b] - values[a]);

    sorted.forEach((name) => {
      const { path, len, dot } = lines[name];
      path.style.strokeDashoffset = len * (1 - progress);

      const py = yForValue(values[name]);
      dot.setAttribute('cx', px);
      dot.setAttribute('cy', py);
      dot.style.opacity = progress > 0.01 ? 1 : 0;

      const lr = legendRows[name];
      lr.value.textContent = Math.round(values[name]).toLocaleString('de-CH') + ' TWh';
      legendEl.appendChild(lr.row); // DOM-Reihenfolge = Rangfolge
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
  initViewportBleed();
  initScrollFade();
  initCountUp();
  initScrollProgress();
  initHero();
  initScrubChart();
  initScenes();
  initCaseModal();
  initYouTubeDeck();
  initFlyCards();
});
