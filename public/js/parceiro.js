import { parceiros } from './parceiros.js';

const i18n = {
  pt: {
    'nav.quem': 'Quem Somos',
    'nav.fazemos': 'O que Fazemos',
    'nav.sobre': 'Sobre o Curso',
    'nav.noticias': 'Notícias e Eventos',
    'nav.contactos': 'Contactos',
    'page.parceiros.hero': 'Parceiros e Colaboradores',
    'page.parceiros.title': 'Empresas Parceiras',
    'page.parceiros.subtitle': 'Colaborações que fortalecem a ligação entre a academia e o mercado de trabalho.',
    'page.parceiros.others': 'Outros Parceiros',
    'parceiro.meta': 'Parceiro',
    'parceiro.view': 'Ver Detalhes',
    'parceiro.active': 'Em parceria activa',
    'parceiro.back': 'Voltar aos contactos'
  },
  en: {
    'nav.quem': 'Who We Are',
    'nav.fazemos': 'What We Do',
    'nav.sobre': 'About the Course',
    'nav.noticias': 'News & Events',
    'nav.contactos': 'Contact',
    'page.parceiros.hero': 'Partners and Collaborators',
    'page.parceiros.title': 'Partner Companies',
    'page.parceiros.subtitle': 'Collaborations that strengthen the connection between academia and the job market.',
    'page.parceiros.others': 'Other Partners',
    'parceiro.meta': 'Partner',
    'parceiro.view': 'View Details',
    'parceiro.active': 'Active partnership',
    'parceiro.back': 'Back to contacts'
  }
};
function getLang() { return localStorage.getItem('lang') || 'pt'; }
function t(k) { const lang = getLang(); return (i18n[lang] && i18n[lang][k]) || (i18n.pt[k] || k); }
function applyLangToDom() { document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.getAttribute('data-i18n'); const v = t(k); if (v) el.textContent = v; }); }
function initLangToggle() { const btn = document.getElementById('lang-toggle'); if (!btn) return; btn.addEventListener('click', () => { const next = getLang() === 'pt' ? 'en' : 'pt'; localStorage.setItem('lang', next); applyLangToDom(); location.reload(); }); }

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
menuToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// Dark Mode Toggle
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}
initThemeToggle();

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

function sortByName(list) { return [...list].sort((a, b) => a.name.localeCompare(b.name)); }

function renderLista(list, selectedId) {
  const root = document.getElementById('parceiros-lista');
  root.innerHTML = '';
  sortByName(list.filter(p => p.id !== selectedId)).forEach(p => {
    const card = document.createElement('article');
    card.className = 'news-card reveal-on-scroll';
    const img = document.createElement('img'); img.className = 'news-cover'; img.src = p.cover; img.alt = p.name; img.loading = 'lazy';
    const body = document.createElement('div'); body.className = 'news-body';
    const h3 = document.createElement('h3'); h3.className = 'news-title'; h3.textContent = p.name;
    const meta = document.createElement('div'); meta.className = 'news-meta'; meta.textContent = t('parceiro.meta');
    const desc = document.createElement('p'); desc.textContent = (localStorage.getItem('lang') === 'en' ? (p.desc_en || p.desc) : p.desc);
    const actions = document.createElement('div'); actions.className = 'news-actions';
    const btn = document.createElement('a'); btn.href = `?id=${p.id}`; btn.className = 'btn small'; btn.textContent = t('parceiro.view');
    actions.appendChild(btn);
    body.appendChild(h3); body.appendChild(meta); body.appendChild(desc); body.appendChild(actions);
    card.appendChild(img); card.appendChild(body);

    // Make the whole card clickable
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on the button itself
      if (e.target.tagName === 'A' || e.target.closest('a')) return;
      btn.click();
    });

    root.appendChild(card);
    observer.observe(card);
  });
}

function renderDetalhe(p) {
  const root = document.getElementById('parceiro-detalhe');
  root.innerHTML = '';
  if (!p) { return; }
  const wrap = document.createElement('div'); wrap.className = 'card';
  const img = document.createElement('img'); img.className = 'news-cover'; img.src = p.cover; img.alt = p.name; img.loading = 'lazy';
  const body = document.createElement('div'); body.className = 'news-body';
  const h2 = document.createElement('h2'); h2.className = 'section-title'; h2.textContent = p.name;
  const meta = document.createElement('div'); meta.className = 'news-meta'; meta.textContent = t('parceiro.active');
  const desc = document.createElement('p'); desc.textContent = (localStorage.getItem('lang') === 'en' ? (p.desc_en || p.desc) : p.desc);
  const actions = document.createElement('div'); actions.className = 'news-actions';
  const back = document.createElement('a'); back.href = './index.html#contactos'; back.className = 'btn small'; back.textContent = t('parceiro.back');
  actions.appendChild(back);
  body.appendChild(h2); body.appendChild(meta); body.appendChild(desc); body.appendChild(actions);
  wrap.appendChild(img); wrap.appendChild(body);
  root.appendChild(wrap);

  // Click outside to go back
  setTimeout(() => {
    const clickOutsideHandler = (e) => {
      if (!wrap.contains(e.target)) {
        back.click();
      }
    };
    document.addEventListener('click', clickOutsideHandler);
    // Store handler to remove later if needed
    wrap._clickOutsideHandler = clickOutsideHandler;
  }, 100);
}

function getIdFromQuery() { return new URLSearchParams(window.location.search).get('id'); }

function init() {
  const id = getIdFromQuery();
  const p = parceiros.find(x => x.id === id);
  renderDetalhe(p);
  renderLista(parceiros, id);
  applyLangToDom(); initLangToggle();
}

init();

function initBackground() {
  const c = document.getElementById('bg-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  let w, h;
  function resize() { w = window.innerWidth; h = window.innerHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  resize();
  window.addEventListener('resize', resize);
  const nodes = Array.from({ length: 90 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    r: 3 + Math.random() * 2,
    hue: 180 + Math.random() * 180
  }));
  function step() {
    ctx.clearRect(0, 0, w, h);
    const isDark = document.body.classList.contains('dark-mode');
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < -50 || n.x > w + 50) n.vx *= -1;
      if (n.y < -50 || n.y > h + 50) n.vy *= -1;
      ctx.beginPath();
      if (isDark) {
        ctx.fillStyle = `hsla(${n.hue}, 90%, 65%, 0.95)`;
      } else {
        ctx.fillStyle = `hsla(${n.hue}, 70%, 35%, 0.6)`;
      }
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y; const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          const alpha = 0.10 + (140 - dist) / 140 * 0.20;
          if (isDark) {
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          } else {
            ctx.strokeStyle = `rgba(0,0,0,${alpha * 0.5})`;
          }
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  step();
}

initBackground();
