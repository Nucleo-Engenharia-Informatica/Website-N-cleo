import { events } from './events.js';
import {
  getLang, applyCommonLang, initLangToggle as initCommonLangToggle, initThemeToggle, initMenu,
  revealObserver as observer, observeReveal, initBackground, initFooterYear, reducedMotion
} from './common.js';

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
    'label.upcoming': 'Brevemente',
    'evento.details': 'Ver detalhes',
    'evento.notfound': 'Evento não encontrado',
    'evento.notfound.desc': 'O evento que procura não existe ou foi removido.',
    'lightbox.label': 'Galeria de imagens',
    'lightbox.open': 'Ampliar imagem',
    'lightbox.prev': 'Imagem anterior',
    'lightbox.next': 'Imagem seguinte',
    'lightbox.close': 'Fechar',
    'lightbox.thumb': 'Mostrar imagem'
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
    'label.upcoming': 'Upcoming',
    'evento.details': 'View details',
    'evento.notfound': 'Event not found',
    'evento.notfound.desc': 'The event you are looking for does not exist or was removed.',
    'lightbox.label': 'Image gallery',
    'lightbox.open': 'Enlarge image',
    'lightbox.prev': 'Previous image',
    'lightbox.next': 'Next image',
    'lightbox.close': 'Close',
    'lightbox.thumb': 'Show image'
  }
};
function t(k) { const lang = getLang(); return (i18n[lang] && i18n[lang][k]) || (i18n.pt[k] || k); }
function applyLangToDom() {
  document.querySelectorAll('[data-i18n]').forEach(el => { const v = t(el.getAttribute('data-i18n')); if (v) el.textContent = v; });
  applyCommonLang();
}
// Mudar de idioma volta a desenhar o conteúdo (sem recarregar a página)
function initLangToggle() { initCommonLangToggle(renderPage); }

initMenu();
initThemeToggle();
observeReveal();

