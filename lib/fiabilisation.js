/**
 * Moteur de fiabilisation automatique des dossiers PAP
 * Détecte les anomalies, doublons, incohérences et données manquantes
 */

export async function analyzerDossierPAP(pap, biens, evaluations, paiements, documents, db) {
  const anomalies = [];
  let statut = 'complet';

  // 1. Vérifier identité complète
  if (!pap.nom || !pap.prenom) {
    anomalies.push({
      code: 'IDENTITE_INCOMPLETE',
      message: 'Identité incomplète (nom ou prénom manquant)',
      severity: 'critical'
    });
    statut = 'anomalie';
  }

  // 2. Vérifier pièce d'identité
  if (!pap.cni && !documents.some(d => ['CNI', 'Passeport'].includes(d.type_document))) {
    anomalies.push({
      code: 'SANS_CNI',
      message: 'Aucune pièce d\'identité (CNI/Passeport) jointe',
      severity: 'critical'
    });
    if (statut !== 'anomalie') statut = 'incomplet';
  }

  // 3. Vérifier contact
  if (!pap.telephone) {
    anomalies.push({
      code: 'SANS_TELEPHONE',
      message: 'Numéro de téléphone manquant',
      severity: 'high'
    });
    if (statut !== 'anomalie') statut = 'incomplet';
  }

  // 4. Vérifier doublons de téléphone
  if (pap.telephone) {
    const doublons = await db.query(
      'SELECT code_pap FROM pap WHERE telephone = $1 AND id != $2',
      [pap.telephone, pap.id]
    );
    if (doublons.rows.length > 0) {
      anomalies.push({
        code: 'DOUBLON_TEL',
        message: `Téléphone identique à ${doublons.rows.map(r => r.code_pap).join(', ')}`,
        severity: 'high'
      });
    }
  }

  // 5. Vérifier biens
  if (!biens || biens.length === 0) {
    anomalies.push({
      code: 'SANS_BIEN',
      message: 'Aucun bien déclaré',
      severity: 'critical'
    });
    statut = 'anomalie';
  } else {
    biens.forEach((bien, idx) => {
      if (!bien.type_bien) {
        anomalies.push({
          code: `BIEN_${idx}_SANS_TYPE`,
          message: `Bien ${idx + 1}: type manquant`,
          severity: 'high'
        });
        if (statut !== 'anomalie') statut = 'incomplet';
      }
      if (!bien.superficie_m2 || bien.superficie_m2 <= 0) {
        anomalies.push({
          code: `BIEN_${idx}_SANS_SUPERFICIE`,
          message: `Bien ${idx + 1}: superficie manquante ou invalide`,
          severity: 'high'
        });
        if (statut !== 'anomalie') statut = 'incomplet';
      }
    });
  }

  // 6. Vérifier évaluations
  if (!evaluations || evaluations.length === 0) {
    anomalies.push({
      code: 'SANS_EVALUATION',
      message: 'Aucune évaluation enregistrée',
      severity: 'high'
    });
    if (statut !== 'anomalie') statut = 'incomplet';
  } else {
    evaluations.forEach((eval, idx) => {
      if (!eval.montant_initial || eval.montant_initial <= 0) {
        anomalies.push({
          code: `EVAL_${idx}_SANS_MONTANT`,
          message: `Évaluation ${idx + 1}: montant initial manquant`,
          severity: 'high'
        });
        if (statut !== 'anomalie') statut = 'incomplet';
      }
      if (eval.montant_initial && eval.montant_valide && eval.montant_valide > eval.montant_initial * 1.5) {
        anomalies.push({
          code: `EVAL_${idx}_INCOHERENCE`,
          message: `Évaluation ${idx + 1}: montant validé > 150% du montant initial`,
          severity: 'medium'
        });
      }
    });
  }

  // 7. Vérifier incohérence superficie/montant (pour terrains)
  if (biens && evaluations) {
    biens.forEach((bien, idx) => {
      const eval = evaluations[idx];
      if (bien.type_bien === 'Terrain' && bien.superficie_m2 && eval?.montant_initial) {
        const prixParM2 = eval.montant_initial / bien.superficie_m2;
        // Si prix < 1000 FCFA/m² pour un terrain = anomalie
        if (prixParM2 < 1000) {
          anomalies.push({
            code: `INCOHERENCE_PRIX_${idx}`,
            message: `Terrain ${idx + 1}: prix ${prixParM2.toFixed(0)} FCFA/m² (< seuil minimum)`,
            severity: 'medium'
          });
        }
      }
    });
  }

  // 8. Vérifier paiements
  if (paiements && paiements.length > 0) {
    // Si dossier marqué "Payé" mais aucun paiement enregistré
    if (pap.statut === 'Payé' && paiements.every(p => p.statut !== 'Payé')) {
      anomalies.push({
        code: 'PAYE_STATUT_ERRONE',
        message: 'Statut = Payé mais aucun paiement validé',
        severity: 'high'
      });
    }
    // Si paiement sans justificatif
    paiements.forEach((pmt, idx) => {
      if (pmt.statut === 'Payé' && !pmt.justificatif_url) {
        anomalies.push({
          code: `PAIEMENT_${idx}_SANS_JUSTIF`,
          message: `Paiement ${idx + 1}: pas de justificatif (reçu/chèque)`,
          severity: 'medium'
        });
      }
    });
  }

  // 9. Vérifier documents obligatoires par statut
  const typeDocumentsAttendus = {
    'Fiabilisé': ['CNI', 'Titre ou Délibération'],
    'Concilié': ['Acte d\'acquiescement', 'PV conciliation'],
    'Payé': ['Chèque', 'Preuve de paiement'],
  };

  const docsPresents = documents.map(d => d.type_document);
  if (typeDocumentsAttendus[pap.statut]) {
    typeDocumentsAttendus[pap.statut].forEach(typeAttendu => {
      if (!docsPresents.includes(typeAttendu)) {
        anomalies.push({
          code: `MANQUE_DOC_${typeAttendu.replace(/\s+/g, '_')}`,
          message: `Statut ${pap.statut}: document manquant (${typeAttendu})`,
          severity: 'high'
        });
        if (statut !== 'anomalie') statut = 'incomplet';
      }
    });
  }

  // 10. Vérifier si dossier peut transition vers étape suivante
  const validationTransition = {
    'Nouveau': ['nom', 'prenom', 'telephone'],
    'Recensé': ['type_bien', 'superficie_m2'],
    'Fiabilisé': ['cni', 'montant_initial'],
    'Évalué': ['montant_valide'],
    'En conciliation': ['montant_propose'],
    'Concilié': ['accord_pap'],
    'Acte signé': ['document_acte'],
    'PV signé': ['pv_signe'],
    'À payer': ['montant_a_payer'],
  };

  // Résultat
  return {
    statut, // 'complet' | 'incomplet' | 'anomalie'
    anomalies,
    score: 100 - (anomalies.length * 5), // Score de complétude 0-100
    derniere_verif: new Date().toISOString()
  };
}

// Export pour usage dans les API
export const fiabilisationBadge = (statut) => {
  const badges = {
    'complet': { emoji: '🟢', label: 'Complet', couleur: '#10b981' },
    'incomplet': { emoji: '🟠', label: 'Incomplet', couleur: '#f59e0b' },
    'anomalie': { emoji: '🔴', label: 'Anomalies', couleur: '#ef4444' }
  };
  return badges[statut] || badges.incomplet;
};
