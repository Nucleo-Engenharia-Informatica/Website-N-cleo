// common.js — comportamento partilhado pelas páginas públicas
// (tema, menu, idioma, acessibilidade, fundo animado e rodapé)

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function getLang() {
  try { return localStorage.getItem('lang') || 'pt'; } catch { return 'pt'; }
}

const commonI18n = {
  pt: {
    'a11y.skip': 'Saltar para o conteúdo',
    'a11y.theme': 'Modo escuro',
    'a11y.lang': 'Idioma: Português. Mudar para inglês',
    'a11y.menu.open': 'Abrir menu',
    'a11y.menu.close': 'Fechar menu'
  },
  en: {
    'a11y.skip': 'Skip to content',
    'a11y.theme': 'Dark mode',
    'a11y.lang': 'Language: English. Switch to Portuguese',
    'a11y.menu.open': 'Open menu',
    'a11y.menu.close': 'Close menu'
  }
};

function ct(key) {
  return (commonI18n[getLang()] || commonI18n.pt)[key];
}

// Atualiza o que é comum a todas as páginas quando muda o idioma
export function applyCommonLang() {
  const lang = getLang();
  document.documentElement.lang = lang;

  const skip = document.querySelector('.skip-link');
  if (skip) skip.textContent = ct('a11y.skip');

  const theme = document.getElementById('theme-toggle');
  if (theme) theme.setAttribute('aria-label', ct('a11y.theme'));

  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.setAttribute('aria-label', ct('a11y.lang'));
    langBtn.querySelectorAll('[data-lang]').forEach(el => {
      el.classList.toggle('is-active', el.dataset.lang === lang);
    });
  }

  const menuBtn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (menuBtn && nav) {
    menuBtn.setAttribute('aria-label', ct(nav.classList.contains('open') ? 'a11y.menu.close' : 'a11y.menu.open'));
  }
}

// Botão PT/EN: guarda o idioma e chama onChange (cada página volta a desenhar o seu conteúdo)
export function initLangToggle(onChange) {
  const btn = document.getElementById('lang-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = getLang() === 'pt' ? 'en' : 'pt';
    try { localStorage.setItem('lang', next); } catch { /* sem localStorage */ }
    applyCommonLang();
    onChange?.();
  });
}

// Tema: o script inline no <body> já aplicou a classe (sem piscar); aqui só o botão.
// Sem escolha guardada, segue o tema do sistema.
export function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const sync = () => btn.setAttribute('aria-pressed', String(document.body.classList.contains('dark-mode')));
  sync();
  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch { /* sem localStorage */ }
    sync();
  });
}

// Menu móvel: aria-expanded, Escape fecha e devolve o foco ao botão
export function initMenu() {
  const btn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (!btn || !nav) return;
  if (!nav.id) nav.id = 'site-nav';
  btn.setAttribute('aria-controls', nav.id);

  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', ct(open ? 'a11y.menu.close' : 'a11y.menu.open'));
  };

  btn.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      btn.focus();
    }
  });
}

// Revela elementos ao fazer scroll. Começa ~150px antes de entrarem no ecrã e
// deixa de os observar depois de revelados.
export const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('reveal');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0, rootMargin: '0px 0px 150px 0px' });

export function observeReveal(root = document) {
  root.querySelectorAll('.reveal-on-scroll:not(.reveal)').forEach(el => revealObserver.observe(el));
}

// Fundo animado (rede de pontos). Com "reduzir movimento" desenha só um frame;
// pára quando o separador não está visível; menos pontos em ecrãs pequenos.
export function initBackground({ followMouse = false } = {}) {
  const c = document.getElementById('bg-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  let w, h;
  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    c.width = w * dpr; c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reducedMotion) draw();
  }

  const count = window.innerWidth <= 880 ? 40 : 90;
  const nodes = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    r: 3 + Math.random() * 2,
    hue: 180 + Math.random() * 180
  }));

  const mouse = { x: 0, y: 0, has: false };
  if (followMouse && !reducedMotion) {
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.has = true; });
    window.addEventListener('mouseleave', () => { mouse.has = false; });
  }

  const MAX_DIST = 140;
  const MAX_DIST2 = MAX_DIST * MAX_DIST;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const isDark = document.body.classList.contains('dark-mode');
    for (const n of nodes) {
      ctx.beginPath();
      ctx.fillStyle = isDark ? `hsla(${n.hue}, 90%, 65%, 0.95)` : `hsla(${n.hue}, 70%, 35%, 0.6)`;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < MAX_DIST2) {
          const alpha = 0.10 + (MAX_DIST - Math.sqrt(d2)) / MAX_DIST * 0.20;
          ctx.strokeStyle = isDark ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha * 0.5})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
  }

  function move() {
    for (const n of nodes) {
      if (mouse.has) {
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        if (dx * dx + dy * dy < 160 * 160) { n.vx += dx * 0.0002; n.vy += dy * 0.0002; }
        n.vx *= 0.996; n.vy *= 0.996;
      }
      n.x += n.vx; n.y += n.vy;
      if (n.x < -50 || n.x > w + 50) n.vx *= -1;
      if (n.y < -50 || n.y > h + 50) n.vy *= -1;
    }
  }

  window.addEventListener('resize', resize);
  resize();

  if (reducedMotion) {
    draw();
    // o tema pode mudar; volta a desenhar o frame estático
    document.getElementById('theme-toggle')?.addEventListener('click', draw);
    return;
  }

  let running = false;
  function step() {
    if (document.hidden) { running = false; return; }
    move();
    draw();
    requestAnimationFrame(step);
  }
  function start() { if (!running) { running = true; requestAnimationFrame(step); } }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  start();
}

// Ano atual no rodapé
export function initFooterYear() {
  document.querySelectorAll('.ano-atual').forEach(el => { el.textContent = new Date().getFullYear(); });
}
