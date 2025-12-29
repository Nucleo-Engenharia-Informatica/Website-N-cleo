-- Database initialization script for Núcleo de Engenharia Informática

-- Create pedidos_ajuda table (Help requests)
CREATE TABLE IF NOT EXISTS pedidos_ajuda (
    id SERIAL PRIMARY KEY,
    texto TEXT NOT NULL,
    data_envio TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending',
    resposta TEXT,
    data_resposta TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create usuarios table (Team members)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    foto_url TEXT,
    linkedin_url TEXT,
    instagram_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos_ajuda(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_data_envio ON pedidos_ajuda(data_envio DESC);
CREATE INDEX IF NOT EXISTS idx_usuarios_nome ON usuarios(nome);

-- Insert sample data for testing (optional - remove in production)
INSERT INTO usuarios (nome, foto_url, linkedin_url, instagram_url) VALUES
('Admin User', 'https://picsum.photos/200', 'https://linkedin.com', 'https://instagram.com')
ON CONFLICT DO NOTHING;

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_pedidos_ajuda_updated_at ON pedidos_ajuda;
CREATE TRIGGER update_pedidos_ajuda_updated_at
    BEFORE UPDATE ON pedidos_ajuda
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neondb_owner;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO neondb_owner;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database initialized successfully!';
END $$;
