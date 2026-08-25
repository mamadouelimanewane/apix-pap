import pool from '../../lib/db.js';

/**
 * POST /api/evaluations/create
 * Crée une évaluation pour un bien
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bien_id, montant_initial, montant_fiabilise, evaluateur } = req.body;

  if (!bien_id || !montant_initial) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  try {
    // Récupérer le bien pour vérifier qu'il existe
    const bienResult = await pool.query('SELECT * FROM biens WHERE id = $1', [bien_id]);
    if (bienResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bien non trouvé' });
    }

    // Vérifier s'il existe déjà une évaluation
    const existingResult = await pool.query('SELECT id FROM evaluations WHERE bien_id = $1', [bien_id]);

    let result;
    if (existingResult.rows.length > 0) {
      // Mettre à jour
      result = await pool.query(
        `UPDATE evaluations
         SET montant_initial = $1, montant_fiabilise = $2, evaluateur = $3
         WHERE bien_id = $4
         RETURNING *`,
        [montant_initial, montant_fiabilise || montant_initial, evaluateur, bien_id]
      );
    } else {
      // Créer nouvelle
      result = await pool.query(
        `INSERT INTO evaluations (bien_id, montant_initial, montant_fiabilise, evaluateur, date_evaluation)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [bien_id, montant_initial, montant_fiabilise || montant_initial, evaluateur]
      );
    }

    // Mettre à jour PAP statut
    await pool.query(
      `UPDATE pap SET statut = 'Évalué' WHERE id = (SELECT pap_id FROM biens WHERE id = $1)`,
      [bien_id]
    );

    return res.status(201).json({
      message: 'Évaluation créée/mise à jour',
      evaluation: result.rows[0]
    });
  } catch (error) {
    console.error('Create evaluation error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
