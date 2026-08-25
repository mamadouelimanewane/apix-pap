import pool from '../../lib/db.js';

/**
 * GET /api/stats/dashboard
 * Retourne tous les KPIs pour le dashboard
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Total PAP
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM pap');
    const totalPAP = parseInt(totalResult.rows[0].count);

    // PAP par statut
    const statusResult = await pool.query(
      `SELECT statut, COUNT(*) as count FROM pap GROUP BY statut ORDER BY count DESC`
    );
    const statusCounts = statusResult.rows.reduce((acc, row) => {
      acc[row.statut] = parseInt(row.count);
      return acc;
    }, {});

    // PAP indemnisés (statut Payé ou Clôturé)
    const paidResult = await pool.query(
      `SELECT COUNT(*) as count FROM pap WHERE statut IN ('Payé', 'Clôturé')`
    );
    const papIndemnises = parseInt(paidResult.rows[0].count);

    // PAP en cours (statut != Nouveau, Payé, Clôturé)
    const inProgressResult = await pool.query(
      `SELECT COUNT(*) as count FROM pap WHERE statut NOT IN ('Nouveau', 'Payé', 'Clôturé')`
    );
    const papEnCours = parseInt(inProgressResult.rows[0].count);

    // Montants
    const montantsResult = await pool.query(
      `SELECT
        SUM(montant_valide) as montant_valide,
        SUM(CASE WHEN statut = 'Payé' THEN montant ELSE 0 END) as montant_paye
       FROM paiements`
    );
    const montantValide = parseInt(montantsResult.rows[0].montant_valide || 0);
    const montantPaye = parseInt(montantsResult.rows[0].montant_paye || 0);

    // Réclamations ouvertes
    const reclamationsResult = await pool.query(
      `SELECT COUNT(*) as count FROM reclamations WHERE statut != 'Clôturée'`
    );
    const reclamationsOuvertes = parseInt(reclamationsResult.rows[0].count);

    // Dossiers clôturés
    const closedResult = await pool.query(
      `SELECT COUNT(*) as count FROM pap WHERE statut = 'Clôturé'`
    );
    const dossiersClotures = parseInt(closedResult.rows[0].count);

    // Données anomalies
    const anomaliesResult = await pool.query(
      `SELECT fiabilisation, COUNT(*) as count FROM pap GROUP BY fiabilisation`
    );
    const anomaliesCounts = anomaliesResult.rows.reduce((acc, row) => {
      acc[row.fiabilisation] = parseInt(row.count);
      return acc;
    }, {});

    return res.status(200).json({
      totalPAP,
      papIndemnises,
      papEnCours,
      montantValide,
      montantPaye,
      solde: montantValide - montantPaye,
      reclamationsOuvertes,
      dossiersClotures,
      statuts: statusCounts,
      fiabilisations: anomaliesCounts,
      tauxTraitement: totalPAP > 0 ? Math.round((papIndemnises + dossiersClotures) / totalPAP * 100) : 0
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