function sortByDateAsc(list) { return [...list].sort((a, b) => new Date(a.date) - new Date(b.date)); }
function formatDate(dateStr) { if (!dateStr) return t('label.tba'); const d = new Date(dateStr); const locale = getLang() === 'pt' ? 'pt-PT' : 'en-GB'; return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' }); }
function getMeta(ev) { const now = new Date(); if (!ev.date || ev.status === 'no_date') return t('label.tba'); const d = new Date(ev.date); const loc = getLang() === 'en' ? (ev.location_en || ev.location) : ev.location; return d > now ? `${t('label.upcoming')} · ${loc}` : `${formatDate(ev.date)} · ${loc}`; }

function renderAgenda(list, selectedId) {
  const root = document.getElementById('eventos-lista');
  root.innerHTML = '';
  sortByDateAsc(list.filter(e => e.id !== selectedId)).forEach(ev => {
    const card = document.createElement('article');
    card.className = 'news-card reveal-on-scroll';
    const img = document.createElement('img'); img.className = 'news-cover'; img.src = ev.cover; img.alt = ''; img.loading = 'lazy';
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
    const btn = document.createElement('a'); btn.href = `?id=${ev.id}`; btn.className = 'btn small'; btn.textContent = t('evento.details');
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

// O detalhe cria um lightbox no <body>, um atalho de teclado e um carrossel;
// ao voltar a desenhar (troca de idioma) é preciso desfazê-los primeiro.
let detailCleanup = null;

function renderDetail(ev) {
  detailCleanup?.();
  detailCleanup = null;
  const root = document.getElementById('evento-detalhe');
  root.innerHTML = '';
  if (!ev) {
    if (!getIdFromQuery()) return;
    // id inexistente: em vez de uma página vazia, explica e dá o caminho de volta
    const box = document.createElement('div'); box.className = 'card';
    const body = document.createElement('div'); body.className = 'news-body';
    const h1 = document.createElement('h1'); h1.className = 'section-title'; h1.textContent = t('evento.notfound');
    const p = document.createElement('p'); p.textContent = t('evento.notfound.desc');
    const back = document.createElement('a'); back.href = './index.html#noticias'; back.className = 'btn small'; back.textContent = t('evento.back');
    body.append(h1, p, back); box.appendChild(body); root.appendChild(box);
    return;
  }
  const evTitle = getLang() === 'en' ? (ev.title_en || ev.title) : ev.title;
  document.title = `${evTitle} — Núcleo de Engenharia Informática`;
  const wrap = document.createElement('div');
  wrap.className = 'card';
  const body = document.createElement('div'); body.className = 'news-body';
  const h2 = document.createElement('h1'); h2.className = 'section-title'; h2.textContent = evTitle;
  const meta = document.createElement('div'); meta.className = 'news-meta'; meta.textContent = getMeta(ev);

  /* let allImgs = [ev.cover, ...(Array.isArray(ev.images) ? ev.images : [])].filter((v, i, a) => a.indexOf(v) === i);
  const baseName = (ev.cover || '').replace(/\.(jpg|jpeg|png)$/i, '');
  for (let n = 1; n <= 6; n++) {
    ['jpg','jpeg','png'].forEach(ext => { allImgs.push(`${baseName}_${n}.${ext}`); });
  }
  allImgs = allImgs.filter((v, i, a) => a.indexOf(v) === i); */

  let allImgs = [ev.cover, ...(Array.isArray(ev.images) ? ev.images : [])].filter((v, i, a) => a.indexOf(v) === i && v);
  let currentIdx = 0;

  const mainImg = document.createElement('img'); mainImg.className = 'event-main'; mainImg.src = allImgs[0]; mainImg.alt = evTitle; mainImg.loading = 'lazy';
  mainImg.tabIndex = 0; mainImg.setAttribute('role', 'button'); mainImg.setAttribute('aria-label', `${t('lightbox.open')}: ${evTitle}`);
  mainImg.onerror = () => { const s = mainImg.src; if (s.endsWith('.jpg')) mainImg.src = s.replace('.jpg', '.jpeg'); else if (s.endsWith('.jpeg')) mainImg.src = s.replace('.jpeg', '.png'); else if (s.endsWith('.png')) mainImg.src = s.replace('.png', '.jpg'); };
  wrap.appendChild(mainImg);

  const thumbs = document.createElement('div'); thumbs.className = 'event-thumbs';

  function updateMainImage(idx) {
    currentIdx = idx;
    mainImg.src = allImgs[idx];
    Array.from(thumbs.children).forEach((c, i) => {
      c.classList.toggle('active', i === idx);
      c.setAttribute('aria-pressed', String(i === idx));
    });
  }

  allImgs.forEach((src, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'event-thumb';
    b.setAttribute('aria-label', `${t('lightbox.thumb')} ${idx + 1} / ${allImgs.length}`);
    b.setAttribute('aria-pressed', String(idx === 0));
    const t2 = document.createElement('img'); t2.src = src; t2.alt = ''; t2.loading = 'lazy';
    t2.onerror = () => { const s = t2.src; if (s.endsWith('.jpg')) t2.src = s.replace('.jpg', '.jpeg'); else if (s.endsWith('.jpeg')) t2.src = s.replace('.jpeg', '.png'); else if (s.endsWith('.png')) t2.src = s.replace('.png', '.jpg'); };
    if (idx === 0) b.classList.add('active');
    b.appendChild(t2);
    b.addEventListener('click', () => { stopCarousel(true); updateMainImage(idx); });
    thumbs.appendChild(b);
  });

  // Carrossel automático (não roda com "reduzir movimento"; pausa com rato ou foco;
  // pára de vez quando o utilizador escolhe uma imagem)
  let carouselInterval = null;
  let carouselStopped = reducedMotion || allImgs.length < 2;
  function startCarousel() {
    if (carouselStopped || carouselInterval) return;
    carouselInterval = setInterval(() => updateMainImage((currentIdx + 1) % allImgs.length), 4000);
  }
  function stopCarousel(forever = false) {
    clearInterval(carouselInterval);
    carouselInterval = null;
    if (forever) carouselStopped = true;
  }
  startCarousel();
  wrap.addEventListener('mouseenter', () => stopCarousel());
  wrap.addEventListener('mouseleave', startCarousel);
  wrap.addEventListener('focusin', () => stopCarousel());
  wrap.addEventListener('focusout', startCarousel);

  // Lightbox with navigation
  const lb = document.createElement('div'); lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', t('lightbox.label'));
  const lbImg = document.createElement('img'); lbImg.alt = evTitle;
  const mkBtn = (cls, text, label) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = text; b.setAttribute('aria-label', label); return b;
  };
  const prevBtn = mkBtn('lightbox-nav lightbox-prev', '‹', t('lightbox.prev'));
  const nextBtn = mkBtn('lightbox-nav lightbox-next', '›', t('lightbox.next'));
  const closeBtn = mkBtn('lightbox-close', '×', t('lightbox.close'));
  if (allImgs.length < 2) { prevBtn.hidden = true; nextBtn.hidden = true; }

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
    stopCarousel();
    closeBtn.focus();
  }

  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    mainImg.focus();
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
  mainImg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(currentIdx); }
  });
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrevImage(); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNextImage(); });

  // Keyboard navigation
  const onKey = (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') showPrevImage();
    else if (e.key === 'ArrowRight') showNextImage();
    else if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'Tab') {
      // mantém o foco dentro do lightbox
      const items = [prevBtn, nextBtn, closeBtn].filter(b => !b.hidden);
      const i = items.indexOf(document.activeElement);
      e.preventDefault();
      items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
    }
  };
  document.addEventListener('keydown', onKey);

  detailCleanup = () => {
    stopCarousel(true);
    document.removeEventListener('keydown', onKey);
    lb.remove();
    document.body.style.overflow = '';
  };

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
}

function getIdFromQuery() { return new URLSearchParams(window.location.search).get('id'); }

function renderPage() {
  const id = getIdFromQuery();
  const ev = events.find(e => e.id === id);
  renderDetail(ev);
  renderAgenda(events, id);
  applyLangToDom();
}

function init() {
  renderPage();
  initLangToggle();
  initFooterYear();
}

init();

initBackground();
