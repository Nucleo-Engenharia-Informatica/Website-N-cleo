// quem.js

// 1. Observer para animações (Certifique-se que as classes CSS existem)
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal'); });
}, { threshold: 0.15 });

document.addEventListener('DOMContentLoaded', initQuemSomos);

async function initQuemSomos() {
    // Corrigido para 'team-lista' para corresponder ao seu HTML
    const teamGrid = document.getElementById('team-lista');
    if (!teamGrid) return;

    teamGrid.innerHTML = '<p class="loading">A carregar membros da equipa...</p>';

    try {
        // Corrigido caminho para /api/usuarios
        const response = await fetch('/api/usuarios');
        
        if (!response.ok) throw new Error('Erro ao carregar membros');

        const membros = await response.json();

        if (membros.length === 0) {
            teamGrid.innerHTML = '<p>Ainda não existem membros registados.</p>';
            return;
        }

        teamGrid.innerHTML = '';

        membros.forEach(membro => {
            const card = document.createElement('article');
            card.className = 'card reveal-on-scroll'; 
            
            card.innerHTML = `
                <img src="${membro.foto_url || 'https://picsum.photos/360/360'}" 
                     alt="${membro.nome}" 
                     style="width: 100%; aspect-ratio: 1/1; object-fit: cover;">
                <div class="card-body">
                    <h3>${membro.nome}</h3>
                    <p class="muted">Membro do Núcleo</p>
                    <div class="social-links" style="margin-top: 10px; display: flex; gap: 10px;">
                        ${membro.linkedin_url ? `<a href="${membro.linkedin_url}" target="_blank">LinkedIn</a>` : ''}
                        ${membro.instagram_url ? `<a href="${membro.instagram_url}" target="_blank">Instagram</a>` : ''}
                    </div>
                </div>
            `;
            
            teamGrid.appendChild(card);
            observer.observe(card);
        });

    } catch (error) {
        console.error('Falha ao carregar equipa:', error);
        teamGrid.innerHTML = '<p style="color: red;">Não foi possível carregar os membros da equipa.</p>';
    }
}