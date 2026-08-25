import pool from '../../lib/db.js';

/**
 * GET /api/pap/list?page=1&limit=50&statut=Nouveau&search=diallo
 * Liste tous les PAP avec filtres et pagination
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      page = 1,
      limit = 50,
      statut,
      commune,
      projet,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM pap WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Filtres
    if (statut) {
      query += ` AND statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }

    if (commune) {
      query += ` AND commune = $${paramIndex}`;
      params.push(commune);
      paramIndex++;
    }

    if (projet) {
      query += ` AND projet_id = $${paramIndex}`;
      params.push(projet);
      paramIndex++;
    }

    if (search) {
      query += ` AND (nom ILIKE $${paramIndex} OR prenom ILIKE $${paramIndex} OR code_pap ILIKE $${paramIndex} OR telephone ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Compter total
    const countResult = await pool.query(
      query.replace('SELECT *', 'SELECT COUNT(*) as count'),
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Paginer
    query += ` ORDER BY cree_le DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

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
    console.error('PAP list error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
