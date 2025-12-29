import { events } from './events.js';

const i18n = {
  pt: {
    'nav.quem': 'Quem Somos',
    'nav.fazemos': 'O que Fazemos',
    'nav.sobre': 'Sobre o Curso',
    'nav.noticias': 'Notícias e Eventos',
    'nav.contactos': 'Contactos',
    'page.evento.title': 'Evento',
    'page.evento.others': 'Outros Eventos',
    'page.evento.others.subtitle': 'Descubra mais atividades e iniciativas do núcleo.',
    'evento.back': 'Voltar às notícias',
    'label.tba': 'Data a Anunciar',
    'label.upcoming': 'Próximamente'
  },
  en: {
    'nav.quem': 'Who We Are',
    'nav.fazemos': 'What We Do',
    'nav.sobre': 'About the Course',
    'nav.noticias': 'News & Events',
    'nav.contactos': 'Contact',
    'page.evento.title': 'Event',
    'page.evento.others': 'Other Events',
    'page.evento.others.subtitle': 'Discover more activities and initiatives from the nucleus.',
    'evento.back': 'Back to news',
    'label.tba': 'Date to be Announced',
    'label.upcoming': 'Upcoming'
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

function sortByDateAsc(list) { return [...list].sort((a, b) => new Date(a.date) - new Date(b.date)); }
function formatDate(dateStr) { if (!dateStr) return t('label.tba'); const d = new Date(dateStr); const locale = getLang() === 'pt' ? 'pt-PT' : 'en-GB'; return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' }); }
function getMeta(ev) { const now = new Date(); if (!ev.date || ev.status === 'no_date') return t('label.tba'); const d = new Date(ev.date); const loc = getLang() === 'en' ? (ev.location_en || ev.location) : ev.location; return d > now ? `${t('label.upcoming')} · ${loc}` : `${formatDate(ev.date)} · ${loc}`; }

function renderAgenda(list, selectedId) {
  const root = document.getElementById('eventos-lista');
  root.innerHTML = '';
  sortByDateAsc(list.filter(e => e.id !== selectedId)).forEach(ev => {
    const card = document.createElement('article');
    card.className = 'news-card reveal-on-scroll';
    const img = document.createElement('img'); img.className = 'news-cover'; img.src = ev.cover; img.alt = ev.title; img.loading = 'lazy';
    const cands = [];
    const base = ev.cover || '';
    if (base) {
      if (base.startsWith('/images/')) cands.push(base.replace('/images/','images/'));
      if (base.endsWith('.jpg')) { cands.push(base.replace('.jpg','.jpeg')); cands.push(base.replace('.jpg','.png')); cands.push(base.replace('.jpg','.JPG')); }
      if (base.endsWith('.jpeg')) { cands.push(base.replace('.jpeg','.png')); cands.push(base.replace('.jpeg','.jpg')); cands.push(base.replace('.jpeg','.JPEG')); }
      if (base.endsWith('.png')) { cands.push(base.replace('.png','.jpg')); cands.push(base.replace('.png','.jpeg')); cands.push(base.replace('.png','.PNG')); }
    }
    (Array.isArray(ev.images) ? ev.images : []).forEach(s => {
      cands.push(s);
      if (s.startsWith('/images/')) { cands.push(s.replace('/images/','images/')); cands.push(s.replace('.png','.PNG')); cands.push(s.replace('.jpg','.JPG')); cands.push(s.replace('.jpeg','.JPEG')); }
    });
    img.dataset.fbi = '0';
    img.onerror = () => {
      const i = Number(img.dataset.fbi);
      if (i < cands.length) { img.src = cands[i]; img.dataset.fbi = String(i + 1); } else { img.onerror = null; }
    };
    const body = document.createElement('div'); body.className = 'news-body';
    const h3 = document.createElement('h3'); h3.className = 'news-title'; h3.textContent = getLang() === 'en' ? (ev.title_en || ev.title) : ev.title;
    const meta = document.createElement('div'); meta.className = 'news-meta'; meta.textContent = `${formatDate(ev.date)} · ${getLang() === 'en' ? (ev.location_en || ev.location) : ev.location}`;
    const p = document.createElement('p'); p.textContent = getLang() === 'en' ? (ev.desc_en || ev.desc) : ev.desc;
    const actions = document.createElement('div'); actions.className = 'news-actions';
    const btn = document.createElement('a'); btn.href = `?id=${ev.id}`; btn.className = 'btn small'; btn.textContent = 'Ver detalhes';
    actions.appendChild(btn);
    body.appendChild(h3); body.appendChild(meta); body.appendChild(p); body.appendChild(actions);
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

function renderDetail(ev) {
  const root = document.getElementById('evento-detalhe');
  root.innerHTML = '';
  if (!ev) { return; }
  const wrap = document.createElement('div');
  wrap.className = 'card';
  const body = document.createElement('div'); body.className = 'news-body';
  const h2 = document.createElement('h2'); h2.className = 'section-title'; h2.textContent = getLang() === 'en' ? (ev.title_en || ev.title) : ev.title;
  const meta = document.createElement('div'); meta.className = 'news-meta'; meta.textContent = getMeta(ev);

  /* let allImgs = [ev.cover, ...(Array.isArray(ev.images) ? ev.images : [])].filter((v, i, a) => a.indexOf(v) === i);
  const baseName = (ev.cover || '').replace(/\.(jpg|jpeg|png)$/i, '');
  for (let n = 1; n <= 6; n++) {
    ['jpg','jpeg','png'].forEach(ext => { allImgs.push(`${baseName}_${n}.${ext}`); });
  }
  allImgs = allImgs.filter((v, i, a) => a.indexOf(v) === i); */

  let allImgs = [ev.cover, ...(Array.isArray(ev.images) ? ev.images : [])].filter((v, i, a) => a.indexOf(v) === i && v);
  let currentIdx = 0;

  const mainImg = document.createElement('img'); mainImg.className = 'event-main'; mainImg.src = allImgs[0]; mainImg.alt = getLang() === 'en' ? (ev.title_en || ev.title) : ev.title; mainImg.loading = 'lazy';
  mainImg.onerror = () => { const s = mainImg.src; if (s.endsWith('.jpg')) mainImg.src = s.replace('.jpg', '.jpeg'); else if (s.endsWith('.jpeg')) mainImg.src = s.replace('.jpeg', '.png'); else if (s.endsWith('.png')) mainImg.src = s.replace('.png', '.jpg'); };
  wrap.appendChild(mainImg);

  const thumbs = document.createElement('div'); thumbs.className = 'event-thumbs';

  function updateMainImage(idx) {
    currentIdx = idx;
    mainImg.src = allImgs[idx];
    Array.from(thumbs.children).forEach((c, i) => {
      if (i === idx) c.classList.add('active');
      else c.classList.remove('active');
    });
  }

  allImgs.forEach((src, idx) => {
    const t = document.createElement('img'); t.src = src; t.alt = getLang() === 'en' ? (ev.title_en || ev.title) : ev.title; t.loading = 'lazy';
    t.onerror = () => { const s = t.src; if (s.endsWith('.jpg')) t.src = s.replace('.jpg', '.jpeg'); else if (s.endsWith('.jpeg')) t.src = s.replace('.jpeg', '.png'); else if (s.endsWith('.png')) t.src = s.replace('.png', '.jpg'); };
    if (idx === 0) t.classList.add('active');
    t.addEventListener('click', () => updateMainImage(idx));
    thumbs.appendChild(t);
  });

  // Auto-play carousel if more than 1 image
  let carouselInterval = null;
  if (allImgs.length > 1) {
    carouselInterval = setInterval(() => {
      const nextIdx = (currentIdx + 1) % allImgs.length;
      updateMainImage(nextIdx);
    }, 4000);

    // Pause on hover
    mainImg.addEventListener('mouseenter', () => clearInterval(carouselInterval));
    mainImg.addEventListener('mouseleave', () => {
      if (allImgs.length > 1) {
        carouselInterval = setInterval(() => {
          const nextIdx = (currentIdx + 1) % allImgs.length;
          updateMainImage(nextIdx);
        }, 4000);
      }
    });
  }

  // Lightbox with navigation
  const lb = document.createElement('div'); lb.className = 'lightbox';
  const lbImg = document.createElement('img');
  const prevBtn = document.createElement('button'); prevBtn.className = 'lightbox-nav lightbox-prev'; prevBtn.innerHTML = '‹';
  const nextBtn = document.createElement('button'); nextBtn.className = 'lightbox-nav lightbox-next'; nextBtn.innerHTML = '›';
  const closeBtn = document.createElement('button'); closeBtn.className = 'lightbox-close'; closeBtn.innerHTML = '×';

  lb.appendChild(lbImg);
  lb.appendChild(prevBtn);
  lb.appendChild(nextBtn);
  lb.appendChild(closeBtn);
  document.body.appendChild(lb);

  let lbCurrentIdx = 0;

  function openLightbox(idx) {
    lbCurrentIdx = idx;
    lbImg.src = allImgs[idx];
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showPrevImage() {
    lbCurrentIdx = (lbCurrentIdx - 1 + allImgs.length) % allImgs.length;
    lbImg.src = allImgs[lbCurrentIdx];
  }

  function showNextImage() {
    lbCurrentIdx = (lbCurrentIdx + 1) % allImgs.length;
    lbImg.src = allImgs[lbCurrentIdx];
  }

  mainImg.addEventListener('click', () => openLightbox(currentIdx));
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrevImage(); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNextImage(); });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') showPrevImage();
    else if (e.key === 'ArrowRight') showNextImage();
    else if (e.key === 'Escape') closeLightbox();
  });

  body.appendChild(h2);
  body.appendChild(meta);
  body.appendChild(thumbs);
  const desc = getLang() === 'en' ? (ev.desc_en || ev.desc) : ev.desc;
  (desc || '').split(/\n\n+/).forEach(txt => { const p = document.createElement('p'); p.textContent = txt; body.appendChild(p); });
  const actions = document.createElement('div'); actions.className = 'news-actions';
  const back = document.createElement('a'); back.href = './index.html#noticias'; back.className = 'btn small'; back.textContent = t('evento.back');
  actions.appendChild(back);
  body.appendChild(actions);
  wrap.appendChild(body);
  root.appendChild(wrap);

  // Click outside to go back
  setTimeout(() => {
    const clickOutsideHandler = (e) => {
      if (!wrap.contains(e.target) && !e.target.closest('.lightbox')) {
        back.click();
      }
    };
    document.addEventListener('click', clickOutsideHandler);
    // Store handler to remove later if needed
    wrap._clickOutsideHandler = clickOutsideHandler;
  }, 100);

  applyLangToDom(); initLangToggle();
}

function getIdFromQuery() { return new URLSearchParams(window.location.search).get('id'); }

function init() {
  const id = getIdFromQuery();
  const ev = events.find(e => e.id === id);
  renderDetail(ev);
  renderAgenda(events, id);
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
