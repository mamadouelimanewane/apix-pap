import pool from '../../lib/db.js';

/**
 * POST /api/conciliations/create
 * Enregistre une conciliation (PV)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pap_id, montant_propose, montant_accepte, accord } = req.body;

  if (!pap_id || !montant_propose) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO conciliations (pap_id, date_reunion, montant_propose, montant_accepte, accord)
       VALUES ($1, NOW(), $2, $3, $4)
       RETURNING *`,
      [pap_id, montant_propose, montant_accepte || montant_propose, accord !== false]
    );

    // Mettre à jour PAP statut
    const newStatut = accord !== false ? 'Concilié' : 'Suspendu';
    await pool.query(
      `UPDATE pap SET statut = $1 WHERE id = $2`,
      [newStatut, pap_id]
    );

    return res.status(201).json({
      message: 'Conciliation enregistrée',
      conciliation: result.rows[0]
    });
  } catch (error) {
    console.error('Create conciliation error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
