// Monitoring en temps réel du workflow de qualité
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  AlertCircle, CheckCircle, Clock, TrendingUp, AlertTriangle,
  FileText, DollarSign, Archive, MessageSquare
} from 'lucide-react';

export default function WorkflowQualityMonitor() {
  const [data, setData] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState('global');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQualityMetrics();
    const interval = setInterval(loadQualityMetrics, 30000); // Refresh 30s
    return () => clearInterval(interval);
  }, []);

  const loadQualityMetrics = async () => {
    try {
      const response = await fetch('/api/quality/dashboard');
      const metrics = await response.json();
      setData(metrics);
      detectAlerts(metrics);
    } catch (error) {
      console.error('Erreur chargement métriques:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectAlerts = (metrics) => {
    const detectedAlerts = [];

    // Phase Delays
    if (metrics.phase1?.rejectRate > 0.05) {
      detectedAlerts.push({
        id: 'phase1-reject',
        severity: 'HIGH',
        message: `Taux rejet Phase 1: ${(metrics.phase1.rejectRate * 100).toFixed(1)}%`,
        action: 'Vérifier qualité documents'
      });
    }

    // Quality Drops
    if (metrics.phase3?.ocrAccuracyRate < 80) {
      detectedAlerts.push({
        id: 'phase3-ocr',
        severity: 'MEDIUM',
        message: `Confiance OCR: ${metrics.phase3.ocrAccuracyRate}%`,
        action: 'Améliorer éclairage/qualité photos'
      });
    }

    // Payment Delays
    if (metrics.phase5?.paymentProcessingTime > 7) {
      detectedAlerts.push({
        id: 'phase5-payment',
        severity: 'MEDIUM',
        message: `Délai paiement: ${metrics.phase5.paymentProcessingTime} jours`,
        action: 'Accélérer confirmations paiement'
      });
    }

    // Archive Issues
    if (metrics.phase7?.archiveIntegrity < 99) {
      detectedAlerts.push({
        id: 'phase7-archive',
        severity: 'CRITICAL',
        message: 'Problème intégrité archive détecté',
        action: 'Vérifier backup et restore'
      });
    }

    setAlerts(detectedAlerts);
  };

  if (loading) return <div className="p-6">Chargement métriques...</div>;
  if (!data) return <div className="p-6">Erreur chargement données</div>;

  const phases = [
    { id: 'phase1', label: 'Création', color: '#3b82f6' },
    { id: 'phase2', label: 'Enregistrement', color: '#8b5cf6' },
    { id: 'phase3', label: 'Évaluation', color: '#ec4899' },
    { id: 'phase4', label: 'Dédommagement', color: '#f59e0b' },
    { id: 'phase5', label: 'Paiement', color: '#10b981' },
    { id: 'phase6', label: 'Réclamations', color: '#06b6d4' },
    { id: 'phase7', label: 'Archivage', color: '#6366f1' }
  ];

  const timelineData = [
    { phase: 'Création', jours: 4, cible: 5 },
    { phase: 'Enregistrement', jours: 2, cible: 3 },
    { phase: 'Évaluation', jours: 6, cible: 7 },
    { phase: 'Dédommagement', jours: 6, cible: 7 },
    { phase: 'Paiement', jours: 2, cible: 3 },
    { phase: 'Réclamations', jours: 15, cible: 30 },
    { phase: 'Archivage', jours: 2, cible: 3 }
  ];

  const qualityScores = [
    { phase: 'Phase 1', score: data.phase1?.avgQualityScore || 0, target: 80 },
    { phase: 'Phase 2', score: data.phase2?.cadastreValidationRate * 100 || 0, target: 95 },
    { phase: 'Phase 3', score: data.phase3?.photoQualityAverage || 0, target: 85 },
    { phase: 'Phase 4', score: data.phase4?.compensationApprovalRate * 100 || 0, target: 90 },
    { phase: 'Phase 5', score: data.phase5?.paymentSuccessRate * 100 || 0, target: 98 },
    { phase: 'Phase 6', score: data.phase6?.resolutionRate * 100 || 0, target: 95 },
    { phase: 'Phase 7', score: data.phase7?.archiveIntegrity || 0, target: 100 }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Qualité Workflow APIX-PAP</h1>
        <p className="text-gray-600">Monitoring temps réel de la qualité à chaque phase</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Alertes Qualité ({alerts.length})
          </h2>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded border-l-4 ${
                  alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-400' :
                  alert.severity === 'HIGH' ? 'bg-orange-50 border-orange-400' :
                  'bg-yellow-50 border-yellow-400'
                }`}
              >
                <p className="font-semibold text-gray-900">{alert.message}</p>
                <p className="text-sm text-gray-600">→ {alert.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs Globaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Traité</p>
              <p className="text-3xl font-bold text-gray-900">
                {data.global?.totalProcessed || 0}
              </p>
            </div>
            <FileText className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Qualité Globale</p>
              <p className="text-3xl font-bold text-gray-900">
                {(data.global?.overallQuality || 0).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Durée Moyenne</p>
              <p className="text-3xl font-bold text-gray-900">
                {(data.global?.avgTimelinePerFile || 0).toFixed(0)}j
              </p>
            </div>
            <Clock className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Archivés</p>
              <p className="text-3xl font-bold text-gray-900">
                {data.phase7?.filesArchived || 0}
              </p>
            </div>
            <Archive className="w-10 h-10 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Phase Selection */}
      <div className="mb-8 bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedPhase('global')}
            className={`px-4 py-2 rounded ${
              selectedPhase === 'global'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            Vue Globale
          </button>
          {phases.map(phase => (
            <button
              key={phase.id}
              onClick={() => setSelectedPhase(phase.id)}
              className={`px-4 py-2 rounded ${
                selectedPhase === phase.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {phase.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Durée par Phase</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="phase" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="jours" fill="#3b82f6" name="Réel" />
              <Bar dataKey="cible" fill="#d1d5db" name="Cible" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quality Scores */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Scores Qualité</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={qualityScores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="phase" angle={-45} textAnchor="end" height={100} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="score" fill="#10b981" name="Réel" />
              <Bar dataKey="target" fill="#d1d5db" name="Cible" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Mode Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Distribution Modes Paiement</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {data.phase5?.modeDistribution?.map((mode, i) => (
            <div key={i} className="p-4 border rounded text-center">
              <p className="text-lg font-bold text-gray-900">{mode.mode}</p>
              <p className="text-2xl font-bold text-blue-600">{mode.count}</p>
              <p className="text-sm text-gray-600">{(mode.percentage).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Details */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Détails Phase Sélectionnée</h2>

        {selectedPhase === 'global' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <p className="text-gray-600">Taux Complétion</p>
              <p className="text-2xl font-bold">{(data.global?.overallQuality || 0).toFixed(1)}%</p>
            </div>
            <div className="p-4 border rounded">
              <p className="text-gray-600">Vérification Blockchain</p>
              <p className="text-2xl font-bold">{data.global?.blockchainVerified}%</p>
            </div>
            <div className="p-4 border rounded">
              <p className="text-gray-600">Uptime</p>
              <p className="text-2xl font-bold">{data.global?.uptime}%</p>
            </div>
            <div className="p-4 border rounded">
              <p className="text-gray-600">Durée Moyenne</p>
              <p className="text-2xl font-bold">{data.global?.avgTimelinePerFile.toFixed(0)} jours</p>
            </div>
          </div>
        )}

        {selectedPhase === 'phase1' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <p className="text-gray-600">PAP Créés</p>
              <p className="text-2xl font-bold">{data.phase1?.papCreated}</p>
            </div>
            <div className="p-4 border rounded">
              <p className="text-gray-600">Score Qualité Moyen</p>
              <p className="text-2xl font-bold">{data.phase1?.avgQualityScore.toFixed(1)}</p>
            </div>
            <div className="p-4 border rounded">
              <p className="text-gray-600">Taux Fraude Détecté</p>
              <p className="text-2xl font-bold">{(data.phase1?.fraudDetectionRate * 100).toFixed(2)}%</p>
            </div>
            <div className="p-4 border rounded">
              <p className="text-gray-600">Taux Rejet</p>
              <p className="text-2xl font-bold">{(data.phase1?.rejectRate * 100).toFixed(2)}%</p>
            </div>
          </div>
        )}

        {selectedPhase === 'phase5' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <p className="text-gray-600">Taux Succès Paiement</p>
              <p className="text-2xl font-bold">{(data.phase5?.paymentSuccessRate * 100).toFixed(1)}%</p>
            </div>
            <div className="p-4 border rounded">
              <p className="text-gray-600">Durée Traitement</p>
              <p className="text-2xl font-bold">{data.phase5?.paymentProcessingTime.toFixed(1)} jours</p>
            </div>
            <div className="p-4 border rounded">
              <p className="text-gray-600">Compensation Totale</p>
              <p className="text-2xl font-bold">
                {(data.phase5?.estimatedTotalCompensation / 1000000).toFixed(1)}M CFA
              </p>
            </div>
          </div>
        )}

        {selectedPhase === 'phase7' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <p className="text-gray-600">Fichiers Archivés</p>
              <p className="text-2xl font-bold">{data.phase7?.filesArchived}</p>
            </div>
            <div className="p-4 border rounded">
              <p className="text-gray-600">Intégrité Archive</p>
              <p className="text-2xl font-bold">{data.phase7?.archiveIntegrity}%</p>
            </div>
            <div className="p-4 border rounded">
              <p className="text-gray-600">Taux Anonymisation</p>
              <p className="text-2xl font-bold">{(data.phase7?.anonymizationRate * 100).toFixed(1)}%</p>
            </div>
            <div className="p-4 border rounded">
              <p className="text-gray-600">Conformité Rétention</p>
              <p className="text-2xl font-bold">{data.phase7?.retentionCompliance ? '✅' : '❌'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
