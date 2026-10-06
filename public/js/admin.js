// --- 0. Utilitários ---
// Escapa texto vindo da BD antes de o meter em innerHTML (evita XSS).
function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function mostrarLogin() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'flex';
}

// fetch para a API do admin: a sessão vai no cookie httpOnly; um 401 volta ao login.
async function apiFetch(url, options = {}) {
    const res = await fetch(url, { credentials: 'same-origin', ...options });
    if (res.status === 401) {
        mostrarLogin();
        throw new Error('Sessão expirada');
    }
    return res;
}

// --- 1. Inicialização e Controlo de Acesso ---
document.addEventListener('DOMContentLoaded', async () => {
    const overlay = document.getElementById('login-overlay');
    const btnLogin = document.getElementById('btn-login');
    const inputPass = document.getElementById('admin-pass');

    // Verifica no servidor se já existe uma sessão ativa
    let autenticado = false;
    try {
        const res = await fetch('/api/session', { credentials: 'same-origin' });
        autenticado = (await res.json()).authenticated === true;
    } catch (err) {
        console.error('Erro ao verificar sessão:', err);
    }

    if (autenticado) {
        if (overlay) overlay.style.display = 'none';
        inicializarDashboard();
    } else {
        mostrarLogin();
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
            inputPass.value = '';
            if (overlay) overlay.style.display = 'none';
            inicializarDashboard(); // Só carrega os dados após sucesso
        } else if (response.status === 429) {
            alert('Demasiadas tentativas falhadas. Tente novamente daqui a 15 minutos.');
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

// Termina a sessão (apaga o cookie no servidor)
window.logout = async function() {
    try {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
        location.reload();
    }
};

// --- 3. Carregamento de Dados ---
async function inicializarDashboard() {
    await loadAdminData(); // Carrega o perfil do admin
    const lists = await fetchPedidos(); // Busca todos os pedidos na BD
    renderPedidos(lists); // Desenha as listas na interface
}

// --- 4. Gestão de Pedidos (Lógica de Negócio) ---
async function fetchPedidos() {
    try {
        const res = await apiFetch('/api/pedidos');
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
                <span style="margin-left: 15px; color: #00d4ff;">📧 ${escapeHtml(p.email)}</span>
            </div>
            <div class="pedido-text">${escapeHtml(p.texto)}</div>
            <div class="pedido-actions">
                <label for="reply-${p.id}" class="sr-only">Resposta ao pedido de ${escapeHtml(p.email)}</label>
                <textarea id="reply-${p.id}" placeholder="Escrever resposta..."></textarea>
                <button type="button" class="btn primary" onclick="responderPedido(${p.id}, event)">Enviar Resposta</button>
                <button type="button" class="btn small" onclick="apagarPedido(${p.id})" style="margin-left: 8px;">Apagar</button>
                <div id="status-${p.id}" role="status" style="margin-top: 10px; font-weight: 600; font-size: 0.9rem;"></div>
            </div>
        </div>
    `).join('') : '<p style="color:var(--muted)">Nenhum pedido pendente.</p>';

    // Renderiza Respondidos
    lr.innerHTML = respondidos.length ? respondidos.map(p => `
        <div class="pedido-card" style="border-left: 4px solid var(--success);">
            <div class="pedido-meta">
                <span>📅 Respondido em: ${new Date(p.data_resposta).toLocaleString('pt-PT')}</span>
                <br><span style="opacity: 0.8;">📧 Para: ${escapeHtml(p.email)}</span>
            </div>
            <div class="pedido-text" style="margin-bottom: 1rem">${escapeHtml(p.texto)}</div>
            <div style="background: rgba(63, 185, 80, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid var(--success);">
                <p style="color: var(--success); font-weight: bold; margin:0 0 5px 0;">✅ Resposta enviada:</p>
                <p style="margin:0; white-space: pre-wrap;">${escapeHtml(p.resposta)}</p>
            </div>
            <button type="button" class="btn small" onclick="apagarPedido(${p.id})" style="margin-top: 1rem;">Apagar</button>
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
window.responderPedido = async function(id, event) {
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
        const res = await apiFetch('/api/responder', {
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

// Apagar um pedido (RGPD: os dados não precisam de ficar guardados)
window.apagarPedido = async function(id) {
    if (!confirm('Apagar este pedido de forma permanente?')) return;
    try {
        const res = await apiFetch(`/api/pedidos/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Falha no servidor');
        inicializarDashboard();
    } catch (err) {
        console.error('Erro ao apagar pedido:', err);
        alert('Não foi possível apagar o pedido.');
    }
};

// Gestão de Perfil
let fotoAtual = null; // data URL da foto (já redimensionada) ou null
async function loadAdminData() {
    try {
        const res = await apiFetch('/api/usuarios');
        const data = await res.json();
        const user = Array.isArray(data) ? data[0] : data;

        if (user) {
            document.getElementById('perfil-nome').value = user.nome || '';
            document.getElementById('perfil-insta').value = user.instagram_url || '';
            document.getElementById('perfil-linkedin').value = user.linkedin_url || '';
            if (user.foto_url) {
                fotoAtual = user.foto_url;
                document.getElementById('profile-img-preview').src = user.foto_url;
            }

            // Atualiza o contador de respostas dadas
            const pedidos = await apiFetch('/api/pedidos').then(r => r.json());
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
        foto_url: fotoAtual
    };

    try {
        const res = await apiFetch('/api/usuarios', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        alert(res.ok ? 'Perfil atualizado!' : (data.error || 'Erro ao guardar o perfil.'));
    } catch (err) {
        console.error('Erro ao guardar perfil:', err);
    }
};

// Foto: redimensionada no browser para 256x256 (WebP) antes de ser enviada,
// para não ultrapassar o limite do pedido (as fotos de telemóvel têm vários MB)
function redimensionarFoto(file, size = 256) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const lado = Math.min(img.width, img.height);
            const canvas = document.createElement('canvas');
            canvas.width = size; canvas.height = size;
            canvas.getContext('2d').drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, size, size);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/webp', 0.85));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Imagem inválida')); };
        img.src = url;
    });
}

document.getElementById('upload-photo')?.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
        fotoAtual = await redimensionarFoto(file);
        document.getElementById('profile-img-preview').src = fotoAtual;
    } catch (err) {
        alert('Não foi possível ler a imagem.');
    }
});
