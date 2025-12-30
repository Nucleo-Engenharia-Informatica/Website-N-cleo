// admin.js

// 1. Verificação de Login e Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const auth = localStorage.getItem('admin_auth');
    const overlay = document.getElementById('login-overlay');
    
    if (auth === 'true') {
        if (overlay) overlay.style.display = 'none';
        loadAdminData(); // Carrega perfil do utilizador 1 da Neon
    } else {
        if (overlay) overlay.style.display = 'flex'; 
    }
    
    // Carregar pedidos iniciais
    fetchPedidos().then(lists => renderPedidos(lists));
});

window.checkPass = function() {
    const pass = document.getElementById('admin-pass').value;
    if (pass === '1234') { 
        document.getElementById('login-overlay').style.display = 'none';
        localStorage.setItem('admin_auth', 'true');
        loadAdminData();
    } else {
        alert('Palavra-passe incorreta!');
    }
};

// 2. Navegação Lateral
window.showView = function(viewId, event) {
    document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    document.getElementById(`view-${viewId}`).classList.add('active');
    if (event) event.currentTarget.classList.add('active');
};

// 3. Gestão do Perfil (Ligação à tabela 'usuarios')
async function loadAdminData() {
    try {
        const res = await fetch('/api/usuarios'); 
        if (res.ok) {
            const data = await res.json();
            // Assume-se que o admin é o primeiro utilizador da tabela
            const user = Array.isArray(data) ? data[0] : data;
            
            if (user) {
                document.getElementById('perfil-nome').value = user.nome || '';
                document.getElementById('perfil-insta').value = user.instagram_url || '';
                document.getElementById('perfil-linkedin').value = user.linkedin_url || '';
                if (user.foto_url) document.getElementById('profile-img-preview').src = user.foto_url;
                // Exibe total de respostas (calculado pela query SQL com subquery)
                document.getElementById('count-total').textContent = user.total_respostas || 0;
            }
        }
    } catch (err) {
        console.error("Erro ao carregar dados do perfil:", err);
    }
}

// Upload de Foto para Pré-visualização
document.getElementById('upload-photo')?.addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function() {
        document.getElementById('profile-img-preview').src = reader.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

window.saveProfile = async function() {
    const payload = {
        nome: document.getElementById('perfil-nome').value,
        instagram_url: document.getElementById('perfil-insta').value,
        linkedin_url: document.getElementById('perfil-linkedin').value,
        foto_url: document.getElementById('profile-img-preview').src
    };

    try {
        const res = await fetch('/api/usuarios', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) alert('Perfil atualizado com sucesso!');
        else alert('Erro ao guardar no servidor.');
    } catch (err) {
        console.error("Erro ao salvar:", err);
    }
};

// 4. Gestão de Pedidos (Pendentes e Respondidos)
async function fetchPedidos() {
    try {
        const res = await fetch('/api/pedidos');
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        
        return {
            pendentes: arr.filter(p => !p.resposta),
            respondidos: arr.filter(p => p.resposta)
        };
    } catch (err) {
        return { pendentes: [], respondidos: [] };
    }
}

function renderPedidos({ pendentes, respondidos }) {
    const lp = document.getElementById('lista-pendentes');
    const lr = document.getElementById('lista-respondidos');
    if(!lp || !lr) return;

    // --- LISTA DE PENDENTES (Para responder) ---
    lp.innerHTML = pendentes.length ? pendentes.map(p => `
        <div class="pedido-card">
            <div class="pedido-meta">
                <span>📅 ${new Date(p.data_envio).toLocaleString('pt-PT')}</span>
                <span style="margin-left: 15px; color: #00d4ff;">📧 ${p.email || 'Sem email'}</span>
            </div>
            
            <div class="pedido-text">${p.texto}</div>
            
            <div class="pedido-actions">
                <textarea id="reply-${p.id}" placeholder="Escrever resposta técnica..."></textarea>
                <button class="btn primary" onclick="responderPedido(${p.id})">Enviar Resposta</button>
            </div>
        </div>
    `).join('') : '<p style="color:var(--muted)">Nenhum pedido pendente.</p>';

    // --- LISTA DE RESPONDIDOS (Histórico) ---
    lr.innerHTML = respondidos.length ? respondidos.map(p => `
        <div class="pedido-card" style="border-left: 4px solid var(--success);">
            <div class="pedido-meta">
                <span>📅 Respondido a: ${p.data_resposta ? new Date(p.data_resposta).toLocaleString('pt-PT') : 'N/A'}</span>
                <br>
                <span style="font-size: 0.9em; opacity: 0.8;">📧 Enviado para: ${p.email || 'Sem email'}</span>
            </div>
            
            <p style="color: var(--dark-text-muted); font-size: 0.9rem; margin-bottom:0.5rem">Pedido:</p>
            <div class="pedido-text" style="margin-bottom: 1.5rem">${p.texto}</div>
            
            <div style="background: rgba(63, 185, 80, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid var(--success);">
                <p style="color: var(--success); font-weight: bold; margin:0 0 0.5rem 0;">✅ Resposta:</p>
                <p style="margin:0; color: var(--dark-text);">${p.resposta}</p>
            </div>
        </div>
    `).join('') : '<p style="color:var(--muted)">Histórico vazio.</p>';
}

window.responderPedido = async function(id) {
    const textoResposta = document.getElementById(`reply-${id}`).value;
    if (!textoResposta) return;

    try {
        const res = await fetch('/api/responder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, resposta: textoResposta })
        });

        if (res.ok) {
            const lists = await fetchPedidos();
            renderPedidos(lists);
            loadAdminData(); // Atualiza contador de respostas
        }
    } catch (err) {
        console.error("Erro ao responder:", err);
    }
};