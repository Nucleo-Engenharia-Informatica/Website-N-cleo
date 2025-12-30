const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');

function toggleMenu() {
  const open = siteNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}
menuToggle.addEventListener('click', toggleMenu);
navLinks.forEach(a => a.addEventListener('click', () => siteNav.classList.remove('open')));

// Dark Mode Toggle
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  // Default to dark mode
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
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('reveal');
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

import { events } from './events.js';

const i18n = {
  pt: {
    'nav.quem': 'Quem Somos',
    'nav.fazemos': 'O que Fazemos',
    'nav.sobre': 'Sobre o Curso',
    'nav.noticias': 'Notícias e Eventos',
    'nav.contactos': 'Contactos',
    'hero.title': 'Núcleo de Engenharia Informática da Universidade Fernando Pessoa',
    'section.fazemos.title': 'O que Fazemos',
    'section.fazemos.sub': 'Workshops práticos, hackathons desafiantes, talks inspiradoras e convívios que fortalecem a nossa comunidade.',
    'features.workshops.title': 'Workshops Práticos',
    'features.workshops.desc': 'Sessões hands-on com as tecnologias mais procuradas pelo mercado.',
    'features.hackathons.title': 'Hackathons',
    'features.hackathons.desc': 'Desafios intensivos para desenvolver soluções inovadoras em equipa.',
    'features.talks.title': 'Tech Talks',
    'features.talks.desc': 'Oradores convidados da indústria partilham experiências e conhecimento.',
    'features.comunidade.title': 'Comunidade Activa',
    'features.comunidade.desc': 'Networking, eventos sociais e ligação ao ecossistema tecnológico.',
    'section.sobre.title': 'Sobre Engenharia Informática',
    'section.sobre.text': 'A Engenharia Informática é a área que concebe, desenvolve e mantém os sistemas tecnológicos que transformam o mundo. Na UFP, o curso destaca-se pela forte componente prática, projectos reais com empresas parceiras e preparação sólida para os desafios do mercado.\n\nCom uma taxa de empregabilidade de 95%, os nossos diplomados integram-se rapidamente em carreiras estimulantes nas áreas de Data Science, Cloud Computing, DevOps, Cibersegurança, Inteligência Artificial e muito mais.',
    'section.sobre.link': 'Saber Mais Sobre o Curso',
    'stats.empregabilidade': 'Taxa de Empregabilidade',
    'stats.parceiros': 'Empresas Parceiras',
    'section.noticias.title': 'Notícias e Eventos',
    'section.noticias.sub': 'Mantém-te actualizado com as últimas novidades e próximos eventos.',
    'filter.all': 'Todos',
    'filter.past': 'Anteriores',
    'help.title': 'Apoio à Comunidade Tecnológica',
    'help.desc': 'Precisa de ajuda ou orientação na área da informática? Fale connosco e ajudamos a encontrar a solução ideal.',
    'help.submit': 'Enviar Pedido',
    'help.sent': 'Pedido Enviado com Sucesso',
    'section.contactos.title': 'Entre em Contacto',
    'section.contactos.sub': 'Junte-se à nossa comunidade através do email, redes sociais ou eventos presenciais.',
    'contact.email': 'Email',
    'contact.instagram': 'Instagram',
    'contact.linkedin': 'LinkedIn',
    'contact.youtube': 'YouTube',
    'contact.website': 'Website Oficial',
    'links.universidade': 'Universidade',
    'links.parceiros': 'Parceiros',
    'links.eventos': 'Eventos',
    'label.news': 'Notícia',
    'label.upcoming': 'Próximamente',
    'label.tba': 'Data a Anunciar',
    'button.more': 'Saber Mais',
    'empty.past': 'Não existem eventos anteriores disponíveis.'
  },
  en: {
    'nav.quem': 'Who we are',
    'nav.fazemos': 'What we do',
    'nav.sobre': 'About',
    'nav.noticias': 'News',
    'nav.contactos': 'Contact us',
    'hero.title': 'Computer Engineering Student Society — Universidade Fernando Pessoa',
    'section.fazemos.title': 'What we do',
    'section.fazemos.sub': 'Workshops, hackathons, talks and community events.',
    'features.workshops.title': 'Workshops',
    'features.workshops.desc': 'Hands-on learning with current technologies.',
    'features.hackathons.title': 'Hackathons',
    'features.hackathons.desc': 'Intense challenges to build solutions.',
    'features.talks.title': 'Talks',
    'features.talks.desc': 'Guest speakers and knowledge sharing.',
    'features.comunidade.title': 'Community',
    'features.comunidade.desc': 'Social activities and networking.',
    'section.sobre.title': 'About Computer Engineering',
    'section.sobre.text': 'Computer Engineering is the field that designs, develops and maintains the technological systems that transform the world. At UFP, the course stands out for its strong practical component, real projects with partner companies and solid preparation for market challenges.\n\nWith a 95% employability rate, our graduates quickly integrate into stimulating careers in Data Science, Cloud Computing, DevOps, Cybersecurity, Artificial Intelligence and much more.',
    'section.sobre.link': 'Learn More About the Course',
    'stats.empregabilidade': 'Employment rate',
    'stats.parceiros': 'Partner companies',
    'section.noticias.title': 'News',
    'section.noticias.sub': 'Upcoming events and updates.',
    'filter.all': 'All',
    'filter.past': 'Past',
    'help.title': 'Help for the community',
    'help.desc': 'Need any help or guidance in IT? Talk to us',
    'help.submit': 'Send request',
    'help.sent': 'Request sent',
    'section.contactos.title': 'Contact us',
    'section.contactos.sub': 'Email, social media and useful links.',
    'contact.email': 'Email',
    'contact.instagram': 'Instagram',
    'contact.linkedin': 'LinkedIn',
    'contact.youtube': 'YouTube',
    'contact.website': 'Website',
    'links.universidade': 'University',
    'links.parceiros': 'Partners',
    'links.eventos': 'Events',
    'label.news': 'News',
    'label.upcoming': 'Upcoming',
    'label.tba': 'Date to be announced',
    'button.more': 'Learn more',
    'empty.past': 'No past events available.'
  }
};

