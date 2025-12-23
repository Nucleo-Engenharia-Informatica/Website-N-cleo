// admin.js

// 1. Navegação e UI - Corrigido para receber o 'event'
window.showView = function(viewId, event) {
  document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  
  document.getElementById(`view-${viewId}`).classList.add('active');
  if (event) event.currentTarget.classList.add('active');
};

// 2. Sistema de Login (Simples)
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

if (localStorage.getItem('admin_auth') === 'true') {
  document.getElementById('login-overlay').style.display = 'none';
}

// 3. Gestão do Perfil - Corrigido caminho para /api/usuarios
async function loadAdminData() {
  try {
    const res = await fetch('/api/usuarios'); 
    if (res.ok) {
      const data = await res.json();
      // Se a API retornar uma lista, pegamos o primeiro (admin)
      const user = Array.isArray(data) ? data[0] : data;
      
      if (user) {
        document.getElementById('perfil-nome').value = user.nome || '';
        document.getElementById('perfil-insta').value = user.instagram_url || '';
        document.getElementById('perfil-linkedin').value = user.linkedin_url || '';
        if (user.foto_url) document.getElementById('profile-img-preview').src = user.foto_url;
        // O contador virá do campo calculado na sua query SQL futura
        document.getElementById('count-total').textContent = user.total_respostas || 0;
      }
    }
  } catch (err) {
    console.error("Erro ao carregar dados do perfil:", err);
  }
}

// Upload de Foto
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
    
    if (res.ok) {
      alert('Perfil atualizado com sucesso!');
    } else {
      alert('Erro ao guardar no servidor.');
    }
  } catch (err) {
    console.error("Erro ao salvar:", err);
  }
};

// 4. Gestão de Pedidos - Corrigido caminho para /api/pedidos
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
    console.error("Erro ao procurar pedidos:", err);
    return { pendentes: [], respondidos: [] };
  }
}

function renderPedidos({ pendentes, respondidos }) {
  const lp = document.getElementById('lista-pendentes');
  const lr = document.getElementById('lista-respondidos');
  if(!lp || !lr) return;

  lp.innerHTML = pendentes.map(p => `
    <div class="pedido-card">
      <div class="pedido-meta">${new Date(p.data_envio).toLocaleString('pt-PT')}</div>
      <p>${p.texto}</p>
      <div class="pedido-actions">
        <textarea id="reply-${p.id}" placeholder="Escrever resposta..."></textarea>
        <button class="btn primary" onclick="responderPedido(${p.id})">Responder</button>
      </div>
    </div>
  `).join('');

  lr.innerHTML = respondidos.map(p => `
    <div class="pedido-card">
      <div class="pedido-meta">Enviado em: ${new Date(p.data_envio).toLocaleString('pt-PT')}</div>
      <p><strong>Pedido:</strong> ${p.texto}</p>
      <p style="color: var(--primary)"><strong>Resposta:</strong> ${p.resposta}</p>
    </div>
  `).join('');
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
      loadAdminData(); 
    }
  } catch (err) {
    console.error("Erro ao responder:", err);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const lists = await fetchPedidos();
  renderPedidos(lists);
  if (localStorage.getItem('admin_auth') === 'true') loadAdminData();
});