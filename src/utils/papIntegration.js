// Intégration automatique extraction OCR → Registre PAP
// Auto-populate PAP, validation cadastre, risk scoring

// 1. Créer PAP depuis CNI extraite
export const createPAPFromCNI = async (extractedCNI) => {
  const validation = validateCNIData(extractedCNI);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const papData = {
    nom: extractedCNI.nom,
    prenom: extractedCNI.prenom,
    telephone: extractedCNI.telephone || '',
    email: extractedCNI.email || '',
    date_naissance: extractedCNI.date_naissance,
    numero_cni: extractedCNI.numero,
    sexe: extractedCNI.sexe,
    lieu_naissance: extractedCNI.lieu_naissance,
    statut: 'Nouveau',
    source: 'OCR_CNI',
    date_creation: new Date().toISOString(),
    verification_docs: {
      cni_scannee: true,
      date_scan_cni: new Date().toISOString()
    }
  };

  try {
    const response = await fetch('/api/pap/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(papData)
    });

    const result = await response.json();
    return {
      success: true,
      pap: result,
      message: `PAP créé: ${result.code_pap}`
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 2. Créer/Valider BIEN depuis Titre Propriété
export const createPropertyFromTitre = async (extractedTitre, papCode) => {
  const validation = validateTitreData(extractedTitre);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const bienData = {
    code_pap: papCode,
    type_bien: 'Terrain', // À déterminer
    numeroLot: extractedTitre.numero_parcelle,
    superficie: parseFloat(extractedTitre.superficie),
    adresse: extractedTitre.adresse,
    date_acquisition: extractedTitre.date_acquisition,
    proprietaire: extractedTitre.proprietaire,
    statut_titre: validateTitreStatus(extractedTitre),
    source: 'OCR_TITRE',
    date_creation: new Date().toISOString()
  };

  try {
    const response = await fetch('/api/biens/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bienData)
    });

    const result = await response.json();
    return {
      success: true,
      bien: result,
      message: `Bien créé: ${result.code_bien}`
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 3. Valider contre cadastre
export const validateAgainstCadastre = async (numeroLot, proprietaire, superficie) => {
  try {
    const response = await fetch('/api/cadastre/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numeroLot,
        proprietaire,
        superficie
      })
    });

    const result = await response.json();
    return {
      valid: result.valid,
      cadastreData: result.cadastreRecord,
      discrepancies: result.discrepancies || [],
      confidence: result.confidence || 0
    };
  } catch (error) {
    console.error('Erreur validation cadastre:', error);
    return { valid: false, error: error.message };
  }
};

// 4. Calcul Risk Scoring automatique
export const calculateRiskScore = (papData, bienData, cadastreValidation) => {
  let riskScore = 0;
  const factors = [];

  // Factor 1: CNI Validity (0-20 points)
  if (papData.numero_cni) {
    const cniAge = calculateDocumentAge(papData.date_creation);
    if (cniAge > 10) {
      riskScore += 20;
      factors.push({ factor: 'CNI Expirée', weight: 20, risk: 'HIGH' });
    } else if (cniAge > 5) {
      riskScore += 10;
      factors.push({ factor: 'CNI Ancienne', weight: 10, risk: 'MEDIUM' });
    }
  }

  // Factor 2: Titre Validity (0-25 points)
  if (bienData) {
    if (bienData.statut_titre === 'Titré régulier') {
      // OK
    } else if (bienData.statut_titre === 'Immatriculé') {
      riskScore += 5;
      factors.push({ factor: 'Bien Immatriculé', weight: 5, risk: 'LOW' });
    } else {
      riskScore += 25;
      factors.push({ factor: 'Titre Invalide', weight: 25, risk: 'HIGH' });
    }
  }

  // Factor 3: Cadastre Match (0-30 points)
  if (cadastreValidation) {
    if (cadastreValidation.valid && cadastreValidation.confidence > 0.9) {
      // Parfait match
    } else if (!cadastreValidation.valid) {
      riskScore += 30;
      factors.push({
        factor: 'Discordance Cadastre',
        weight: 30,
        risk: 'CRITICAL',
        details: cadastreValidation.discrepancies
      });
    } else if (cadastreValidation.confidence < 0.7) {
      riskScore += 15;
      factors.push({ factor: 'Match Faible', weight: 15, risk: 'MEDIUM' });
    }
  }

  // Factor 4: Document Quality (0-15 points)
  if (papData.doc_quality && papData.doc_quality < 70) {
    riskScore += 15;
    factors.push({ factor: 'Qualité Documents', weight: 15, risk: 'MEDIUM' });
  }

  // Factor 5: Missing Docs (0-10 points)
  const docsRequired = 3; // CNI, Titre, Attestation
  const docsProvided = Object.values(papData.verification_docs || {}).filter(Boolean).length;
  if (docsProvided < docsRequired) {
    const missing = (docsRequired - docsProvided) * 3;
    riskScore += Math.min(missing, 10);
    factors.push({ factor: 'Documents Manquants', weight: missing, risk: 'MEDIUM' });
  }

  return {
    riskScore: Math.min(100, riskScore),
    riskLevel: getRiskLevel(Math.min(100, riskScore)),
    factors: factors,
    recommendation: generateRecommendation(Math.min(100, riskScore), factors),
    timestamp: new Date().toISOString()
  };
};

// Déterminer niveau risque
const getRiskLevel = (score) => {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
};

// Générer recommandation basée sur risques
const generateRecommendation = (score, factors) => {
  const criticalFactors = factors.filter(f => f.risk === 'CRITICAL');

  if (criticalFactors.length > 0) {
    return {
      action: 'REJECT',
      message: `Rejeter PAP - Problèmes critiques: ${criticalFactors.map(f => f.factor).join(', ')}`,
      requiredActions: [
        'Demander documents additionnels',
        'Vérifier cadastre manuellement',
        'Consultations juridiques'
      ]
    };
  }

  if (score >= 50) {
    return {
      action: 'REVIEW',
      message: 'Examen détaillé requis - Risque élevé détecté',
      requiredActions: [
        'Vérification manuelle documents',
        'Visite terrain si possible',
        'Contact cadastre'
      ]
    };
  }

  if (score >= 25) {
    return {
      action: 'VERIFY',
      message: 'Documents supplémentaires recommandés',
      requiredActions: [
        'Attestation résidence',
        'Photos bien',
        'Contrats additionnels'
      ]
    };
  }

  return {
    action: 'APPROVE',
    message: 'Profil bon pour traitement standard',
    requiredActions: []
  };
};

// Calcul age document (années)
const calculateDocumentAge = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  return (now - date) / (1000 * 60 * 60 * 24 * 365.25);
};