function getLang() { return localStorage.getItem('lang') || 'pt'; }
function t(key) { const lang = getLang(); return (i18n[lang] && i18n[lang][key]) || (i18n.pt[key] || key); }
function applyLangToDom() { document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.getAttribute('data-i18n'); const v = t(k); if (v) el.textContent = v; }); }
function initLangToggle() {
  const btn = document.getElementById('lang-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = getLang() === 'pt' ? 'en' : 'pt';
    localStorage.setItem('lang', next);
    applyLangToDom();
    renderHomepage(events);
  });
}

function sortHomepage(list) {
  const now = new Date();
  const rank = (x) => {
    if (!x.date || x.status === 'no_date') return 3; // Sem data no fundo
    const d = new Date(x.date);
    return d > now ? 2 : 1; // 1: passados, 2: futuros
  };
  return [...list].sort((a, b) => {
    const ra = rank(a), rb = rank(b);
    if (ra !== rb) return ra - rb;
    if (ra === 1) return new Date(b.date) - new Date(a.date); // passados: mais recentes primeiro
    if (ra === 2) return new Date(a.date) - new Date(b.date); // futuros: mais próximos primeiro
    return 0;
  });
}

function formatDate(dateStr) {
  if (!dateStr) return t('label.tba');
  const d = new Date(dateStr);
  const locale = getLang() === 'pt' ? 'pt-PT' : 'en-GB';
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
}

function getMeta(ev) {
  const now = new Date();
  if (ev.type === 'news') return `${t('label.news')} · ${formatDate(ev.date)}`;
  if (!ev.date || ev.status === 'no_date') return t('label.tba');
  const d = new Date(ev.date);
  const loc = getLang() === 'en' ? (ev.location_en || ev.location) : ev.location;
  if (d > now) return `${t('label.upcoming')} · ${loc}`;
  return `${formatDate(ev.date)} · ${loc}`;
}

