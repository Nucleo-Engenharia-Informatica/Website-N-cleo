import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async (req, res) => {
  // GET: Listar todos os usuários (Para a página Quem Somos)
  if (req.method === 'GET') {
    try {
      const membros = await sql`
        SELECT nome, foto_url, linkedin_url, instagram_url 
        FROM usuarios 
        ORDER BY nome ASC;
      `;
      return res.status(200).json(membros);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // PUT: Atualizar perfil do Admin (Para a página Admin)
  if (req.method === 'PUT') {
    try {
      const { nome, foto_url, linkedin_url, instagram_url } = req.body;
      
      // Nota: Num sistema real, usaríamos o ID da sessão do usuário logado.
      // Aqui vamos atualizar o primeiro usuário como exemplo.
      const result = await sql`
        UPDATE usuarios 
        SET nome = ${nome}, 
            foto_url = ${foto_url}, 
            linkedin_url = ${linkedin_url}, 
            instagram_url = ${instagram_url}
        WHERE id = 1 
        RETURNING id;
      `;
      
      return res.status(200).json({ message: 'Perfil atualizado', id: result[0].id });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ message: 'Método não permitido' });
};