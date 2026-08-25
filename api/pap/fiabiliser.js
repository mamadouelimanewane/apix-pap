import pool from '../../lib/db.js';
import { analyzerDossierPAP } from '../../lib/fiabilisation.js';

/**
 * POST /api/pap/:id/fiabiliser
 * Analyse un dossier PAP et détecte les anomalies
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID PAP manquant' });
  }

  try {
    // Récupérer PAP
    const papResult = await pool.query(
      'SELECT * FROM pap WHERE id = $1 OR code_pap = $1',
      [id]
    );

    if (papResult.rows.length === 0) {
      return res.status(404).json({ error: 'PAP non trouvé' });
    }

    const pap = papResult.rows[0];

    // Récupérer données associées
    const biensResult = await pool.query('SELECT * FROM biens WHERE pap_id = $1', [pap.id]);
    const evalsResult = await pool.query(
      `SELECT e.* FROM evaluations e
       JOIN biens b ON e.bien_id = b.id
       WHERE b.pap_id = $1`,
      [pap.id]
    );
    const paiementsResult = await pool.query('SELECT * FROM paiements WHERE pap_id = $1', [pap.id]);
    const docsResult = await pool.query('SELECT * FROM documents WHERE pap_id = $1', [pap.id]);

    // Lancer analyse
    const analysis = await analyzerDossierPAP(
      pap,
      biensResult.rows,
      evalsResult.rows,
      paiementsResult.rows,
      docsResult.rows,
      pool
    );

    // Enregistrer résultat en DB
    await pool.query(
      `UPDATE pap
       SET fiabilisation = $1, anomalies = $2, mis_a_jour_le = NOW()
       WHERE id = $3`,
      [analysis.statut, JSON.stringify(analysis.anomalies), pap.id]
    );

    // Enregistrer dans historique
    await pool.query(
      `INSERT INTO historique (table_cible, enregistrement_id, utilisateur_id, action, champ, nouvelle_valeur)
       VALUES ('pap', $1, $2, 'FIABILISATION', 'statut', $3)`,
      [pap.id, req.headers['x-user-id'] || 1, analysis.statut]
    );

    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Fiabilisation error:', error);
    return res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
}