// Validations
const validateCNIData = (data) => {
  const errors = [];
  if (!data.nom || !data.prenom) errors.push('Nom/prénom manquant');
  if (!data.numero || !/^[A-Z0-9]{13,14}$/.test(data.numero.replace(/\s/g, ''))) {
    errors.push('Numéro CNI invalide');
  }
  if (!data.date_naissance) errors.push('Date naissance manquante');

  return { valid: errors.length === 0, errors };
};

const validateTitreData = (data) => {
  const errors = [];
  if (!data.numero_parcelle) errors.push('Numéro parcelle manquant');
  if (!data.proprietaire) errors.push('Propriétaire manquant');
  if (!data.superficie || isNaN(parseFloat(data.superficie))) errors.push('Superficie invalide');

  return { valid: errors.length === 0, errors };
};

const validateTitreStatus = (data) => {
  if (data.titre_type === 'Titré régulier') return 'Titré régulier';
  if (data.titre_type === 'Immatriculé') return 'Immatriculé';
  return 'À vérifier';
};

// Créer dossier complet PAP
export const createCompletePAPProfile = async (documents) => {
  const profile = {
    pap: null,
    biens: [],
    documents: documents,
    riskAssessment: null,
    status: 'In Progress'
  };

  try {
    // 1. Créer PAP depuis CNI
    const cniDoc = documents.find(d => d.type === 'cni');
    if (cniDoc) {
      const papResult = await createPAPFromCNI(cniDoc.data);
      if (papResult.success) {
        profile.pap = papResult.pap;
      }
    }

    // 2. Créer biens depuis titres propriété
    const titreDoc = documents.find(d => d.type === 'titre_propriete');
    if (titreDoc && profile.pap) {
      const bienResult = await createPropertyFromTitre(titreDoc.data, profile.pap.code_pap);
      if (bienResult.success) {
        profile.biens.push(bienResult.bien);

        // 3. Valider cadastre
        const cadastreValidation = await validateAgainstCadastre(
          titreDoc.data.numero_parcelle,
          titreDoc.data.proprietaire,
          titreDoc.data.superficie
        );

        // 4. Calcul risk score
        profile.riskAssessment = calculateRiskScore(
          profile.pap,
          profile.biens[0],
          cadastreValidation
        );
      }
    }

    profile.status = profile.pap ? 'Completed' : 'Failed';
    return profile;
  } catch (error) {
    profile.error = error.message;
    profile.status = 'Error';
    return profile;
  }
};

export default {
  createPAPFromCNI,
  createPropertyFromTitre,
  validateAgainstCadastre,
  calculateRiskScore,
  createCompletePAPProfile
};
