import { events } from './events.js';
import { membros } from './membros.js';
import {
  getLang, applyCommonLang, initLangToggle as initCommonLangToggle, initThemeToggle, initMenu,
  revealObserver as observer, observeReveal, initBackground, initFooterYear, reducedMotion
} from './common.js';

// --- 0. reCAPTCHA (carregado só quando alguém usa o formulário de ajuda) ---
// O script da Google tem ~850 KB: carregá-lo logo atrasava a página toda.
let recaptchaPromise = null;
function carregarReCaptcha() {
  if (recaptchaPromise) return recaptchaPromise;
  recaptchaPromise = (async () => {
    try {
      const response = await fetch('/api/config');
      const config = await response.json();
      const SITE_KEY = config.siteKey;
      if (!SITE_KEY) return;
      window.VITE_RECAPTCHA_SITE_KEY = SITE_KEY;
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    } catch (err) {
      console.error('Erro ao carregar o reCAPTCHA:', err);
      recaptchaPromise = null; // permite tentar outra vez
    }
  })();
  return recaptchaPromise;
}
{
  const form = document.getElementById('ajuda-form');
  ['focusin', 'pointerenter', 'touchstart'].forEach((ev) =>
    form?.addEventListener(ev, carregarReCaptcha, { once: true, passive: true })
  );
}

// --- 1. Navegação e UI Geral ---
const navLinks = document.querySelectorAll('.site-nav a');
initMenu();
initThemeToggle();
observeReveal();

// --- 2. Internacionalização (i18n) ---
const i18n = {
  pt: {
    'nav.quem': 'Quem Somos',
    'nav.fazemos': 'O que Fazemos',
    'nav.sobre': 'Sobre o Curso',
    'nav.noticias': 'Notícias e Eventos',
    'nav.contactos': 'Contactos',
    'hero.title': 'Núcleo de Engenharia Informática da Universidade Fernando Pessoa',
    'section.quem.title': 'Quem Somos',
    'section.quem.sub': 'Estudantes apaixonados por tecnologia que dinamizam a comunidade de Engenharia Informática da UFP.',
    'label.member': 'Membro do Núcleo',
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
    'help.label.text': 'O seu pedido',
    'help.label.email': 'O seu email (para lhe respondermos)',
    'help.placeholder.text': 'Descreva a sua necessidade',
    'help.placeholder.email': 'ex: nome@gmail.com',
    'help.privacy': 'Usamos o seu email apenas para responder a este pedido; o pedido é apagado ao fim de 12 meses.',
    'help.recaptcha': 'Protegido por reCAPTCHA da Google:',
    'help.recaptcha.privacy': 'Privacidade',
    'help.recaptcha.terms': 'Termos',
    'help.msg.empty': 'Por favor, descreva o seu pedido.',
    'help.msg.email': 'Por favor, indique um email válido.',
    'help.msg.sending': 'A enviar...',
    'help.msg.ok': 'Pedido enviado com sucesso! Irá receber a resposta no email.',
    'help.msg.error': 'Ocorreu um problema.',
    'help.msg.network': 'Erro de ligação ou de verificação. Tente novamente.',
    'section.contactos.title': 'Entre em Contacto',
    'section.contactos.sub': 'Junte-se à nossa comunidade através do email, redes sociais ou eventos presenciais.',
    'contact.email': 'Email',
    'contact.instagram': 'Instagram',
    'contact.linkedin': 'LinkedIn',
    'contact.youtube': 'YouTube',
    'contact.website': 'Website Oficial',
    'links.universidade': 'Universidade',
    'links.eventos': 'Eventos',
    'label.news': 'Notícia',
    'label.upcoming': 'Brevemente',
    'label.tba': 'Data a Anunciar',
    'button.more': 'Saber Mais',
    'a11y.linkedin': 'LinkedIn de',
    'a11y.github': 'GitHub de',
    'empty.past': 'Não existem eventos anteriores disponíveis.'
  },
  en: {
    'nav.quem': 'Who we are',
    'nav.fazemos': 'What we do',
    'nav.sobre': 'About',
    'nav.noticias': 'News',
    'nav.contactos': 'Contact us',
    'hero.title': 'Computer Engineering Student Society — Universidade Fernando Pessoa',
    'section.quem.title': 'Who we are',
    'section.quem.sub': 'Technology-passionate students who drive the UFP Computer Engineering community.',
    'label.member': 'Nucleus Member',
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
    'help.label.text': 'Your request',
    'help.label.email': 'Your email (so we can reply)',
    'help.placeholder.text': 'Describe what you need',
    'help.placeholder.email': 'e.g. name@gmail.com',
    'help.privacy': 'We only use your email to reply to this request; requests are deleted after 12 months.',
    'help.recaptcha': 'Protected by Google reCAPTCHA:',
    'help.recaptcha.privacy': 'Privacy',
    'help.recaptcha.terms': 'Terms',
    'help.msg.empty': 'Please describe your request.',
    'help.msg.email': 'Please enter a valid email.',
    'help.msg.sending': 'Sending...',
    'help.msg.ok': 'Request sent! You will receive the reply by email.',
    'help.msg.error': 'Something went wrong.',
    'help.msg.network': 'Connection or verification error. Please try again.',
    'section.contactos.title': 'Contact us',
    'section.contactos.sub': 'Email, social media and useful links.',
    'contact.email': 'Email',
    'contact.instagram': 'Instagram',
    'contact.linkedin': 'LinkedIn',
    'contact.youtube': 'YouTube',
    'contact.website': 'Website',
    'links.universidade': 'University',
    'links.eventos': 'Events',
    'label.news': 'News',
    'label.upcoming': 'Upcoming',
    'label.tba': 'Date to be announced',
    'button.more': 'Learn more',
    'a11y.linkedin': 'LinkedIn of',
    'a11y.github': 'GitHub of',
    'empty.past': 'No past events available.'
  }
};

