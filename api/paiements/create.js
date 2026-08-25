import pool from '../../lib/db.js';

/**
 * POST /api/paiements/create
 * Enregistre un paiement pour un PAP
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pap_id, montant, mode, reference, date_paiement } = req.body;

  if (!pap_id || !montant || !mode) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  try {
    // Générer code paiement
    const yearCode = new Date().getFullYear();
    const maxResult = await pool.query(
      `SELECT MAX(CAST(SUBSTRING(code_paiement, 10) AS INTEGER)) as max_num
       FROM paiements
       WHERE code_paiement LIKE $1`,
      [`PAY-${yearCode}-%`]
    );

    const nextNum = (maxResult.rows[0].max_num || 0) + 1;
    const codePaiement = `PAY-${yearCode}-${String(nextNum).padStart(4, '0')}`;

    // Insérer paiement
    const result = await pool.query(
      `INSERT INTO paiements (
        code_paiement, pap_id, montant, mode, reference,
        date_paiement, statut, effectue_le
      ) VALUES ($1, $2, $3, $4, $5, $6, 'Payé', NOW())
      RETURNING *`,
      [codePaiement, pap_id, montant, mode, reference, date_paiement || new Date()]
    );

    // Mettre à jour PAP statut
    await pool.query(
      `UPDATE pap SET statut = 'Payé' WHERE id = $1`,
      [pap_id]
    );

    return res.status(201).json({
      message: 'Paiement enregistré',
      paiement: result.rows[0]
    });
  } catch (error) {
    console.error('Create paiement error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
