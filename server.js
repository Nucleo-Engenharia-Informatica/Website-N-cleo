import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'pg';
import nodemailer from 'nodemailer';
import fs from 'fs';
import crypto from 'crypto';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const ADMIN_PASS = process.env.ADMIN_PASS || (process.env.NODE_ENV === 'production' ? null : '1234');
if (!ADMIN_PASS) {
  console.error('❌ ADMIN_PASS não definido: o login do admin fica desativado.');
}

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false
});

const runMigrations = async () => {
  try {
    const sqlPath = join(__dirname, 'migrations.sql');

    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await pool.query(sql);
      console.log('✅ Base de Dados: Tabelas e colunas verificadas/criadas com sucesso.');
    } else {
      console.warn('⚠️ Aviso: migrations.sql não encontrado. A criação automática de tabelas foi ignorada.');
    }
  } catch (err) {
    console.error('❌ Erro crítico ao executar migrações automáticas:', err.message);
    // Não paramos o servidor, mas o log avisará o professor se algo falhar na BD
  }
};

// Test DB Connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('❌ Erro ao conectar BD:', err);
  else console.log('✅ Base de dados conectada:', res.rows[0].now);
});


// CONFIGURAÇÃO DO NODEMAILER (EMAIL) ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Ex: smtp.gmail.com ou sandbox.smtp.mailtrap.io
  port: process.env.SMTP_PORT, // Ex: 587 ou 2525
  secure: false, // true apenas para a porta 465, false para outras
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verificar se o servidor de email está pronto (COM PROTEÇÃO PARA BUILD)
if (process.env.SMTP_HOST) {
  transporter.verify(function (error, success) {
    if (error) {
      console.log('❌ Erro na configuração do Email (SMTP):', error);
    } else {
      console.log('✅ Servidor de Email pronto a enviar.');
    }
  });
} else {
  console.log('⚠️ Aviso: Credenciais SMTP não encontradas. O envio de emails não funcionará neste ambiente.');
}

// Middleware
// O nginx está à frente da app (um proxy): req.ip passa a ser o IP do cliente
// que o nginx acrescenta ao X-Forwarded-For.
app.set('trust proxy', 1);
app.use(express.json({ limit: '300kb' }));
app.use(express.urlencoded({ extended: true }));

// --- SESSÃO DO ADMIN ---
// Cookie httpOnly assinado com HMAC: "<expira em ms>.<assinatura>".
// O segredo é gerado no arranque, por isso um restart termina as sessões.
const SESSION_COOKIE = 'nei_admin';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const SESSION_SECRET = crypto.randomBytes(32);

const sign = (value) => crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');

const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

const getCookie = (req, name) => {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
};

const isAdmin = (req) => {
  const token = getCookie(req, SESSION_COOKIE);
  if (!token) return false;
  const [expires, sig] = token.split('.');
  if (!expires || !sig || !safeEqual(sig, sign(expires))) return false;
  return Number(expires) > Date.now();
};

const requireAdmin = (req, res, next) => {
  if (isAdmin(req)) return next();
  res.status(401).json({ message: 'Sessão inválida ou expirada.' });
};

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api',
});

// Limite de tentativas de login falhadas por IP (em memória).
const LOGIN_MAX_FAILS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const loginFails = new Map();

const loginBlocked = (ip) => {
  const entry = loginFails.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > LOGIN_WINDOW_MS) {
    loginFails.delete(ip);
    return false;
  }
  return entry.count >= LOGIN_MAX_FAILS;
};

const registerLoginFail = (ip) => {
  const entry = loginFails.get(ip);
  if (!entry || Date.now() - entry.first > LOGIN_WINDOW_MS) {
    loginFails.set(ip, { count: 1, first: Date.now() });
  } else {
    entry.count++;
  }
};

