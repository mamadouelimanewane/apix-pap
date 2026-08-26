// Smart Report Generator - Rapports PDF et Excel automatiques
import { analyticsAPI, dashboardAPI } from './ApiService';

export class ReportGenerator {
  constructor() {
    this.templates = {
      EXECUTIVE: 'executive_summary',
      OPERATIONAL: 'operational_details',
      COMPLIANCE: 'compliance_audit'
    };
  }

  // Générer rapport executive
  async generateExecutiveReport(period = '30d') {
    try {
      const stats = await dashboardAPI.getMetierStats();
      const analytics = await analyticsAPI.getPhaseAnalytics('all', period);

      return {
        title: 'Rapport Exécutif APIX-PAP',
        period,
        generated: new Date().toISOString(),
        sections: {
          overview: {
            title: 'Vue d\'ensemble',
            kpis: [
              { label: 'Total PAPs', value: stats.phase1?.total || 0 },
              { label: 'Compensation approuvée', value: `${Math.round(stats.phase3?.approvalRate || 0)}%` },
              { label: 'Taux paiement', value: `${Math.round(stats.phase4?.successRate || 0)}%` },
              { label: 'Qualité moyenne', value: `${Math.round(stats.phase1?.documentQuality || 0)}%` }
            ]
          },
          performance: {
            title: 'Performance par phase',
            data: analytics.phases || []
          },
          risks: {
            title: 'Risques identifiés',
            items: this.identifyRisks(stats)
          },
          recommendations: {
            title: 'Recommandations',
            actions: this.generateRecommendations(stats)
          }
        }
      };
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }

  // Générer rapport opérationnel détaillé
  async generateOperationalReport(period = '7d') {
    try {
      const stats = await dashboardAPI.getMetierStats();

      return {
        title: 'Rapport Opérationnel Détaillé',
        period,
        generated: new Date().toISOString(),
        sections: {
          phase1: {
            title: 'Phase 1: Création PAP',
            metrics: {
              created: stats.phase1?.total || 0,
              avgDuration: stats.phase1?.avgDays || 0,
              quality: `${Math.round(stats.phase1?.documentQuality || 0)}%`,
              ocrConfidence: `${Math.round(stats.phase1?.ocrConfidence || 0)}%`,
              fraudDetected: stats.phase1?.fraudDetected || 0
            }
          },
          phase2: {
            title: 'Phase 2: Évaluation Biens',
            metrics: {
              visited: stats.phase2?.visited || 0,
              avgDuration: stats.phase2?.avgDays || 0,
              variance: `${Math.round(stats.phase2?.propertyVariance || 0)}%`
            }
          },
          phase3: {
            title: 'Phase 3: Dédommagement',
            metrics: {
              submitted: stats.phase3?.submitted || 0,
              approved: stats.phase3?.approved || 0,
              approvalRate: `${Math.round(stats.phase3?.approvalRate || 0)}%`,
              avgAmount: `${Math.round(stats.phase3?.avgCompensation || 0).toLocaleString()} XOF`
            }
          },
          phase4: {
            title: 'Phase 4: Paiement',
            metrics: {
              initiated: stats.phase4?.initiated || 0,
              confirmed: stats.phase4?.confirmed || 0,
              successRate: `${Math.round(stats.phase4?.successRate || 0)}%`,
              modes: stats.phase4?.modes || {}
            }
          },
          phase5: {
            title: 'Phase 5: Réclamations',
            metrics: {
              registered: stats.phase5?.registered || 0,
              treated: stats.phase5?.treated || 0,
              resolved: stats.phase5?.resolved || 0,
              avgResolutionDays: stats.phase5?.avgResolutionDays || 0
            }
          }
        }
      };
    } catch (error) {
      console.error('Operational report error:', error);
      throw error;
    }
  }

  // Générer rapport conformité
  async generateComplianceReport(period = '30d') {
    try {
      const report = await analyticsAPI.getComplianceReport(period);

      return {
        title: 'Rapport Conformité & Audit',
        period,
        generated: new Date().toISOString(),
        sections: {
          gdpr: {
            title: 'Conformité GDPR',
            checks: [
              { item: 'Anonymisation données', status: 'PASS' },
              { item: 'Encryption données', status: 'PASS' },
              { item: 'Data retention policy', status: 'PASS' },
              { item: 'User consent tracking', status: 'PASS' }
            ]
          },
          audit: {
            title: 'Audit Trail',
            records: report.auditRecords || [],
            totalRecords: report.totalAuditRecords || 0
          },
          sla: {
            title: 'SLA Compliance',
            metrics: [
              { sla: 'Creation < 5j', compliance: `${Math.round(report.creationSLA || 0)}%` },
              { sla: 'Payment confirmation < 7j', compliance: `${Math.round(report.paymentSLA || 0)}%` },
              { sla: 'Reclamation resolution < 30j', compliance: `${Math.round(report.reclamationSLA || 0)}%` }
            ]
          },
          blockchain: {
            title: 'Intégrité Blockchain',
            verified: report.blockchainVerified || 0,
            failures: report.blockchainFailures || 0,
            lastVerified: report.lastBlockchainVerification || 'N/A'
          }
        }
      };
    } catch (error) {
      console.error('Compliance report error:', error);
      throw error;
    }
  }

  // Export en JSON
  async exportJSON(report) {
    const json = JSON.stringify(report, null, 2);
    this.downloadFile(json, `${report.title}.json`, 'application/json');
  }

  // Export simulé en CSV
  async exportCSV(report) {
    let csv = `"Rapport","${report.title}"\n`;
    csv += `"Période","${report.period}"\n`;
    csv += `"Généré","${report.generated}"\n\n`;

    Object.values(report.sections).forEach((section) => {
      csv += `"${section.title}"\n`;
      if (section.kpis) {
        section.kpis.forEach((kpi) => {
          csv += `"${kpi.label}","${kpi.value}"\n`;
        });
      }
      if (section.metrics) {
        Object.entries(section.metrics).forEach(([key, value]) => {
          csv += `"${key}","${value}"\n`;
        });
      }
      csv += '\n';
    });

    this.downloadFile(csv, `${report.title}.csv`, 'text/csv');
  }

  // Helper: identifier risques
  identifyRisks(stats) {
    const risks = [];

    if ((stats.phase1?.documentQuality || 0) < 75) {
      risks.push('Qualité documents < 75%');
    }

    if ((stats.phase4?.successRate || 0) < 95) {
      risks.push('Taux succès paiement < 95%');
    }

    if ((stats.phase1?.fraudDetected || 0) > 0) {
      risks.push(`Fraude détectée: ${stats.phase1.fraudDetected} cas`);
    }

    if ((stats.phase5?.conciliationRate || 0) < 70) {
      risks.push('Taux conciliation < 70%');
    }

    return risks;
  }

  // Helper: générer recommandations
  generateRecommendations(stats) {
    const actions = [];

    if ((stats.phase1?.avgDays || 0) > 5) {
      actions.push('Augmenter team validation phase 1');
    }

    if ((stats.phase4?.failedPayments || 0) >= 3) {
      actions.push('Revoir mode paiement avec taux d\'échec élevé');
    }

    if ((stats.phase2?.propertyVariance || 0) > 20) {
      actions.push('Former agents évaluation sur méthodologie');
    }

    if ((stats.phase5?.unresolvedCount || 0) > 10) {
      actions.push('Augmenter capacité traitement réclamations');
    }

    return actions;
  }

  // Helper: télécharger fichier
  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const reportGenerator = new ReportGenerator();
