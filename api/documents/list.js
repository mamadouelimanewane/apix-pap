import pool from '../../lib/db.js';

/**
 * GET /api/documents/list?pap_id=1
 * Liste documents d'un PAP
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pap_id } = req.query;

  if (!pap_id) {
    return res.status(400).json({ error: 'PAP ID manquant' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM documents WHERE pap_id = $1 ORDER BY uploade_le DESC`,
      [pap_id]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Documents list error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
