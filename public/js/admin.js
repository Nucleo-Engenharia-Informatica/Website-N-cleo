// --- 1. Inicialização e Controlo de Acesso ---
document.addEventListener('DOMContentLoaded', () => {
    const auth = localStorage.getItem('admin_auth');
    const overlay = document.getElementById('login-overlay');
    const btnLogin = document.getElementById('btn-login');
    const inputPass = document.getElementById('admin-pass');

    // Verifica se já existe uma sessão ativa
    if (auth === 'true') {
        if (overlay) overlay.style.display = 'none';
        inicializarDashboard(); 
    } else {
        if (overlay) overlay.style.display = 'flex'; 
    }

    // Listener para o botão de login
    if (btnLogin) {
        btnLogin.addEventListener('click', performLogin);
    }

    // Atalho: Login com a tecla ENTER
    if (inputPass) {
        inputPass.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performLogin();
        });
    }
});

// --- 2. Lógica de Autenticação ---
async function performLogin() {
    const inputPass = document.getElementById('admin-pass');
    const btnLogin = document.getElementById('btn-login');
    const overlay = document.getElementById('login-overlay');
    
    if (!inputPass || !btnLogin) return;

    const pass = inputPass.value;
    btnLogin.innerText = 'A verificar...';
    btnLogin.disabled = true;

    try {
        // Envia a password para a rota definida no server.js
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pass })
        });
        
        const data = await response.json();

        if (data.success) {
            localStorage.setItem('admin_auth', 'true');
            if (overlay) overlay.style.display = 'none';
            inicializarDashboard(); // Só carrega os dados após sucesso
        } else {
            alert('Palavra-passe incorreta!');
            inputPass.value = '';
        }
    } catch (err) {
        console.error("Erro no login:", err);
        alert('Erro ao ligar ao servidor.');
    } finally {
        btnLogin.innerText = 'ENTRAR';
        btnLogin.disabled = false;
    }
}

// --- 3. Carregamento de Dados ---
async function inicializarDashboard() {
    await loadAdminData(); // Carrega o perfil do admin
    const lists = await fetchPedidos(); // Busca todos os pedidos na BD
    renderPedidos(lists); // Desenha as listas na interface
}

// --- 4. Gestão de Pedidos (Lógica de Negócio) ---
async function fetchPedidos() {
    try {
        const res = await fetch('/api/pedidos');
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        
        // Separa pedidos por estado
        return {
            pendentes: arr.filter(p => p.status === 'pending'),
            respondidos: arr.filter(p => p.status === 'respondido')
        };
    } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
        return { pendentes: [], respondidos: [] };
    }
}

function renderPedidos({ pendentes, respondidos }) {
    const lp = document.getElementById('lista-pendentes');
    const lr = document.getElementById('lista-respondidos');
    if(!lp || !lr) return;

    // Renderiza Pendentes
    lp.innerHTML = pendentes.length ? pendentes.map(p => `
        <div class="pedido-card">
            <div class="pedido-meta">
                <span>📅 ${new Date(p.data_envio).toLocaleString('pt-PT')}</span>
                <span style="margin-left: 15px; color: #00d4ff;">📧 ${p.email}</span>
            </div>
            <div class="pedido-text">${p.texto}</div>
            <div class="pedido-actions">
                <textarea id="reply-${p.id}" placeholder="Escrever resposta..."></textarea>
                <button class="btn primary" onclick="responderPedido(${p.id})">Enviar Resposta</button>
                <div id="status-${p.id}" style="margin-top: 10px; font-weight: 600; font-size: 0.9rem;"></div>
            </div>
        </div>
    `).join('') : '<p style="color:var(--muted)">Nenhum pedido pendente.</p>';

    // Renderiza Respondidos
    lr.innerHTML = respondidos.length ? respondidos.map(p => `
        <div class="pedido-card" style="border-left: 4px solid var(--success);">
            <div class="pedido-meta">
                <span>📅 Respondido em: ${new Date(p.data_resposta).toLocaleString('pt-PT')}</span>
                <br><span style="opacity: 0.8;">📧 Para: ${p.email}</span>
            </div>
            <div class="pedido-text" style="margin-bottom: 1rem">${p.texto}</div>
            <div style="background: rgba(63, 185, 80, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid var(--success);">
                <p style="color: var(--success); font-weight: bold; margin:0 0 5px 0;">✅ Resposta enviada:</p>
                <p style="margin:0; white-space: pre-wrap;">${p.resposta}</p>
            </div>
        </div>
    `).join('') : '<p style="color:var(--muted)">Histórico vazio.</p>';
}

// --- 5. Ações Globais (Disponíveis via HTML) ---

// Navegação de abas
window.showView = function(viewId, event) {
    document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    document.getElementById(`view-${viewId}`).classList.add('active');
    if (event) event.currentTarget.classList.add('active');
};

// Responder a um pedido
window.responderPedido = async function(id) {
    const textarea = document.getElementById(`reply-${id}`);
    const statusDiv = document.getElementById(`status-${id}`);
    const btn = event.target;
    
    if (!textarea.value.trim()) {
        statusDiv.style.color = '#ff4444';
        statusDiv.textContent = '⚠️ A resposta não pode estar vazia.';
        return;
    }

    btn.innerText = 'A enviar...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/responder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, resposta: textarea.value })
        });

        if (res.ok) {
            statusDiv.style.color = 'var(--success)';
            statusDiv.textContent = '✅ Resposta enviada e arquivada!';
            
            // Recarrega os dados após 1.5 segundos
            setTimeout(inicializarDashboard, 1500);
        } else {
            throw new Error('Falha no servidor');
        }
    } catch (err) {
        statusDiv.style.color = '#ff4444';
        statusDiv.textContent = '❌ Erro ao enviar resposta.';
        btn.disabled = false;
        btn.innerText = 'Enviar Resposta';
    }
};

// Gestão de Perfil
async function loadAdminData() {
    try {
        const res = await fetch('/api/usuarios'); 
        const data = await res.json();
        const user = Array.isArray(data) ? data[0] : data;
        
        if (user) {
            document.getElementById('perfil-nome').value = user.nome || '';
            document.getElementById('perfil-insta').value = user.instagram_url || '';
            document.getElementById('perfil-linkedin').value = user.linkedin_url || '';
            if (user.foto_url) document.getElementById('profile-img-preview').src = user.foto_url;
            
            // Atualiza o contador de respostas dadas
            const pedidos = await fetch('/api/pedidos').then(r => r.json());
            const respondidosCount = pedidos.filter(p => p.status === 'respondido').length;
            document.getElementById('count-total').textContent = respondidosCount;
        }
    } catch (err) { console.error("Erro no perfil:", err); }
}

window.saveProfile = async function() {
    const payload = {
        nome: document.getElementById('perfil-nome').value,
        instagram_url: document.getElementById('perfil-insta').value,
        linkedin_url: document.getElementById('perfil-linkedin').value,
        foto_url: document.getElementById('profile-img-preview').src
    };

    const res = await fetch('/api/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (res.ok) alert('Perfil atualizado!');
};

// Pré-visualização de Foto
document.getElementById('upload-photo')?.addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = () => document.getElementById('profile-img-preview').src = reader.result;
    reader.readAsDataURL(e.target.files[0]);
});