// Bottleneck Predictor - Prédictions ML pour goulots d'étranglement
import { dashboardAPI } from './ApiService';

export class BottleneckPredictor {
  constructor() {
    this.historicalData = [];
    this.predictions = {};
  }

  // Analyser historique et prédire goulots
  async predictBottlenecks(days = 30) {
    try {
      const stats = await dashboardAPI.getMetierStats();
      const trends = await dashboardAPI.getTrendingData(`${days}d`);

      return {
        predictions: this.analyzePhases(stats, trends),
        confidence: this.calculateConfidence(stats, trends),
        recommendations: this.generatePredictiveActions(stats),
        nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 jours
      };
    } catch (error) {
      console.error('Prediction error:', error);
      return { predictions: {}, confidence: 0, recommendations: [] };
    }
  }

  // Analyser chaque phase pour détecter bottlenecks futurs
  analyzePhases(stats, trends) {
    const predictions = {};

    // Phase 1: Création PAP
    predictions.phase1 = this.predictPhaseBottleneck(
      {
        current: stats.phase1?.avgDays || 4,
        target: 5,
        trend: trends[0]?.phase1Trend || 0,
        queueSize: stats.phase1?.pending || 0
      },
      'Phase 1: Création PAP'
    );

    // Phase 2: Évaluation
    predictions.phase2 = this.predictPhaseBottleneck(
      {
        current: stats.phase2?.avgDays || 6,
        target: 7,
        trend: trends[0]?.phase2Trend || 0,
        queueSize: stats.phase2?.pending || 0
      },
      'Phase 2: Évaluation'
    );

    // Phase 3: Dédommagement
    predictions.phase3 = this.predictPhaseBottleneck(
      {
        current: stats.phase3?.avgDays || 6,
        target: 7,
        trend: trends[0]?.phase3Trend || 0,
        queueSize: stats.phase3?.pending || 0
      },
      'Phase 3: Dédommagement'
    );

    // Phase 4: Paiement
    predictions.phase4 = this.predictPhaseBottleneck(
      {
        current: stats.phase4?.avgDays || 2,
        target: 3,
        trend: trends[0]?.phase4Trend || 0,
        queueSize: stats.phase4?.pending || 0,
        failureRate: stats.phase4?.failureRate || 0
      },
      'Phase 4: Paiement'
    );

    // Phase 5: Réclamations
    predictions.phase5 = this.predictPhaseBottleneck(
      {
        current: stats.phase5?.avgDays || 15,
        target: 30,
        trend: trends[0]?.phase5Trend || 0,
        queueSize: stats.phase5?.untreated || 0
      },
      'Phase 5: Réclamations'
    );

    return predictions;
  }

  // Prédire bottleneck pour une phase
  predictPhaseBottleneck(data, label) {
    const { current, target, trend, queueSize, failureRate } = data;

    // Calcul du risque (0-100%)
    const durationRisk = ((current - target) / target) * 50; // 50% du score
    const trendRisk = (trend || 0) * 30; // 30% du score
    const queueRisk = Math.min((queueSize / 100) * 20, 20); // 20% du score
    const failureRisk = (failureRate || 0) * 10; // 10% du score

    const riskScore = Math.max(0, Math.min(100, durationRisk + trendRisk + queueRisk + failureRisk));

    // Déterminer sévérité
    const severity = riskScore < 25 ? 'LOW' : riskScore < 50 ? 'MEDIUM' : 'HIGH';

    // Prédire timing
    let eta = 'N/A';
    if (riskScore > 50) {
      const daysToBottleneck = Math.max(1, Math.round(7 - (riskScore / 100) * 7));
      eta = `${daysToBottleneck} jours`;
    }

    return {
      label,
      riskScore: Math.round(riskScore),
      severity,
      bottleneckETA: eta,
      metrics: {
        currentDuration: `${Math.round(current)} j`,
        target: `${Math.round(target)} j`,
        trend: trend > 0 ? `↑ ${Math.round(trend * 100)}%` : `↓ ${Math.round(Math.abs(trend) * 100)}%`,
        queueSize
      },
      factors: this.explainRiskFactors(data)
    };
  }

  // Expliquer les facteurs de risque
  explainRiskFactors(data) {
    const factors = [];

    if (data.current > data.target) {
      const slowdown = ((data.current - data.target) / data.target) * 100;
      factors.push(`Phase ${slowdown.toFixed(0)}% plus lente que cible`);
    }

    if ((data.trend || 0) > 0.05) {
      factors.push('Tendance dégradation détectée');
    }

    if ((data.queueSize || 0) > 50) {
      factors.push(`Queue élevée: ${data.queueSize} éléments`);
    }

    if ((data.failureRate || 0) > 0.05) {
      factors.push(`Taux d'échec élevé: ${(data.failureRate * 100).toFixed(1)}%`);
    }

    return factors;
  }

  // Calculer confiance des prédictions (0-100%)
  calculateConfidence(stats, trends) {
    // Basé sur: qualité données, taille historique, variance
    let confidence = 80; // Base

    // Ajuster selon qualité données
    const dataQuality = (stats.phase1?.documentQuality || 75) / 100;
    confidence *= dataQuality;

    // Ajuster selon variance
    const variance = (stats.phase2?.propertyVariance || 15) / 50;
    confidence *= Math.max(0.5, 1 - variance);

    return Math.round(Math.max(0, Math.min(100, confidence)));
  }

  // Générer actions préventives
  generatePredictiveActions(stats) {
    const actions = [];

    // Phase 1
    if ((stats.phase1?.avgDays || 0) > 5) {
      actions.push({
        phase: 'Phase 1',
        action: 'Augmenter team validation',
        priority: 'HIGH',
        impact: 'Réduire de 2-3 jours',
        timeline: 'Immédiat'
      });
    }

    // Phase 2
    if ((stats.phase2?.propertyVariance || 0) > 20) {
      actions.push({
        phase: 'Phase 2',
        action: 'Former agents évaluation',
        priority: 'MEDIUM',
        impact: 'Réduire variance de 10%',
        timeline: '1 semaine'
      });
    }

    // Phase 3
    if ((stats.phase3?.avgDays || 0) > 7) {
      actions.push({
        phase: 'Phase 3',
        action: 'Ajouter superviseur',
        priority: 'HIGH',
        impact: 'Réduire de 2 jours',
        timeline: '3 jours'
      });
    }

    // Phase 4
    if ((stats.phase4?.failureRate || 0) > 0.05) {
      actions.push({
        phase: 'Phase 4',
        action: 'Analyser mode paiement problématique',
        priority: 'HIGH',
        impact: 'Augmenter taux succès',
        timeline: '2 jours'
      });
    }

    // Phase 5
    if ((stats.phase5?.untreated || 0) > 10) {
      actions.push({
        phase: 'Phase 5',
        action: 'Planifier conciliations en masse',
        priority: 'MEDIUM',
        impact: 'Réduire arriéré de 50%',
        timeline: '1 semaine'
      });
    }

    return actions;
  }

  // Obtenir prédictions précédentes (de cache)
  getPredictions() {
    return this.predictions;
  }

  // Mettre en cache les prédictions
  cachePredictions(predictions) {
    this.predictions = predictions;
    localStorage.setItem('bottleneck_predictions', JSON.stringify({
      data: predictions,
      timestamp: Date.now()
    }));
  }

  // Charger prédictions en cache si < 1h
  loadCachedPredictions() {
    const cached = localStorage.getItem('bottleneck_predictions');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 60 * 60 * 1000) {
        this.predictions = data;
        return data;
      }
    }
    return null;
  }
}

export const bottleneckPredictor = new BottleneckPredictor();
