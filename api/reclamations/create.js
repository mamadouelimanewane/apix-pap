import pool from '../../lib/db.js';

/**
 * POST /api/reclamations/create
 * Crée une réclamation (Mécanisme Gestion Plaintes)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pap_id, objet, description } = req.body;

  if (!pap_id || !objet) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  try {
    // Générer code réclamation
    const yearCode = new Date().getFullYear();
    const maxResult = await pool.query(
      `SELECT MAX(CAST(SUBSTRING(code_rec, 10) AS INTEGER)) as max_num
       FROM reclamations
       WHERE code_rec LIKE $1`,
      [`REC-${yearCode}-%`]
    );

    const nextNum = (maxResult.rows[0].max_num || 0) + 1;
    const codeRec = `REC-${yearCode}-${String(nextNum).padStart(4, '0')}`;

    // Insérer réclamation
    const result = await pool.query(
      `INSERT INTO reclamations (
        code_rec, pap_id, date_reception, objet, description, statut
      ) VALUES ($1, $2, NOW(), $3, $4, 'Reçue')
      RETURNING *`,
      [codeRec, pap_id, objet, description]
    );

    // Mettre à jour PAP statut
    await pool.query(
      `UPDATE pap SET statut = 'En réclamation' WHERE id = $1`,
      [pap_id]
    );

    return res.status(201).json({
      message: 'Réclamation enregistrée',
      reclamation: result.rows[0]
    });
  } catch (error) {
    console.error('Create reclamation error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
