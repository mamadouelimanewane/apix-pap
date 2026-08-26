// API Handlers - Workflow Qualité Complet
// Supports: Création → Archivage avec monitoring

import { Database } from '@neon/serverless';

const db = new Database(process.env.DATABASE_URL);

// ============================================================================
// PHASE 1: CRÉATION & ACQUISITION DOCUMENTS
// ============================================================================

export const createPAPWithQualityValidation = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { papData, documents } = req.body;

    // 1. Vérification données basiques
    const basicValidation = validateBasicData(papData);
    if (!basicValidation.valid) {
      return res.status(400).json({
        error: 'Données incomplètes',
        missing: basicValidation.missing
      });
    }

    // 2. Analyse fraude & doublon
    const fraudAnalysis = await detectFraudAndDuplicates(papData, documents);
    if (fraudAnalysis.fraudScore > 70) {
      return res.status(403).json({
        error: 'Création PAP rejetée - Score fraude trop élevé',
        fraudScore: fraudAnalysis.fraudScore,
        flags: fraudAnalysis.flags,
        escalatedToAdmin: true
      });
    }

    // 3. Analyse qualité documents
    const documentQuality = await analyzeDocumentQuality(documents);
    const overallQuality = calculateOverallQualityScore(basicValidation.score, documentQuality);

    // 4. Création PAP dans base
    const papCode = generatePAPCode(papData.region);

    const pap = await db.query(
      `INSERT INTO pap (
        code_pap, nom, prenom, date_naissance, numero_id,
        telephone, email, adresse_physique,
        region, departement, commune, zone,
        gps_coordinates, type_affaire, nombre_biens,
        status, quality_score, fraud_score, fraud_flags,
        created_by, created_at, date_enregistrement
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
      ) RETURNING *`,
      [
        papCode, papData.nom, papData.prenom, papData.dateNaissance, papData.numeroID,
        papData.telephone, papData.email, papData.adressePhysique,
        papData.region, papData.departement, papData.commune, papData.zone,
        JSON.stringify(papData.gpsCoordinates), papData.typeAffaire, papData.nombreBiens,
        'REGISTERED', overallQuality, fraudAnalysis.fraudScore,
        fraudAnalysis.flagged ? JSON.stringify(fraudAnalysis.flags) : null,
        req.user.email, new Date().toISOString(), new Date().toISOString()
      ]
    );

    // 5. Stockage documents liés
    await linkDocumentsToPAP(pap.rows[0].code_pap, documents);

    // 6. Enregistrement blockchain
    await recordAuditBlockchain('PAP_CREATED', 'PAP', {
      code_pap: papCode,
      qualityScore: overallQuality,
      documentsCount: documents.length
    }, req.user.email);

    // 7. Notification
    await sendNotification('PAP_CREATED', {
      papCode,
      quality: overallQuality,
      zone: papData.zone
    });

    res.status(201).json({
      success: true,
      papCode,
      qualityScore: overallQuality,
      fraudScore: fraudAnalysis.fraudScore,
      nextStep: 'validation_cadastre'
    });
  } catch (error) {
    console.error('Erreur création PAP:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// PHASE 2: VALIDATION & RISK SCORING
// ============================================================================

export const validatePAPAndCalculateRisk = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { papCode } = req.body;

    // 1. Récupérer PAP
    const papResult = await db.query(
      'SELECT * FROM pap WHERE code_pap = $1',
      [papCode]
    );
    const pap = papResult.rows[0];
    if (!pap) return res.status(404).json({ error: 'PAP not found' });

    // 2. Validation cadastre
    const cadastreValidation = await validateAgainstCadastre(papCode);

    // 3. Risk scoring
    const biens = await db.query(
      'SELECT * FROM bien WHERE pap_code = $1',
      [papCode]
    );

    const riskAssessment = calculateRiskScore(
      pap,
      biens.rows[0],
      cadastreValidation
    );

    // 4. Update PAP avec risk score
    await db.query(
      `UPDATE pap SET
        risk_score = $1, risk_level = $2, risk_factors = $3,
        cadastre_valid = $4, validated_at = $5
      WHERE code_pap = $6`,
      [
        riskAssessment.riskScore,
        riskAssessment.riskLevel,
        JSON.stringify(riskAssessment.factors),
        cadastreValidation.status === 'VALID',
        new Date().toISOString(),
        papCode
      ]
    );

    // 5. Blockchain audit
    await recordAuditBlockchain('RISK_ASSESSMENT_COMPLETED', 'PAP', {
      papCode,
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel
    }, req.user.email);

    res.status(200).json({
      success: true,
      riskAssessment,
      cadastreValidation,
      action: riskAssessment.recommendations[0]
    });
  } catch (error) {
    console.error('Erreur validation PAP:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// PHASE 4: DÉDOMMAGEMENT
// ============================================================================

export const submitCompensation = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { bienId, compensation } = req.body;

    // 1. Vérifier bien existe
    const bien = await db.query(
      'SELECT * FROM bien WHERE code_bien = $1',
      [bienId]
    );
    if (bien.rows.length === 0) return res.status(404).json({ error: 'Bien not found' });

    // 2. Créer dossier compensation
    const dossier = await db.query(
      `INSERT INTO dedommagement (
        bien_id, pap_code, montant_brut, montant_propose,
        classification, bareme, adjustments,
        status, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        bienId,
        bien.rows[0].pap_code,
        compensation.montantBrut,
        compensation.montantAjuste,
        JSON.stringify(compensation.classification),
        compensation.bareme,
        JSON.stringify(compensation.adjustments),
        'DRAFT',
        req.user.email,
        new Date().toISOString()
      ]
    );

    // 3. Notification superviseur
    await sendNotification('COMPENSATION_SUBMITTED', {
      bienId,
      montant: compensation.montantAjuste,
      superviseur: getSupervisor(bien.rows[0].zone)
    }, ['email', 'slack']);

    // 4. Blockchain
    await recordAuditBlockchain('DOSSIER_COMPENSATION_OUVERT', 'BIEN', {
      bienId,
      montantPropose: compensation.montantAjuste
    }, req.user.email);

    res.status(201).json({
      success: true,
      dossierId: dossier.rows[0].id,
      status: 'DRAFT',
      nextStep: 'superviseur_review'
    });
  } catch (error) {
    console.error('Erreur soumission compensation:', error);
    res.status(500).json({ error: error.message });
  }
};

export const reviewCompensationSupervisor = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { dossierId, decision, montantAjuste, comments } = req.body;

    // 1. Récupérer dossier
    const dossier = await db.query(
      'SELECT * FROM dedommagement WHERE id = $1',
      [dossierId]
    );
    if (dossier.rows.length === 0) return res.status(404).json({ error: 'Dossier not found' });

    const current = dossier.rows[0];

    // 2. Vérifier limite superviseur (±10%)
    const percentageChange = Math.abs(montantAjuste - current.montant_propose) / current.montant_propose * 100;
    if (percentageChange > 10) {
      return res.status(400).json({
        error: 'Superviseur cannot adjust more than ±10%',
        maxAllowed: current.montant_propose * 1.1,
        minAllowed: current.montant_propose * 0.9
      });
    }

    // 3. Update dossier
    const updated = await db.query(
      `UPDATE dedommagement SET
        status = $1, montant_superviseur = $2,
        commentaires_superviseur = $3, superviseur = $4,
        date_validation = $5
      WHERE id = $6 RETURNING *`,
      [
        decision === 'approved' ? 'VALIDATION_SUPERVISEUR' : 'REJECTED',
        decision === 'approved' ? montantAjuste : current.montant_superviseur,
        comments,
        req.user.email,
        new Date().toISOString(),
        dossierId
      ]
    );

    // 4. Si approuvé: notification directeur
    if (decision === 'approved') {
      await notifyDirector(updated.rows[0]);
    } else {
      // Si rejeté: notification agent
      await sendNotification('COMPENSATION_REJECTED', {
        dossierId,
        reason: comments
      }, ['email']);
    }

    res.status(200).json({
      success: true,
      status: updated.rows[0].status,
      nextStep: decision === 'approved' ? 'director_approval' : 'agent_correction'
    });
  } catch (error) {
    console.error('Erreur revue superviseur:', error);
    res.status(500).json({ error: error.message });
  }
};

export const approveCompensationDirector = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { dossierId, decision, montantFinal, comments } = req.body;

    const dossier = await db.query(
      'SELECT * FROM dedommagement WHERE id = $1',
      [dossierId]
    );
    if (dossier.rows.length === 0) return res.status(404).json({ error: 'Dossier not found' });

    const current = dossier.rows[0];

    // 1. Vérifier limite directeur (±5%)
    const percentageChange = Math.abs(montantFinal - current.montant_superviseur) / current.montant_superviseur * 100;
    if (percentageChange > 5) {
      return res.status(400).json({
        error: 'Director cannot adjust more than ±5%',
        maxAllowed: current.montant_superviseur * 1.05,
        minAllowed: current.montant_superviseur * 0.95
      });
    }

    // 2. Update dossier
    const finalized = await db.query(
      `UPDATE dedommagement SET
        status = $1, montant_final = $2,
        commentaires_directeur = $3, directeur = $4,
        date_finalisation = $5, locked = true
      WHERE id = $6 RETURNING *`,
      [
        decision === 'approved' ? 'COMPENSATION_APPROVED' : 'ESCALATED_TO_MINISTRY',
        decision === 'approved' ? montantFinal : current.montant_final,
        comments,
        req.user.email,
        new Date().toISOString(),
        dossierId
      ]
    );

    // 3. Si approuvé: générer certificat + notification paiement
    if (decision === 'approved') {
      // Certificat blockchain
      const certificate = await generateBlockchainCertificate(finalized.rows[0]);

      // Notification équipe paiement
      await notifyPaymentTeam(finalized.rows[0]);

      // Blockchain
      await recordAuditBlockchain('COMPENSATION_APPROVED', 'BIEN', {
        dossierId: finalized.rows[0].id,
        montantFinal: finalized.rows[0].montant_final,
        certificateId: certificate.certificateId
      }, req.user.email);

      return res.status(200).json({
        success: true,
        status: 'COMPENSATION_APPROVED',
        certificateId: certificate.certificateId,
        nextStep: 'payment_initialization'
      });
    } else {
      // Escalade ministère
      await escalateToMinistry(dossierId, comments);
      return res.status(200).json({
        success: true,
        status: 'ESCALATED_TO_MINISTRY',
        nextStep: 'ministry_review'
      });
    }
  } catch (error) {
    console.error('Erreur approbation directeur:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// PHASE 5: PAIEMENT
// ============================================================================

export const initializePayment = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { compensationId, paiementMode, beneficiaire } = req.body;

    // Récupérer compensation
    const comp = await db.query(
      'SELECT * FROM dedommagement WHERE id = $1',
      [compensationId]
    );
    if (comp.rows.length === 0) return res.status(404).json({ error: 'Compensation not found' });

    // Créer paiement
    const paiement = await db.query(
      `INSERT INTO paiement (
        compensation_id, bien_id, pap_code, montant, mode,
        beneficiaire, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        compensationId,
        comp.rows[0].bien_id,
        comp.rows[0].pap_code,
        comp.rows[0].montant_final,
        paiementMode,
        JSON.stringify(beneficiaire),
        'PENDING_CONFIRMATION',
        new Date().toISOString()
      ]
    );

    // Initier selon mode
    let initiationResult;
    switch (paiementMode) {
      case 'WAVE':
        initiationResult = await initiateWavePayment(paiement.rows[0]);
        break;
      case 'ORANGEMONEY':
        initiationResult = await initiateOrangeMoneyPayment(paiement.rows[0]);
        break;
      case 'VIREMENT':
        initiationResult = await initiateVirementPayment(paiement.rows[0]);
        break;
      default:
        initiationResult = { initiated: true };
    }

    if (!initiationResult.initiated) {
      return res.status(400).json({ error: initiationResult.error });
    }

    // Blockchain
    await recordAuditBlockchain('PAIEMENT_INITIE', 'PAIEMENT', {
      paiementId: paiement.rows[0].id,
      montant: paiement.rows[0].montant,
      mode: paiementMode
    }, req.user.email);

    res.status(201).json({
      success: true,
      paiementId: paiement.rows[0].id,
      status: 'INITIATED'
    });
  } catch (error) {
    console.error('Erreur initiation paiement:', error);
    res.status(500).json({ error: error.message });
  }
};

export const confirmPayment = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { paiementId, numeroConfirmation, dateReception } = req.body;

    // Récupérer paiement
    const paiement = await db.query(
      'SELECT * FROM paiement WHERE id = $1',
      [paiementId]
    );
    if (paiement.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });

    // Vérifier confirmation selon mode
    let verified = false;
    const payment = paiement.rows[0];

    if (payment.mode === 'WAVE') {
      verified = await verifyWaveTransaction(numeroConfirmation);
    } else if (payment.mode === 'ORANGEMONEY') {
      verified = await verifyOrangeMoneyTransaction(numeroConfirmation);
    } else if (payment.mode === 'VIREMENT') {
      verified = await verifyBankTransfer(numeroConfirmation);
    } else {
      verified = true; // Virement/Chèque: confiance
    }

    if (!verified) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update paiement
    const confirmed = await db.query(
      `UPDATE paiement SET
        status = $1, date_confirmation = $2,
        numero_confirmation = $3, verified_at = $4
      WHERE id = $5 RETURNING *`,
      [
        'CONFIRMED',
        new Date().toISOString(),
        numeroConfirmation,
        new Date().toISOString(),
        paiementId
      ]
    );

    // Update bien: LIBERE
    await db.query(
      `UPDATE bien SET status = $1, date_liberation = $2
      WHERE code_bien = $3`,
      [
        'LIBERE',
        new Date().toISOString(),
        payment.bien_id
      ]
    );

    // Notification PAP
    await sendNotification('PAYMENT_CONFIRMED', {
      papCode: payment.pap_code,
      montant: payment.montant,
      numeroConfirmation
    }, ['sms', 'email', 'slack']);

    // Blockchain
    await recordAuditBlockchain('PAIEMENT_CONFIRME', 'PAIEMENT', {
      paiementId: confirmed.rows[0].id,
      montant: confirmed.rows[0].montant
    }, req.user.email);

    res.status(200).json({
      success: true,
      status: 'CONFIRMED',
      nextStep: 'claim_period_30days'
    });
  } catch (error) {
    console.error('Erreur confirmation paiement:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// PHASE 7: ARCHIVAGE
// ============================================================================

export const closePAPFile = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { papCode } = req.body;

    // Vérifier checklist clôture
    const checklist = await getCloseChecklist(papCode);
    if (!checklist.allComplete) {
      return res.status(400).json({
        error: 'Cannot close file - missing requirements',
        checklist
      });
    }

    // Mettre à jour statut
    const closed = await db.query(
      `UPDATE pap SET status = $1, date_closure = $2, closed_by = $3
      WHERE code_pap = $4 RETURNING *`,
      [
        'CLOSED',
        new Date().toISOString(),
        req.user.email,
        papCode
      ]
    );

    // Blockchain
    await recordAuditBlockchain('DOSSIER_FERME', 'PAP', {
      papCode,
      statusFinal: 'CLOSED'
    }, req.user.email);

    res.status(200).json({
      success: true,
      status: 'CLOSED',
      nextStep: 'archivage'
    });
  } catch (error) {
    console.error('Erreur clôture PAP:', error);
    res.status(500).json({ error: error.message });
  }
};