function renderEvents(list) {
  const root = document.getElementById('news-list');
  root.innerHTML = '';
  const ordered = sortHomepage(list);
  ordered.forEach(ev => {
    const card = document.createElement('article');
    card.className = 'news-card reveal-on-scroll';
    const img = document.createElement('img');
    img.className = 'news-cover';
    img.src = ev.cover;
    img.alt = ev.title;
    img.loading = 'lazy';
    img.onerror = () => {
      if (img.src.endsWith('.jpg')) img.src = img.src.replace('.jpg', '.jpeg');
      else if (img.src.endsWith('.jpeg')) img.src = img.src.replace('.jpeg', '.png');
      else if (img.src.endsWith('.png')) img.src = img.src.replace('.png', '.jpg');
    };
    const body = document.createElement('div');
    body.className = 'news-body';
    if (ev.type === 'news') {
      const badge = document.createElement('span');
      badge.className = 'badge badge-news badge-overlay';
      badge.textContent = t('label.news');
      card.appendChild(badge);
    }
    const now = new Date();
    const isNews = ev.type === 'news';
    const isNoDate = !ev.date || ev.status === 'no_date';
    const isFuture = !isNews && ev.date && new Date(ev.date) > now;
    if (!isNews && (isFuture || isNoDate)) {
      const statusBadge = document.createElement('span');
      statusBadge.className = `badge badge-overlay badge-lg ${isFuture ? 'badge-upcoming' : 'badge-tba'}`;
      statusBadge.textContent = isFuture ? t('label.upcoming') : t('label.tba');
      card.appendChild(statusBadge);
    }
    const h3 = document.createElement('h3');
    h3.className = 'news-title';
    h3.textContent = getLang() === 'en' ? (ev.title_en || ev.title) : ev.title;
    const meta = document.createElement('div');
    meta.className = 'news-meta';
    meta.textContent = getMeta(ev);
    const p = document.createElement('p');
    const desc = getLang() === 'en' ? (ev.desc_en || ev.desc) : ev.desc;
    const firstPara = (desc || '').split(/\n\n+/)[0] || desc || '';
    p.textContent = firstPara;
    const actions = document.createElement('div');
    actions.className = 'news-actions';
    const btn = document.createElement('a');
    btn.href = ev.type === 'news' ? (ev.external || '#') : `/eventos.html?id=${ev.id}`;
    btn.className = ev.type === 'news' ? 'link-news' : 'btn small';
    btn.textContent = t('button.more');
    if (ev.type === 'news') { btn.target = '_blank'; btn.rel = 'noopener'; }
    actions.appendChild(btn);
    body.appendChild(h3);
    body.appendChild(meta);
    body.appendChild(p);
    body.appendChild(actions);
    card.appendChild(img);
    card.appendChild(body);

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

function getHomepageNews() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  return [
    {
      id: 'gemini', type: 'news', title: 'Gemini Pro Grátis',date: '2025-03-18',
      title_en: 'Gemini Pro Free',
      cover: '/images/noticia_gemini.jpg', external: 'https://gemini.google/pt/students',
      desc: 'A Google está a oferecer o Gemini Pro durante um ano para estudantes universitários utilizarem e explorarem nos estudos e aprendizagem. Mais informações no link abaixo.',
      desc_en: 'Google is offering Gemini Pro free for one year for university students to use and explore in their studies and learning. More information at the link below.'
    },
    {
      id: 'nvidia-gr00t', type: 'news', title: 'Isaac GR00T N1: Robô humanoide', date: '2025-03-18',
      title_en: 'Isaac GR00T N1: Humanoid Robot',
      cover: '/images/noticia_robo_neo.jpg', external: 'https://blog.nvidia.com.br/blog/nvidia-anuncia-o-isaac-gr00t-n1-primeiro-modelo-de-base-de-robos-humanoides-aberto-do-mundo-e-frameworks-de-simulacao/',
      desc: 'A NVIDIA apresentou o Isaac GR00T N1, um modelo de base aberto e personalizável para robôs humanoides, com frameworks de simulação e o motor de física Newton em colaboração com o Google DeepMind e a Disney.',
      desc_en: 'NVIDIA introduced Isaac GR00T N1, an open and customizable base model for humanoid robots, with simulation frameworks and the Newton physics engine in collaboration with Google DeepMind and Disney.'
    }
  ];
}

function renderHomepage(list) { renderEvents([...list, ...getHomepageNews()]); }

renderHomepage(events);

document.getElementById('filter-all').addEventListener('click', () => renderHomepage(events));
document.getElementById('filter-past').addEventListener('click', () => {
  const past = events.filter(ev => {
    if (!ev.date) return false;
    const d = new Date(ev.date);
    const now = new Date();
    return d < now;
  });
  const root = document.getElementById('news-list');
  if (!past.length) {
    root.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = t('empty.past');
    root.appendChild(empty);
    return;
  }
  renderEvents(past);
});

const sections = ['quem', 'fazemos', 'sobre', 'noticias', 'contactos'];
const sectionEls = sections.map(id => document.getElementById(id));
window.addEventListener('scroll', () => {
  const y = window.scrollY + 90;
  let active = '';
  sectionEls.forEach((el, i) => {
    const top = el.offsetTop;
    const nextTop = i < sectionEls.length - 1 ? sectionEls[i + 1].offsetTop : Number.MAX_VALUE;
    if (y >= top && y < nextTop) active = '#' + sections[i];
  });
  navLinks.forEach(a => {
    const on = a.getAttribute('href') === active;
    a.classList.toggle('active', on);
    a.style.fontWeight = on ? '700' : '400';
  });
});

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
  const mouse = { x: w/2, y: h/2, has: false };
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.has = true; });
  window.addEventListener('mouseleave', () => { mouse.has = false; });
  function step() {
    ctx.clearRect(0, 0, w, h);
    const isDark = document.body.classList.contains('dark-mode');
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (mouse.has) {
        const dx = mouse.x - n.x, dy = mouse.y - n.y; const d = Math.hypot(dx, dy);
        if (d < 160) { n.vx += dx * 0.0002; n.vy += dy * 0.0002; }
      }
      n.vx *= 0.996; n.vy *= 0.996;
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
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  step();
}

