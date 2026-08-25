import pool from '../../lib/db.js';
import { analyzerDossierPAP } from '../../lib/fiabilisation.js';

/**
 * GET /api/pap/:id — Voir détail PAP
 * POST /api/pap/:id — Mettre à jour PAP
 * DELETE /api/pap/:id — Supprimer PAP
 */
export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID manquant' });
  }

  try {
    // GET — Voir détail
    if (req.method === 'GET') {
      const papResult = await pool.query(
        'SELECT * FROM pap WHERE id = $1 OR code_pap = $1',
        [id]
      );

      if (papResult.rows.length === 0) {
        return res.status(404).json({ error: 'PAP non trouvé' });
      }

      const pap = papResult.rows[0];

      // Récupérer biens associés
      const biensResult = await pool.query(
        'SELECT * FROM biens WHERE pap_id = $1',
        [pap.id]
      );

      // Récupérer évaluations
      const evalsResult = await pool.query(
        `SELECT e.* FROM evaluations e
         JOIN biens b ON e.bien_id = b.id
         WHERE b.pap_id = $1`,
        [pap.id]
      );

      // Récupérer paiements
      const paiementsResult = await pool.query(
        'SELECT * FROM paiements WHERE pap_id = $1',
        [pap.id]
      );

      // Récupérer documents
      const docsResult = await pool.query(
        'SELECT * FROM documents WHERE pap_id = $1',
        [pap.id]
      );

      // Récupérer historique
      const historyResult = await pool.query(
        `SELECT h.*, u.nom, u.prenom
         FROM historique h
         LEFT JOIN utilisateurs u ON h.utilisateur_id = u.id
         WHERE h.table_cible = 'pap' AND h.enregistrement_id = $1
         ORDER BY h.date_action DESC LIMIT 20`,
        [pap.id]
      );

      return res.status(200).json({
        pap,
        biens: biensResult.rows,
        evaluations: evalsResult.rows,
        paiements: paiementsResult.rows,
        documents: docsResult.rows,
        historique: historyResult.rows
      });
    }

    // PUT — Mettre à jour
    if (req.method === 'PUT') {
      const { nom, prenom, telephone, commune, statut, ...other } = req.body;

      const updateResult = await pool.query(
        `UPDATE pap
         SET nom = $1, prenom = $2, telephone = $3, commune = $4, statut = $5, mis_a_jour_le = NOW()
         WHERE id = $6 OR code_pap = $6
         RETURNING *`,
        [nom, prenom, telephone, commune, statut, id]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: 'PAP non trouvé' });
      }

      // Enregistrer dans historique
      await pool.query(
        `INSERT INTO historique (table_cible, enregistrement_id, utilisateur_id, action, champ, ancienne_valeur, nouvelle_valeur)
         VALUES ('pap', $1, $2, 'MODIFICATION', 'statut', $3, $4)`,
        [updateResult.rows[0].id, req.headers['x-user-id'] || 1, 'inconnu', statut]
      );

      return res.status(200).json(updateResult.rows[0]);
    }

    // DELETE — Supprimer
    if (req.method === 'DELETE') {
      const papResult = await pool.query(
        'SELECT id FROM pap WHERE id = $1 OR code_pap = $1',
        [id]
      );

      if (papResult.rows.length === 0) {
        return res.status(404).json({ error: 'PAP non trouvé' });
      }

      const papId = papResult.rows[0].id;

      // Supprimer en cascade
      await pool.query('DELETE FROM documents WHERE pap_id = $1', [papId]);
      await pool.query('DELETE FROM paiements WHERE pap_id = $1', [papId]);
      await pool.query('DELETE FROM reclamations WHERE pap_id = $1', [papId]);
      await pool.query('DELETE FROM evaluations WHERE bien_id IN (SELECT id FROM biens WHERE pap_id = $1)', [papId]);
      await pool.query('DELETE FROM biens WHERE pap_id = $1', [papId]);
      await pool.query('DELETE FROM pap WHERE id = $1', [papId]);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('PAP error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
