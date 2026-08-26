// Notification Service - Système d'alertes intelligentes
// Détecte anomalies, bottlenecks, recommande actions

import { dashboardAPI } from './ApiService';

// ============================================================================
// SYSTÈME D'ALERTES INTELLIGENTES
// ============================================================================

export class IntelligentNotificationSystem {
  constructor() {
    this.alerts = [];
    this.lastCheck = null;
    this.checkInterval = 5 * 60 * 1000; // 5 minutes
    this.monitoringActive = false;
  }

  // Démarrer monitoring
  start() {
    if (this.monitoringActive) return;
    this.monitoringActive = true;
    this.monitor();
    this.intervalId = setInterval(() => this.monitor(), this.checkInterval);
    console.log('🔔 Notification monitoring started');
  }

  // Arrêter monitoring
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.monitoringActive = false;
  }

  // Monitoring principal
  async monitor() {
    try {
      const stats = await dashboardAPI.getMetierStats();

      // Vérifier chaque type d'alerte
      this.checkPhaseBottlenecks(stats);
      this.checkSLAViolations(stats);
      this.checkQualityDrops(stats);
      this.checkFraudDetection(stats);
      this.checkPaymentIssues(stats);
      this.checkReclamationBacklog(stats);

      this.lastCheck = new Date();
      this.cleanup();
    } catch (error) {
      console.error('Erreur monitoring:', error);
    }
  }

  // ============================================================================
  // 1. DÉTECTION GOULOTS D'ÉTRANGLEMENT (Bottleneck)
  // ============================================================================

  checkPhaseBottlenecks(stats) {
    const phases = [
      { name: 'phase1', label: 'Création PAP', avgDays: 4, target: 5 },
      { name: 'phase2', label: 'Évaluation', avgDays: 6, target: 7 },
      { name: 'phase3', label: 'Dédommagement', avgDays: 6, target: 7 },
      { name: 'phase4', label: 'Paiement', avgDays: 2, target: 3 },
      { name: 'phase5', label: 'Réclamations', avgDays: 15, target: 30 }
    ];

    phases.forEach((phase) => {
      const phaseStats = stats[phase.name];
      if (!phaseStats) return;

      const slowdown = ((phaseStats.avgDays - phase.avgDays) / phase.avgDays) * 100;

      if (slowdown > 15) {
        this.addAlert({
          id: `bottleneck_${phase.name}`,
          type: 'BOTTLENECK',
          severity: slowdown > 30 ? 'HIGH' : 'MEDIUM',
          title: `⏱️ Goulot: ${phase.label}`,
          message: `Phase ${phase.label} est ${Math.round(slowdown)}% plus lente (+${Math.round(phaseStats.avgDays - phase.avgDays)}j)`,
          recommendation: this.getBottleneckRecommendation(phase),
          timestamp: new Date(),
          channels: ['email', 'slack']
        });
      }
    });
  }

  getBottleneckRecommendation(phase) {
    const recommendations = {
      phase1: 'Augmenter team validation, accélérer scan fraude',
      phase2: 'Planifier plus de visites terrain, augmenter agents',
      phase3: 'Ajouter superviseur, réduire batch dossiers',
      phase4: 'Relancer paiements non-confirmés',
      phase5: 'Escalader conciliations non-résolues'
    };
    return recommendations[phase.name] || 'Analyser la phase';
  }

  // ============================================================================
  // 2. VIOLATIONS SLA (Service Level Agreement)
  // ============================================================================

  checkSLAViolations(stats) {
    if (stats.phase1?.overduePAPs > 0) {
      this.addAlert({
        id: 'sla_creation',
        type: 'SLA_VIOLATION',
        severity: 'HIGH',
        title: '⚠️ SLA Violation: Création PAP',
        message: `${stats.phase1.overduePAPs} PAPs dépassent 7j en création`,
        papCodes: stats.phase1.overduePAPCodes || [],
        recommendation: 'Escalader creation tasks, priorité agent',
        timestamp: new Date(),
        channels: ['sms', 'email']
      });
    }

    if (stats.phase4?.unconfirmedDays > 7) {
      this.addAlert({
        id: 'sla_payment',
        type: 'SLA_VIOLATION',
        severity: 'CRITICAL',
        title: '🚨 SLA Violation: Paiement non-confirmé',
        message: `${stats.phase4.unconfirmedCount} paiements en attente > 7 jours`,
        recommendation: 'Contacter PAPs immédiatement, relancer manuellement',
        timestamp: new Date(),
        channels: ['sms', 'email', 'slack']
      });
    }

    if (stats.phase5?.unresolvedDays > 20) {
      this.addAlert({
        id: 'sla_reclamation',
        type: 'SLA_VIOLATION',
        severity: 'HIGH',
        title: '⚠️ SLA Alerte: Réclamation non-résolue',
        message: `${stats.phase5.unresolvedCount} réclamations sans résolution (J${Math.round(stats.phase5.unresolvedDays)}/30)`,
        recommendation: 'Planifier conciliation immédiatement',
        timestamp: new Date(),
        channels: ['email', 'slack']
      });
    }
  }

  // ============================================================================
  // 3. CHUTES QUALITÉ
  // ============================================================================

  checkQualityDrops(stats) {
    if (stats.phase1?.documentQuality < 75) {
      this.addAlert({
        id: 'quality_documents',
        type: 'QUALITY_DROP',
        severity: 'MEDIUM',
        title: '📉 Qualité Documents: Baisse détectée',
        message: `Qualité moyennes documents: ${Math.round(stats.phase1.documentQuality)}% (cible: ≥85%)`,
        recommendation: 'Améliorer éclairage photos, re-capturer mauvaise qualité',
        timestamp: new Date(),
        channels: ['email']
      });
    }

    if (stats.phase1?.ocrConfidence < 80) {
      this.addAlert({
        id: 'quality_ocr',
        type: 'QUALITY_DROP',
        severity: 'MEDIUM',
        title: '📉 OCR Confiance: Baisse',
        message: `Confiance OCR: ${Math.round(stats.phase1.ocrConfidence)}% (cible: ≥85%)`,
        recommendation: 'Vérifier manuellement extractions, améliorer résolution',
        timestamp: new Date(),
        channels: ['email']
      });
    }

    if (stats.phase2?.propertyVariance > 20) {
      this.addAlert({
        id: 'quality_evaluation',
        type: 'QUALITY_DROP',
        severity: 'MEDIUM',
        title: '📉 Variance Évaluation: Élevée',
        message: `Variance propriétés: ${Math.round(stats.phase2.propertyVariance)}% (cible: <15%)`,
        recommendation: 'Revoir méthodologie évaluation, former agents',
        timestamp: new Date(),
        channels: ['email', 'slack']
      });
    }
  }

  // ============================================================================
  // 4. FRAUDE DÉTECTÉE
  // ============================================================================

  checkFraudDetection(stats) {
    if (stats.phase1?.fraudDetected > 0) {
      this.addAlert({
        id: `fraud_${Date.now()}`,
        type: 'FRAUD_DETECTED',
        severity: 'CRITICAL',
        title: '🚨 Fraude Détectée',
        message: `${stats.phase1.fraudDetected} fraude(s) détectée(s) cette semaine`,
        papCodes: stats.phase1.fraudCodes || [],
        recommendation: 'Escalader à Admin/Police immédiatement',
        timestamp: new Date(),
        channels: ['sms', 'email', 'slack']
      });
    }

    if (stats.phase1?.suspiciousClusters > 0) {
      this.addAlert({
        id: 'fraud_cluster',
        type: 'FRAUD_DETECTED',
        severity: 'HIGH',
        title: '🔴 Cluster Suspect Détecté',
        message: `${stats.phase1.suspiciousClusters} cluster(s) géo suspect(s)`,
        recommendation: 'Enquête terrain spéciale, vérifier photos',
        timestamp: new Date(),
        channels: ['email', 'slack']
      });
    }
  }

  // ============================================================================
  // 5. PROBLÈMES PAIEMENT
  // ============================================================================

  checkPaymentIssues(stats) {
    if (stats.phase4?.failedPayments >= 3) {
      this.addAlert({
        id: 'payment_failure',
        type: 'PAYMENT_ISSUE',
        severity: 'HIGH',
        title: '💳 Paiements Échoués',
        message: `${stats.phase4.failedPayments} paiements échoués (≥3 tentatives)`,
        recommendation: 'Contact PAP, alternative mode paiement',
        timestamp: new Date(),
        channels: ['sms', 'email']
      });
    }

    if (stats.phase4?.successRate < 95) {
      this.addAlert({
        id: 'payment_success_rate',
        type: 'PAYMENT_ISSUE',
        severity: 'MEDIUM',
        title: '📉 Taux Succès Paiement',
        message: `Taux succès: ${Math.round(stats.phase4.successRate)}% (cible: ≥98%)`,
        recommendation: 'Analyser mode avec plus d\'échecs',
        timestamp: new Date(),
        channels: ['email']
      });
    }
  }

  // ============================================================================
  // 6. ARRIÉRÉ RÉCLAMATIONS
  // ============================================================================

  checkReclamationBacklog(stats) {
    if (stats.phase5?.untreatedReclamations > 10) {
      this.addAlert({
        id: 'reclamation_backlog',
        type: 'BACKLOG',
        severity: 'MEDIUM',
        title: '📚 Arriéré Réclamations',
        message: `${stats.phase5.untreatedReclamations} réclamations non-traitées`,
        recommendation: 'Augmenter capacité traitement',
        timestamp: new Date(),
        channels: ['email', 'slack']
      });
    }

    if (stats.phase5?.conciliationRate < 70) {
      this.addAlert({
        id: 'conciliation_rate',
        type: 'BACKLOG',
        severity: 'MEDIUM',
        title: '📉 Taux Conciliation',
        message: `Taux conciliation: ${Math.round(stats.phase5.conciliationRate)}% (cible: ≥80%)`,
        recommendation: 'Améliorer processus conciliation, formation',
        timestamp: new Date(),
        channels: ['email']
      });
    }
  }

  // ============================================================================
  // HELPER: Ajouter alert sans doublon
  // ============================================================================

  addAlert(alert) {
    const existing = this.alerts.find(a => a.id === alert.id);
    if (!existing) {
      this.alerts.push(alert);
    }
  }

  // ============================================================================
  // RÉCUPÉRER ALERTES
  // ============================================================================

  getAlerts(severity = null) {
    if (!severity) {
      return this.alerts;
    }
    return this.alerts.filter((a) => a.severity === severity);
  }

  getAlertsByType(type) {
    return this.alerts.filter((a) => a.type === type);
  }

  // Nettoyer anciennes alertes (> 24h)
  cleanup() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter((a) => a.timestamp > cutoff);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let notificationSystemInstance = null;

export function getNotificationSystem() {
  if (!notificationSystemInstance) {
    notificationSystemInstance = new IntelligentNotificationSystem();
  }
  return notificationSystemInstance;
}

export default {
  IntelligentNotificationSystem,
  getNotificationSystem
};
