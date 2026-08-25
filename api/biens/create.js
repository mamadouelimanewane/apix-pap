import pool from '../../lib/db.js';

/**
 * POST /api/biens/create
 * Crée un nouveau bien pour un PAP
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pap_id, type_bien, superficie_m2, localisation, gps_lat, gps_lng } = req.body;

  if (!pap_id || !type_bien || !superficie_m2) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  try {
    // Générer code BIEN
    const yearCode = new Date().getFullYear();
    const maxResult = await pool.query(
      `SELECT MAX(CAST(SUBSTRING(code_bien, 10) AS INTEGER)) as max_num
       FROM biens
       WHERE code_bien LIKE $1`,
      [`BIEN-${yearCode}-%`]
    );

    const nextNum = (maxResult.rows[0].max_num || 0) + 1;
    const codeBien = `BIEN-${yearCode}-${String(nextNum).padStart(4, '0')}`;

    // Insérer bien
    const result = await pool.query(
      `INSERT INTO biens (
        code_bien, pap_id, type_bien, superficie_m2,
        localisation, gps_lat, gps_lng, statut, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Recensé', NOW())
      RETURNING *`,
      [codeBien, pap_id, type_bien, superficie_m2, localisation, gps_lat, gps_lng]
    );

    return res.status(201).json({
      message: 'Bien créé avec succès',
      bien: result.rows[0]
    });
  } catch (error) {
    console.error('Create bien error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
