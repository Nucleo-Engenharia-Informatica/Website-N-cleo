// quem.js

// i18n translations
const i18n = {
  pt: {
    'nav.quem': 'Quem Somos',
    'nav.fazemos': 'O que Fazemos',
    'nav.sobre': 'Sobre o Curso',
    'nav.noticias': 'Notícias e Eventos',
    'nav.contactos': 'Contactos',
    'page.quem.hero': 'A Nossa Equipa',
    'page.quem.title': 'Membros do Núcleo',
    'page.quem.subtitle': 'Estudantes apaixonados por tecnologia que dinamizam a comunidade de Engenharia Informática da UFP.'
  },
  en: {
    'nav.quem': 'Who We Are',
    'nav.fazemos': 'What We Do',
    'nav.sobre': 'About the Course',
    'nav.noticias': 'News & Events',
    'nav.contactos': 'Contact',
    'page.quem.hero': 'Our Team',
    'page.quem.title': 'Nucleus Members',
    'page.quem.subtitle': 'Technology-passionate students who drive the UFP Computer Engineering community.'
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
  });
}

// Observer para as animações de scroll
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal'); });
}, { threshold: 0.15 });

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

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

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initQuemSomos();
  applyLangToDom();
  initLangToggle();
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

// Função que gera dados fictícios (Placeholders)
function getPlaceholders(count = 20) {
    return Array.from({ length: count }, (_, i) => ({
        nome: `Membro ${i + 1}`,
        cargo: "Membro do Núcleo",
        foto_url: `https://picsum.photos/seed/${i + 100}/360/360`,
        linkedin_url: "https://linkedin.com",
        github_url: "https://github.com"
    }));
}

async function initQuemSomos() {
    // Sincronizado com o id="team-lista" do seu HTML
    const teamGrid = document.getElementById('team-lista');
    if (!teamGrid) return;

    /* IMPLEMENTAÇÃO FUTURA COM BASE DE DADOS:
    try {
        const response = await fetch('/api/usuarios');
        if (!response.ok) throw new Error();
        const membros = await response.json();
        renderMembros(membros);
    } catch (error) {
        console.error("Erro ao carregar da base de dados, a usar placeholders.");
        renderMembros(getPlaceholders());
    }
    */

    // Por agora, utiliza apenas os placeholders
    renderMembros(getPlaceholders());
}

function renderMembros(lista) {
    const teamGrid = document.getElementById('team-lista');
    if (!teamGrid) return; // Garante que o elemento existe
    teamGrid.innerHTML = '';

    lista.forEach(membro => {
        const card = document.createElement('article');
        card.className = 'card reveal-on-scroll'; 
        
        card.innerHTML = `
            <img src="${membro.foto_url}" alt="${membro.nome}" style="width: 100%; aspect-ratio: 1/1; object-fit: cover;">
            <div class="card-body">
                <h3>${membro.nome}</h3>
                <p class="muted">${membro.cargo}</p>
                <div class="social-links" style="margin-top: 12px; display: flex; gap: 15px; justify-content: center;">
                    <a href="${membro.linkedin_url}" target="_blank" aria-label="LinkedIn" style="color: inherit; font-size: 1.2rem;">
                        <i class="fa-brands fa-linkedin"></i>
                    </a>
                    <a href="${membro.github_url}" target="_blank" aria-label="GitHub" style="color: inherit; font-size: 1.2rem;">
                        <i class="fa-brands fa-github"></i>
                    </a>
                </div>
            </div>
        `;
        
        teamGrid.appendChild(card);
        observer.observe(card); // Ativa a animação de scroll no novo card
    });
}