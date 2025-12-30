import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'pg';
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully:', res.rows[0].now);
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes

// POST /api/ajuda - Handle help requests
app.post('/api/ajuda', async (req, res) => {
  try {
    const { text, at } = req.body || {};

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ message: 'O campo de texto é obrigatório.' });
    }

    const result = await pool.query(
      `INSERT INTO pedidos_ajuda (texto, data_envio, status)
       VALUES ($1, $2, $3)
       RETURNING id, data_envio`,
      [text, at ? new Date(at).toISOString() : new Date().toISOString(), 'pending']
    );

    res.status(200).json({
      message: 'Pedido de ajuda guardado com sucesso.',
      id: result.rows[0].id,
      data_envio: result.rows[0].data_envio
    });

  } catch (error) {
    console.error('Erro ao guardar o pedido de ajuda:', error);
    res.status(500).json({
      message: 'Erro interno do servidor. Não foi possível guardar o pedido.',
      error: error.message
    });
  }
});

// GET /api/usuarios - List all users
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT nome, foto_url, linkedin_url, instagram_url
       FROM usuarios
       ORDER BY nome ASC`
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/usuarios - Update user profile
app.put('/api/usuarios', async (req, res) => {
  try {
    const { nome, foto_url, linkedin_url, instagram_url } = req.body;

    const result = await pool.query(
      `UPDATE usuarios
       SET nome = $1,
           foto_url = $2,
           linkedin_url = $3,
           instagram_url = $4
       WHERE id = 1
       RETURNING id`,
      [nome, foto_url, linkedin_url, instagram_url]
    );

    return res.status(200).json({
      message: 'Perfil atualizado',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/pedidos - Get help requests
app.get('/api/pedidos', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, texto, data_envio, status, resposta, data_resposta
       FROM pedidos_ajuda
       ORDER BY data_envio DESC`
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/responder - Respond to help request
app.post('/api/responder', async (req, res) => {
  try {
    const { id, resposta } = req.body;

    if (!id || !resposta) {
      return res.status(400).json({ message: 'ID e resposta são obrigatórios.' });
    }

    const result = await pool.query(
      `UPDATE pedidos_ajuda
       SET resposta = $1,
           data_resposta = $2,
           status = $3
       WHERE id = $4
       RETURNING id`,
      [resposta, new Date().toISOString(), 'respondido', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    return res.status(200).json({
      message: 'Resposta enviada com sucesso.',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Erro ao responder pedido:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// Handle client-side routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${join(__dirname, 'dist')}`);
  console.log(`🔌 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

async function enviarPedido() {
    const texto = document.getElementById('ajuda-texto').value;
    const email = document.getElementById('ajuda-email').value;
    const captchaToken = grecaptcha.getResponse(); // Pega a resposta do "Não sou um robô"

    // Validações simples
    if (!texto.trim()) return alert('Por favor, descreva o seu pedido.');
    if (!email.includes('@')) return alert('Por favor, indique um email válido.');
    if (!captchaToken) return alert('Por favor, complete a verificação "Não sou um robô".');

    const btn = document.querySelector('#ajuda-form button');
    const textoOriginal = btn.innerText;
    btn.innerText = 'A enviar...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/ajuda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: texto, 
                email: email, 
                captcha: captchaToken 
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Pedido enviado com sucesso! Irá receber a resposta no email.');
            document.getElementById('ajuda-form').reset(); // Limpa o formulário
            grecaptcha.reset(); // Reinicia o captcha para novo uso
        } else {
            alert('Erro: ' + (data.message || 'Ocorreu um problema.'));
        }
    } catch (err) {
        console.error(err);
        alert('Erro de conexão ao servidor.');
    } finally {
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
}