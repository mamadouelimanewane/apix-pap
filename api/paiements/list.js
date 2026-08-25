import pool from '../../lib/db.js';

/**
 * GET /api/paiements/list?page=1&statut=Payé
 * Liste tous les paiements avec détails PAP
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { page = 1, limit = 50, statut, mode } = req.query;
  const offset = (page - 1) * limit;
  let query = `
    SELECT p.*,
           pa.code_pap, pa.nom, pa.prenom, pa.commune,
           SUM(e.montant_valide) as montant_valide
    FROM paiements p
    LEFT JOIN pap pa ON p.pap_id = pa.id
    LEFT JOIN biens b ON pa.id = b.pap_id
    LEFT JOIN evaluations e ON b.id = e.bien_id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (statut) {
    query += ` AND p.statut = $${paramIndex}`;
    params.push(statut);
    paramIndex++;
  }

  if (mode) {
    query += ` AND p.mode = $${paramIndex}`;
    params.push(mode);
    paramIndex++;
  }

  // Compter total
  const countResult = await pool.query(
    query.replace(/SELECT.*?FROM/, 'SELECT COUNT(DISTINCT p.id) as count FROM'),
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Paginer
  query += ` GROUP BY p.id, pa.id LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  try {
    const result = await pool.query(query, params);

    return res.status(200).json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Paiements list error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
