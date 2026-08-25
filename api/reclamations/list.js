import pool from '../../lib/db.js';

/**
 * GET /api/reclamations/list?page=1&statut=Reçue
 * Liste réclamations avec détails PAP
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { page = 1, limit = 50, statut } = req.query;
  const offset = (page - 1) * limit;
  let query = `
    SELECT r.*,
           p.code_pap, p.nom, p.prenom, p.commune,
           u.nom as responsable_nom, u.prenom as responsable_prenom
    FROM reclamations r
    LEFT JOIN pap p ON r.pap_id = p.id
    LEFT JOIN utilisateurs u ON r.responsable_id = u.id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (statut) {
    query += ` AND r.statut = $${paramIndex}`;
    params.push(statut);
    paramIndex++;
  }

  // Compter total
  const countResult = await pool.query(
    query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as count FROM'),
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Paginer
  query += ` ORDER BY r.date_reception DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
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
    console.error('Reclamations list error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