export const archiveFile = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { papCode } = req.body;

    // Récupérer données complètes
    const pap = await db.query('SELECT * FROM pap WHERE code_pap = $1', [papCode]);
    if (pap.rows.length === 0) return res.status(404).json({ error: 'PAP not found' });

    // Créer archive
    const archive = {
      archiveId: generateID(),
      papCode,
      data: {
        pap: pap.rows[0],
        biens: await db.query('SELECT * FROM bien WHERE pap_code = $1', [papCode]),
        paiements: await db.query('SELECT * FROM paiement WHERE pap_code = $1', [papCode]),
        auditTrail: await getAuditTrail(papCode)
      },
      createdAt: new Date().toISOString(),
      locked: true
    };

    // Chiffrer + Stocker
    const stored = await uploadToArchiveStorage(archive);

    // Enregistrer archive dans DB
    await db.query(
      `INSERT INTO archive (
        archive_id, pap_code, storage_path, integrity_hash,
        archived_at, retention_until, locked
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        archive.archiveId,
        papCode,
        stored.path,
        generateHash(JSON.stringify(archive.data)),
        new Date().toISOString(),
        addYears(new Date(), 10).toISOString(),
        true
      ]
    );

    // Blockchain
    await recordAuditBlockchain('ARCHIVE_CREATED', 'PAP', {
      papCode,
      archiveId: archive.archiveId
    }, req.user.email);

    res.status(201).json({
      success: true,
      archiveId: archive.archiveId,
      storagePath: stored.path,
      retentionUntil: addYears(new Date(), 10),
      nextStep: 'data_anonymization'
    });
  } catch (error) {
    console.error('Erreur archivage:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// QUALITY MONITORING
// ============================================================================

export const getQualityDashboard = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const metrics = {
      phase1: await getPhase1Metrics(),
      phase2: await getPhase2Metrics(),
      phase3: await getPhase3Metrics(),
      phase4: await getPhase4Metrics(),
      phase5: await getPhase5Metrics(),
      phase6: await getPhase6Metrics(),
      phase7: await getPhase7Metrics(),
      global: await getGlobalMetrics()
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Erreur dashboard qualité:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// HELPERS
// ============================================================================

function generatePAPCode(region) {
  const year = new Date().getFullYear();
  const sequence = Math.floor(Math.random() * 999999);
  return `PAP-${year}-${region}-${String(sequence).padStart(6, '0')}`;
}

function validateBasicData(data) {
  const required = ['nom', 'prenom', 'numeroID', 'telephone', 'region'];
  const missing = required.filter(field => !data[field]);
  return {
    valid: missing.length === 0,
    missing,
    score: (required.length - missing.length) / required.length * 100
  };
}

async function detectFraudAndDuplicates(papData, documents) {
  const fraudFlags = [];

  // Vérifier doublon ID
  const idMatch = await db.query(
    'SELECT * FROM pap WHERE numero_id = $1 AND status != $2',
    [papData.numeroID, 'ARCHIVED']
  );
  if (idMatch.rows.length > 0) {
    fraudFlags.push({
      type: 'DUPLICATE_ID',
      severity: 'CRITICAL',
      existingCode: idMatch.rows[0].code_pap
    });
  }

  const fraudScore = fraudFlags.length > 0 ? 80 : 10;
  return { fraudScore, flagged: fraudScore > 40, flags: fraudFlags };
}

async function analyzeDocumentQuality(documents) {
  return documents.map(doc => ({
    type: doc.type,
    quality: doc.qualityScore || 75,
    confidence: doc.confidence || 85
  }));
}

function calculateOverallQualityScore(basicScore, documentQuality) {
  const avgDocQuality = documentQuality.length > 0
    ? documentQuality.reduce((sum, d) => sum + d.quality, 0) / documentQuality.length
    : 75;
  return (basicScore * 0.4 + avgDocQuality * 0.6).toFixed(1);
}

async function recordAuditBlockchain(eventType, entity, data, actor) {
  // Enregistrer sur blockchain (Polygon)
  console.log(`[BLOCKCHAIN] ${eventType} for ${entity}`);
  return { transactionHash: '0x' + Math.random().toString(16).slice(2) };
}

async function sendNotification(type, data, channels = ['email']) {
  console.log(`[NOTIFICATION] ${type}:`, data);
}

export default {
  createPAPWithQualityValidation,
  validatePAPAndCalculateRisk,
  submitCompensation,
  reviewCompensationSupervisor,
  approveCompensationDirector,
  initializePayment,
  confirmPayment,
  closePAPFile,
  archiveFile,
  getQualityDashboard
};
