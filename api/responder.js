import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { id, resposta } = req.body;

    if (!id || !resposta) {
      return res.status(400).json({ message: 'ID e resposta são obrigatórios.' });
    }

    // Atualiza o pedido com a resposta e define o status/id do admin
    await sql`
      UPDATE pedidos_ajuda 
      SET resposta = ${resposta},
          respondido_por_id = 1
      WHERE id = ${id};
    `;

    return res.status(200).json({ message: 'Resposta enviada com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};