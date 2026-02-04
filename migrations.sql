-- migrations.sql

-- 1. Criar a tabela de pedidos de ajuda
CREATE TABLE IF NOT EXISTS pedidos_ajuda (
    id SERIAL PRIMARY KEY,
    texto TEXT NOT NULL,
    email VARCHAR(255) NOT NULL, 
    data_envio TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending',
    resposta TEXT,
    data_resposta TIMESTAMP, 
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE pedidos_ajuda ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE pedidos_ajuda ADD COLUMN IF NOT EXISTS data_resposta TIMESTAMP;

-- 2. Criar a tabela de utilizadores
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    foto_url TEXT,
    linkedin_url TEXT,
    instagram_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Inserir o utilizador inicial (Garante que o ID 1 existe para o teu UPDATE no server.js)
INSERT INTO usuarios (id, nome) 
VALUES (1, 'Admin Principal') 
ON CONFLICT (id) DO NOTHING;

-- 4. Otimização: Índice para buscas rápidas (usado na listagem admin)
CREATE INDEX IF NOT EXISTS idx_pedidos_data_envio ON pedidos_ajuda(data_envio DESC);