const escapeHtml = (str) => String(str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// --- API ROUTES ---

// 1. Login / Logout / Sessão do Admin
app.post('/api/login', (req, res) => {
  const ip = req.ip;
  if (loginBlocked(ip)) {
    console.warn(`🔒 Login bloqueado (demasiadas tentativas): ${ip}`);
    return res.status(429).json({ success: false, message: 'Demasiadas tentativas. Tente mais tarde.' });
  }

  const { password } = req.body || {};
  if (!ADMIN_PASS || typeof password !== 'string' || !safeEqual(password, ADMIN_PASS)) {
    registerLoginFail(ip);
    console.warn(`🔒 Login falhado: ${ip}`);
    return res.status(401).json({ success: false, message: 'Password incorreta' });
  }

  loginFails.delete(ip);
  const expires = String(Date.now() + SESSION_TTL_MS);
  res.cookie(SESSION_COOKIE, `${expires}.${sign(expires)}`, { ...cookieOptions(), maxAge: SESSION_TTL_MS });
  res.json({ success: true });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
  res.json({ success: true });
});

app.get('/api/session', (req, res) => {
  res.json({ authenticated: isAdmin(req) });
});


app.get('/api/config', (req, res) => {
  res.json({
    siteKey: process.env.VITE_RECAPTCHA_SITE_KEY || ''
  });
});

// 2. Receber Pedido de Ajuda (Com Email e Captcha)
app.post('/api/ajuda', async (req, res) => {

  try {
    const { text, email, captcha } = req.body;

    // Validações
    if (typeof text !== 'string' || typeof email !== 'string' || !text.trim() || !email.trim()) {
      return res.status(400).json({ message: 'Texto e email são obrigatórios.' });
    }
    if (text.length > 5000 || email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Dados inválidos.' });
    }

    // Verificar ReCaptcha com a Google (obrigatório quando há secret configurado)
    if (RECAPTCHA_SECRET) {
        if (typeof captcha !== 'string' || !captcha) {
            return res.status(400).json({ message: 'Verificação de segurança em falta.' });
        }
        const googleRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            body: new URLSearchParams({ secret: RECAPTCHA_SECRET, response: captcha, remoteip: req.ip }),
        });
        const googleData = await googleRes.json();
        if (!googleData.success || googleData.score < 0.5) {
            console.warn('Bot bloqueado pelo Recaptcha:', googleData);
            return res.status(400).json({ message: 'Atividade suspeita detetada.' });
        }
    }

    // Inserir na BD
    const result = await pool.query(
      `INSERT INTO pedidos_ajuda (texto, email, data_envio, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [text.trim(), email.trim(), new Date().toISOString(), 'pending']
    );

    res.status(200).json({ message: 'Pedido enviado!', id: result.rows[0].id });

  } catch (error) {
    console.error('Erro no pedido de ajuda:', error);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// 3. Listar Pedidos (Para o Admin)
app.get('/api/pedidos', requireAdmin, async (req, res) => {
  try {
    // Agora incluímos o email na seleção
    const result = await pool.query(
      `SELECT id, texto, email, data_envio, status, resposta, data_resposta
       FROM pedidos_ajuda ORDER BY data_envio DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// 3b. Apagar um pedido (Admin)
app.delete('/api/pedidos/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'ID inválido.' });
  try {
    const result = await pool.query('DELETE FROM pedidos_ajuda WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Pedido não encontrado.' });
    res.json({ message: 'Pedido apagado.' });
  } catch (error) {
    console.error('Erro ao apagar pedido:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// 4. Responder a Pedido (COM ENVIO DE EMAIL)
app.post('/api/responder', requireAdmin, async (req, res) => {
  try {
    const { id, resposta } = req.body;
    if (!id || typeof resposta !== 'string' || !resposta.trim()) return res.status(400).json({ message: 'Dados incompletos.' });

    // PASSO A: Buscar o email e a pergunta original
    const pedidoQuery = await pool.query('SELECT email, texto FROM pedidos_ajuda WHERE id = $1', [id]);

    if (pedidoQuery.rowCount === 0) {
        return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    const emailDestino = pedidoQuery.rows[0].email;
    const perguntaOriginal = pedidoQuery.rows[0].texto;

    // PASSO B: Enviar o Email via Nodemailer
    // Nota: O await aqui garante que só atualizamos a BD se o email for enviado sem erro
    await transporter.sendMail({
      from: `"Núcleo EI" <${process.env.SMTP_USER}>`, // Nome e Email do Remetente
      to: emailDestino,
      subject: `Resposta ao teu pedido #${id} - Núcleo EI`,
      text: `Olá!\n\nRecebemos o teu pedido: "${perguntaOriginal}"\n\nNossa Resposta:\n${resposta}\n\nCumprimentos,\nEquipa NEI`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #0d1117; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h2 style="color: #00d9a3; margin: 0;">Núcleo EI</h2>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
                <p>Olá! 👋</p>
                <p>Obrigado por entrares em contacto connosco.</p>

                <div style="background-color: #f6f8fa; padding: 15px; border-left: 4px solid #00d9a3; margin: 20px 0;">
                    <small style="color: #666; display: block; margin-bottom: 5px;">A tua pergunta:</small>
                    <em style="color: #24292f;">"${escapeHtml(perguntaOriginal).replace(/\n/g, '<br>')}"</em>
                </div>

                <h3>A nossa resposta:</h3>
                <p style="font-size: 16px; line-height: 1.6; color: #24292f;">
                    ${escapeHtml(resposta).replace(/\n/g, '<br>')}
                </p>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #888; text-align: center;">
                    Esta é uma mensagem automática do sistema do Núcleo de Engenharia Informática.<br>
                    Universidade Fernando Pessoa
                </p>
            </div>
        </div>
      `,
    });

    console.log(`📧 Email enviado com sucesso para ${emailDestino}`);

    // PASSO C: Atualizar a Base de Dados
    const result = await pool.query(
      `UPDATE pedidos_ajuda
       SET resposta = $1, data_resposta = $2, status = 'respondido'
       WHERE id = $3 RETURNING id`,
      [resposta, new Date().toISOString(), id]
    );


    if (result.rowCount === 0) return res.status(404).json({ message: 'Pedido não encontrado.' });

    // RESPOSTA FINAL (CORRIGIDA: Apenas uma resposta JSON)
    res.json({ message: 'Resposta enviada por email e guardada.' });

  } catch (error) {
    console.error("❌ Erro ao responder:", error);
    // Garantir que enviamos apenas uma resposta de erro se algo falhar
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao enviar email ou guardar na BD.' });
    }
  }
});



// 5. Perfil Admin (Ler e Atualizar)
app.get('/api/usuarios', requireAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios LIMIT 1');
        res.json(result.rows);
    } catch (e) {
        console.error('Erro ao ler perfil:', e);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

app.put('/api/usuarios', requireAdmin, async (req, res) => {
    try {
        const { nome, linkedin_url, instagram_url, foto_url } = req.body;
        const isUrl = (v) => !v || (typeof v === 'string' && /^https:\/\/[^\s<>"]+$/.test(v) && v.length <= 500);
        if (typeof nome !== 'string' || !nome.trim() || nome.length > 255) {
            return res.status(400).json({ error: 'Nome inválido.' });
        }
        if (!isUrl(linkedin_url) || !isUrl(instagram_url)) {
            return res.status(400).json({ error: 'Os links têm de começar por https://' });
        }
        if (foto_url && (typeof foto_url !== 'string' || !/^data:image\/(webp|png|jpeg);base64,/.test(foto_url) || foto_url.length > 250000)) {
            return res.status(400).json({ error: 'Foto inválida ou demasiado grande.' });
        }
        // Assume que existe um user com ID 1
        await pool.query(
            `UPDATE usuarios SET nome=$1, linkedin_url=$2, instagram_url=$3,
                    foto_url=COALESCE($4, foto_url), updated_at=NOW() WHERE id=1`,
            [nome.trim(), linkedin_url || null, instagram_url || null, foto_url || null]
        );
        res.json({ message: 'Perfil atualizado' });
    } catch (e) {
        console.error('Erro ao atualizar perfil:', e);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

// Servir Ficheiros Estáticos (Frontend)
// Nota: O Docker copia para 'dist', mas localmente pode ser 'public'.
// O código abaixo tenta servir do 'dist' primeiro.
app.get('/health', (req, res) => res.type('text').send('ok'));

// A página de parceiros foi removida (só tinha exemplos); links antigos vão para a homepage
app.get(['/parceiros', '/parceiros.html'], (req, res) => res.redirect(301, '/'));

app.use(express.static(join(__dirname, 'dist'), { extensions: ['html'] }));

// Tudo o resto não existe: 404 (JSON na API, página 404 no resto)
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.status(404).sendFile(join(__dirname, 'dist', '404.html'));
});

// RGPD: os pedidos de ajuda (com email) são apagados ao fim de 12 meses,
// como indicado no formulário. Corre no arranque e depois uma vez por dia.
const RETENCAO_PEDIDOS = '12 months';
const limparPedidosAntigos = async () => {
  try {
    const result = await pool.query(
      `DELETE FROM pedidos_ajuda WHERE data_envio < NOW() - $1::interval`,
      [RETENCAO_PEDIDOS]
    );
    if (result.rowCount > 0) console.log(`🧹 Apagados ${result.rowCount} pedidos com mais de ${RETENCAO_PEDIDOS}.`);
  } catch (err) {
    console.error('Erro ao apagar pedidos antigos:', err.message);
  }
};

// Em vez de ligar o servidor logo, garantimos que as migrações correm primeiro.
const startServer = async () => {
  // Executa a verificação/criação das tabelas antes de aceitar conexões
  await runMigrations();
  await limparPedidosAntigos();
  setInterval(limparPedidosAntigos, 24 * 60 * 60 * 1000).unref();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor autónomo a correr na porta ${PORT}`);
  });
};

startServer();
