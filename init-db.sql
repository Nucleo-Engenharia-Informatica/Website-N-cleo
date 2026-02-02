-- 1. Criar a tabela de pedidos (COM a coluna email que faltava)
CREATE TABLE IF NOT EXISTS pedidos_ajuda (
    id SERIAL PRIMARY KEY,
    texto TEXT NOT NULL,
    email VARCHAR(255) NOT NULL, -- Coluna obrigatória para o server.js
    data_envio TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending',
    resposta TEXT,
    data_resposta TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Criar a tabela de utilizadores (Admin)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    foto_url TEXT,
    linkedin_url TEXT,
    instagram_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Inserir um utilizador inicial para poderes usar o Painel Admin
INSERT INTO usuarios (id, nome) 
VALUES (1, 'Admin Principal') 
ON CONFLICT (id) DO NOTHING;

-- 4. Função e Trigger para atualizar o timestamp automaticamente (opcional, mas bom)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pedidos_ajuda_updated_at ON pedidos_ajuda;
CREATE TRIGGER update_pedidos_ajuda_updated_at
    BEFORE UPDATE ON pedidos_ajuda
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();