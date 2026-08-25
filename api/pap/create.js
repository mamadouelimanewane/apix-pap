import pool from '../../lib/db.js';

/**
 * POST /api/pap/create
 * Crée un nouveau PAP avec code auto-généré
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    projet_id,
    nom,
    prenom,
    telephone,
    commune,
    region,
    adresse_detail
  } = req.body;

  if (!nom || !prenom || !projet_id) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  try {
    // Générer code PAP
    const yearCode = new Date().getFullYear();
    const maxResult = await pool.query(
      `SELECT MAX(CAST(SUBSTRING(code_pap, 10) AS INTEGER)) as max_num
       FROM pap
       WHERE code_pap LIKE $1`,
      [`PAP-${yearCode}-%`]
    );

    const nextNum = (maxResult.rows[0].max_num || 0) + 1;
    const codePAP = `PAP-${yearCode}-${String(nextNum).padStart(4, '0')}`;

    // Insérer PAP
    const result = await pool.query(
      `INSERT INTO pap (
        code_pap, projet_id, nom, prenom, telephone,
        commune, region, adresse_detail, statut, fiabilisation, cree_le
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Nouveau', 'incomplet', NOW())
      RETURNING *`,
      [codePAP, projet_id, nom, prenom, telephone, commune, region, adresse_detail]
    );

    // Enregistrer création dans historique
    await pool.query(
      `INSERT INTO historique (table_cible, enregistrement_id, utilisateur_id, action, champ, nouvelle_valeur)
       VALUES ('pap', $1, $2, 'CREATION', 'code_pap', $3)`,
      [result.rows[0].id, req.headers['x-user-id'] || 1, codePAP]
    );

    return res.status(201).json({
      message: 'PAP créé avec succès',
      pap: result.rows[0]
    });
  } catch (error) {
    console.error('Create PAP error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