initBackground();
function initIconConstellations() {
  if (window.innerWidth <= 880) return; // ocultar em mobile
  const wrap = document.createElement('div'); wrap.className = 'bg-icons'; document.body.appendChild(wrap);
  const icons = [
    () => svg('<rect x="8" y="16" width="16" height="16" rx="3" stroke="currentColor" fill="none"/>'), // computador
    () => svg('<polygon points="6,12 12,6 18,12" stroke="currentColor" fill="none"/><polygon points="6,18 12,12 18,18" stroke="currentColor" fill="none"/>'), // brackets
    () => svg('<path d="M12 6 L16 10 L12 22 L8 10 Z" stroke="currentColor" fill="none"/>'), // troféu simplificado
    () => svg('<circle cx="12" cy="9" r="3" stroke="currentColor" fill="none"/><rect x="9" y="12" width="6" height="8" rx="3" stroke="currentColor" fill="none"/>'), // programador
    () => svg('<circle cx="9" cy="10" r="3" stroke="currentColor" fill="none"/><circle cx="15" cy="10" r="3" stroke="currentColor" fill="none"/>'), // programar em grupo
    () => svg('<rect x="6" y="8" width="4" height="8" rx="1" stroke="currentColor" fill="none"/><rect x="14" y="8" width="4" height="8" rx="1" stroke="currentColor" fill="none"/>') // 0101
  ];
  function svg(inner) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', '0 0 24 24'); el.setAttribute('width', '48'); el.setAttribute('height', '48');
    el.innerHTML = `<g stroke-width="2" stroke="currentColor" opacity="0.9">${inner}</g>`;
    return el;
  }
  icons.forEach((mk, i) => {
    const holder = document.createElement('div'); holder.className = 'icon-float';
    const x = Math.random() * (window.innerWidth - 100); const y = Math.random() * (window.innerHeight - 100);
    holder.style.setProperty('--x', `${Math.round(x)}px`); holder.style.setProperty('--y', `${Math.round(y)}px`);
    const palette = ['var(--bg-1)','var(--bg-2)','var(--bg-3)','var(--bg-4)'];
    holder.style.color = palette[i % palette.length];
    holder.appendChild(mk()); wrap.appendChild(holder);
  });
}

initIconConstellations();

function initMonitorBackground() {
  const el = document.querySelector('.pc-monitor');
  if (!el) return;
  const cands = [
    '/images/tela_computador.png',
    '/images/tela_computador.jpg',
    '/images/tela_computador.jpeg',
    'images/tela_computador.png',
    'images/tela_computador.jpg',
    'images/tela_computador.jpeg'
  ];
  let idx = 0;
  function tryLoad() {
    if (idx >= cands.length) return;
    const u = cands[idx++];
    const t = new Image();
    t.onload = () => { el.style.backgroundImage = `url('${u}')`; };
    t.onerror = tryLoad;
    t.src = u;
  }
  tryLoad();
}

initMonitorBackground();

function initCounters() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.counter').forEach(el => io.observe(el));
}

function animateCount(el) {
  const target = Number(el.getAttribute('data-target')) || 0;
  const suffix = el.getAttribute('data-suffix') || '';
  let start = 0;
  const dur = 1400;
  const t0 = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - t0) / dur);
    const val = Math.round(start + (target - start) * p);
    el.textContent = suffix === '+' ? `${val}+` : `${val}${suffix}`;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

initCounters();

// decorations removed

// removed

function initHelpForm() {
  const form = document.getElementById('ajuda-form');
  if (!form) return;
  const textarea = form.querySelector('textarea');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = (textarea.value || '').trim();
    if (!text) return;
    const payload = { id: `hp_${Date.now()}`, text, at: new Date().toISOString(), status: 'pending' };
    let ok = false;
    try {
      const res = await fetch('/api/ajuda', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      ok = res.ok;
    } catch {}
    if (!ok) {
      const saved = JSON.parse(localStorage.getItem('ajudaPedidos') || '[]');
      saved.push(payload);
      localStorage.setItem('ajudaPedidos', JSON.stringify(saved));
    }
    form.reset();
    const msg = document.createElement('div');
    msg.className = 'link-pill';
    msg.textContent = t('help.sent');
    form.appendChild(msg);
    setTimeout(() => msg.remove(), 2500);
  });
}

initHelpForm();
applyLangToDom();
initLangToggle();