function t(key) { const lang = getLang(); return (i18n[lang] && i18n[lang][key]) || (i18n.pt[key] || key); }
function applyLangToDom() {
  document.querySelectorAll('[data-i18n]').forEach(el => { const v = t(el.getAttribute('data-i18n')); if (v) el.textContent = v; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.getAttribute('data-i18n-placeholder')); });
  applyCommonLang();
}

function initLangToggle() {
  initCommonLangToggle(() => {
    applyLangToDom();
    renderNews();
    renderMembros(membros);
  });
}

// --- 3. Lógica de Eventos e Renderização ---
function sortHomepage(list) {
  const now = new Date();
  const rank = (x) => {
    if (!x.date || x.status === 'no_date') return 3;
    const d = new Date(x.date);
    return d > now ? 2 : 1;
  };
  return [...list].sort((a, b) => {
    const ra = rank(a), rb = rank(b);
    if (ra !== rb) return ra - rb;
    if (ra === 1) return new Date(b.date) - new Date(a.date);
    if (ra === 2) return new Date(a.date) - new Date(b.date);
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
  if (!root) return;
  root.innerHTML = '';
  const ordered = sortHomepage(list);

  ordered.forEach(ev => {
    const card = document.createElement('article');
    card.className = 'news-card reveal-on-scroll';

    const img = document.createElement('img');
    img.className = 'news-cover';
    img.src = ev.cover;
    img.alt = '';
    img.loading = 'lazy';

    // Correção: Evitar loop infinito no erro de imagem
    img.onerror = function() {
        // Marcamos que já tentamos corrigir para não entrar em loop
        if (this.getAttribute('data-retried')) return;
        this.setAttribute('data-retried', 'true');

        if (this.src.endsWith('.jpg')) this.src = this.src.replace('.jpg', '.jpeg');
        else if (this.src.endsWith('.jpeg')) this.src = this.src.replace('.jpeg', '.png');
        else if (this.src.endsWith('.png')) this.src = this.src.replace('.png', '.jpg');
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

    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' || e.target.closest('a')) return;
      btn.click();
    });

    root.appendChild(card);
    observer.observe(card);
  });
}

function getHomepageNews() {
  // Hardcoded news para a Homepage
  return [
    {
      id: 'gemini', type: 'news', title: 'Gemini Pro Grátis', date: '2025-03-18',
      title_en: 'Gemini Pro Free',
      cover: '/images/noticia_gemini.png', external: 'https://gemini.google/pt/students',
      desc: 'A Google está a oferecer o Gemini Pro durante um ano para estudantes universitários utilizarem e explorarem nos estudos e aprendizagem. Mais informações no link abaixo.',
      desc_en: 'Google is offering Gemini Pro free for one year for university students to use and explore in their studies and learning. More information at the link below.'
    },
    {
      id: 'nvidia-gr00t', type: 'news', title: 'Isaac GR00T N1: Robô humanoide', date: '2025-03-18',
      title_en: 'Isaac GR00T N1: Humanoid Robot',
      cover: '/images/noticia_robo_neo.png', external: 'https://blog.nvidia.com.br/blog/nvidia-anuncia-o-isaac-gr00t-n1-primeiro-modelo-de-base-de-robos-humanoides-aberto-do-mundo-e-frameworks-de-simulacao/',
      desc: 'A NVIDIA apresentou o Isaac GR00T N1, um modelo de base aberto e personalizável para robôs humanoides, com frameworks de simulação e o motor de física Newton em colaboração com o Google DeepMind e a Disney.',
      desc_en: 'NVIDIA introduced Isaac GR00T N1, an open and customizable base model for humanoid robots, with simulation frameworks and the Newton physics engine in collaboration with Google DeepMind and Disney.'
    }
  ];
}

function renderHomepage(list) {
    renderEvents([...list, ...getHomepageNews()]);
}

// --- Quem Somos (membros) ---
function renderMembros(lista) {
  const teamGrid = document.getElementById('team-lista');
  if (!teamGrid) return;
  teamGrid.innerHTML = '';

  lista.forEach(membro => {
    const card = document.createElement('article');
    card.className = 'card reveal-on-scroll';
    card.innerHTML = `
      <img
        src="${membro.cover}"
        ${membro.cover.endsWith('.webp') ? `srcset="${encodeURI(membro.cover.replace(/\.webp$/, '-480.webp'))} 480w, ${encodeURI(membro.cover)} 800w" sizes="(max-width: 520px) 100vw, (max-width: 900px) 50vw, 300px"` : ''}
        alt="${membro.name}"
        width="800" height="800"
        loading="lazy"
        decoding="async"
        style="width: 100%; height: auto; aspect-ratio: 1/1; object-fit: cover;"
        onerror="this.onerror=null; this.removeAttribute('srcset'); this.src='${membro.fallback || membro.cover.replace('.webp', '.jpeg')}';"
      >
      <div class="card-body">
        <h3>${membro.name}</h3>
        <p class="muted">${membro.cargo || t('label.member')}</p>
        <div class="social-links" style="margin-top: 12px; display: flex; gap: 15px; justify-content: center;">
          ${membro.linkedin ? `
          <a href="${membro.linkedin}" target="_blank" rel="noopener" aria-label="${t('a11y.linkedin')} ${membro.name}" style="color: inherit; font-size: 1.2rem;">
            <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 4.892v4.248zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>` : ''}
          ${membro.github ? `
          <a href="${membro.github.trim()}" target="_blank" rel="noopener" aria-label="${t('a11y.github')} ${membro.name}" style="color: inherit; font-size: 1.2rem;">
            <svg class="social-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
          </a>` : ''}
        </div>
      </div>
    `;
    teamGrid.appendChild(card);
    observer.observe(card);
  });
}

// Filtros: "Todos" / "Anteriores" (eventos e notícias com data já passada)
let newsFilter = 'all';
const btnAll = document.getElementById('filter-all');
const btnPast = document.getElementById('filter-past');

function renderNews() {
  btnAll?.setAttribute('aria-pressed', String(newsFilter === 'all'));
  btnPast?.setAttribute('aria-pressed', String(newsFilter === 'past'));
  if (newsFilter === 'all') return renderHomepage(events);

  const now = new Date();
  const past = [...events, ...getHomepageNews()].filter(ev => ev.date && new Date(ev.date) < now);
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
}

btnAll?.addEventListener('click', () => { newsFilter = 'all'; renderNews(); });
btnPast?.addEventListener('click', () => { newsFilter = 'past'; renderNews(); });

// Inicializações
renderNews();
renderMembros(membros);
applyLangToDom();
initLangToggle();
initFooterYear();

// Spy Scroll (Active Links)
const sections = ['quem', 'fazemos', 'sobre', 'noticias', 'contactos'];
// Tenta encontrar os elementos, mas alguns podem ser null
const sectionEls = sections.map(id => document.getElementById(id));

window.addEventListener('scroll', () => {
  const y = window.scrollY + 90;
  let active = '';

  sectionEls.forEach((el, i) => {
    // --- CORREÇÃO AQUI: Se o elemento não existir, ignora e segue em frente ---
    if (!el) return;

    const top = el.offsetTop;
    // Verifica se o próximo elemento existe antes de tentar ler o topo dele
    const nextEl = sectionEls[i + 1];
    const nextTop = (nextEl) ? nextEl.offsetTop : Number.MAX_VALUE;

    if (y >= top && y < nextTop) active = '#' + sections[i];
  });

  navLinks.forEach(a => {
    const on = a.getAttribute('href') === active;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  });
}, { passive: true });

// --- 4. Canvas e Efeitos Visuais ---
initBackground({ followMouse: true });

function initIconConstellations() {
  if (window.innerWidth <= 880 || reducedMotion) return;
  const wrap = document.createElement('div'); wrap.className = 'bg-icons'; wrap.setAttribute('aria-hidden', 'true'); document.body.appendChild(wrap);
  const icons = [
    () => svg('<rect x="8" y="16" width="16" height="16" rx="3" stroke="currentColor" fill="none"/>'),
    () => svg('<polygon points="6,12 12,6 18,12" stroke="currentColor" fill="none"/><polygon points="6,18 12,12 18,18" stroke="currentColor" fill="none"/>'),
    () => svg('<path d="M12 6 L16 10 L12 22 L8 10 Z" stroke="currentColor" fill="none"/>'),
    () => svg('<circle cx="12" cy="9" r="3" stroke="currentColor" fill="none"/><rect x="9" y="12" width="6" height="8" rx="3" stroke="currentColor" fill="none"/>'),
    () => svg('<circle cx="9" cy="10" r="3" stroke="currentColor" fill="none"/><circle cx="15" cy="10" r="3" stroke="currentColor" fill="none"/>'),
    () => svg('<rect x="6" y="8" width="4" height="8" rx="1" stroke="currentColor" fill="none"/><rect x="14" y="8" width="4" height="8" rx="1" stroke="currentColor" fill="none"/>')
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
  if (reducedMotion) { el.textContent = `${target}${suffix}`; return; }
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

// --- 5. Formulário de Ajuda ---
const ajudaForm = document.getElementById('ajuda-form');
ajudaForm?.addEventListener('submit', async (e) => {
  e.preventDefault(); // Impede o reload da página
  await enviarPedido();
});

async function enviarPedido() {
  const textoEl = document.getElementById('ajuda-texto');
  const emailEl = document.getElementById('ajuda-email');
  const texto = textoEl.value;
  const email = emailEl.value.trim();
  const feedbackBox = document.getElementById('form-feedback');
  const mostrarMensagem = (msg, tipo) => {
    feedbackBox.textContent = msg;
    feedbackBox.className = `form-feedback ${tipo}`; // 'success' ou 'error'
    feedbackBox.style.display = 'block';
  };

  feedbackBox.style.display = 'none';
  textoEl.removeAttribute('aria-invalid');
  emailEl.removeAttribute('aria-invalid');

  if (!texto.trim()) {
    textoEl.setAttribute('aria-invalid', 'true');
    textoEl.focus();
    return mostrarMensagem(t('help.msg.empty'), 'error');
  }
  if (!emailEl.checkValidity() || !email.includes('@')) {
    emailEl.setAttribute('aria-invalid', 'true');
    emailEl.focus();
    return mostrarMensagem(t('help.msg.email'), 'error');
  }

  const btn = ajudaForm.querySelector('button[type="submit"]');
  const textoOriginal = btn.innerText;
  btn.innerText = t('help.msg.sending');
  btn.disabled = true;

  try {
    // reCAPTCHA v3 (invisível); garante que o script já carregou
    await carregarReCaptcha();
    const SITE_KEY = window.VITE_RECAPTCHA_SITE_KEY;
    const token = await new Promise((resolve) => {
      if (typeof grecaptcha === 'undefined' || !SITE_KEY) {
        console.error('reCAPTCHA não carregado');
        resolve(null);
        return;
      }
      grecaptcha.ready(() => {
        grecaptcha.execute(SITE_KEY, { action: 'submit' }).then(resolve, () => resolve(null));
      });
    });

    if (!token) throw new Error('Falha ao gerar token de segurança.');

    const res = await fetch('/api/ajuda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: texto, email, captcha: token })
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      mostrarMensagem(t('help.msg.ok'), 'success');
      ajudaForm.reset();
    } else {
      mostrarMensagem(`${t('help.msg.error')} ${data.message || ''}`.trim(), 'error');
    }
  } catch (err) {
    console.error(err);
    mostrarMensagem(t('help.msg.network'), 'error');
  } finally {
    btn.innerText = textoOriginal;
    btn.disabled = false;
  }
}
