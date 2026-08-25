import pool from '../../lib/db.js';

/**
 * GET /api/biens/list?pap_id=1&projet=1
 * Liste les biens avec évaluations associées
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pap_id, projet } = req.query;

  try {
    let query = `
      SELECT b.*,
             e.montant_initial, e.montant_valide, e.evaluateur,
             p.nom as pap_nom, p.prenom as pap_prenom, p.code_pap
      FROM biens b
      LEFT JOIN evaluations e ON b.id = e.bien_id
      LEFT JOIN pap p ON b.pap_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (pap_id) {
      query += ` AND b.pap_id = $${paramIndex}`;
      params.push(pap_id);
      paramIndex++;
    }

    if (projet) {
      query += ` AND p.projet_id = $${paramIndex}`;
      params.push(projet);
      paramIndex++;
    }

    query += ` ORDER BY b.created_at DESC`;

    const result = await pool.query(query, params);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Biens list error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
