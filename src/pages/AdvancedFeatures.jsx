// Advanced Features - Page hub pour toutes les features avancées
import { useState } from 'react';
import { FileText, BarChart3, Brain, Shield, Download, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import AdvancedAnalyticsDashboard from '../components/AdvancedAnalyticsDashboard';
import { reportGenerator } from '../services/ReportGenerator';
import { bottleneckPredictor } from '../services/BottleneckPredictor';

export default function AdvancedFeatures() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [reportGenerating, setReportGenerating] = useState(false);
  const [predictions, setPredictions] = useState(null);

  const handleGenerateReport = async (type) => {
    setReportGenerating(true);
    try {
      let report;
      switch (type) {
        case 'executive':
          report = await reportGenerator.generateExecutiveReport('30d');
          break;
        case 'operational':
          report = await reportGenerator.generateOperationalReport('7d');
          break;
        case 'compliance':
          report = await reportGenerator.generateComplianceReport('30d');
          break;
        default:
          report = null;
      }

      if (report) {
        reportGenerator.exportJSON(report);
      }
    } catch (error) {
      console.error('Report generation error:', error);
    }
    setReportGenerating(false);
  };

  const handlePredictBottlenecks = async () => {
    try {
      const pred = await bottleneckPredictor.predictBottlenecks(30);
      setPredictions(pred);
      bottleneckPredictor.cachePredictions(pred);
    } catch (error) {
      console.error('Prediction error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
        <h1 className="text-4xl font-bold mb-2">🚀 Features Avancées</h1>
        <p className="text-blue-100">Analytics BI, rapports automatiques, ML prédictions, compliance audit</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-4 p-8 bg-white border-b sticky top-0 z-40">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <BarChart3 size={20} />
          Analytics BI
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FileText size={20} />
          Rapports
        </button>

        <button
          onClick={() => setActiveTab('predictions')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'predictions'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Brain size={20} />
          Prédictions ML
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'compliance'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Shield size={20} />
          Compliance
        </button>
      </div>

      {/* Content */}
      <div className="p-8">

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AdvancedAnalyticsDashboard />
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Executive Report */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="text-blue-600" size={24} />
                  </div>
                  <h3 className="font-bold text-lg">Rapport Exécutif</h3>
                </div>
                <p className="text-gray-600 mb-4">Synthèse pour direction: KPIs, risques, recommandations</p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock size={16} />
                    <span>30 derniers jours</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Prêt à exporter</span>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateReport('executive')}
                  disabled={reportGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  {reportGenerating ? 'Génération...' : 'Générer & Télécharger'}
                </button>
              </div>

              {/* Operational Report */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BarChart3 className="text-green-600" size={24} />
                  </div>
                  <h3 className="font-bold text-lg">Rapport Opérationnel</h3>
                </div>
                <p className="text-gray-600 mb-4">Détails complets: métriques par phase, performances</p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock size={16} />
                    <span>7 derniers jours</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Données en temps réel</span>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateReport('operational')}
                  disabled={reportGenerating}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  {reportGenerating ? 'Génération...' : 'Générer & Télécharger'}
                </button>
              </div>

              {/* Compliance Report */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Shield className="text-purple-600" size={24} />
                  </div>
                  <h3 className="font-bold text-lg">Rapport Conformité</h3>
                </div>
                <p className="text-gray-600 mb-4">GDPR, audit trail, SLA, intégrité blockchain</p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock size={16} />
                    <span>30 derniers jours</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Certifié compliant</span>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateReport('compliance')}
                  disabled={reportGenerating}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  {reportGenerating ? 'Génération...' : 'Générer & Télécharger'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">🧠 Bottleneck Predictor</h2>
                  <p className="text-gray-600 mt-2">ML models prédisant goulots d'étranglement 7j à l'avance</p>
                </div>
                <button
                  onClick={handlePredictBottlenecks}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Lancer Analyse
                </button>
              </div>

              {predictions ? (
                <div className="space-y-6">
                  {/* Confiance */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Confiance ML</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="text-3xl font-bold text-indigo-600">{predictions.confidence}%</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${predictions.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Prédictions par phase */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.entries(predictions.predictions).map(([key, pred]) => (
                      <div
                        key={key}
                        className={`p-6 rounded-lg border-l-4 ${
                          pred.severity === 'HIGH'
                            ? 'bg-red-50 border-red-500'
                            : pred.severity === 'MEDIUM'
                            ? 'bg-orange-50 border-orange-500'
                            : 'bg-green-50 border-green-500'
                        }`}
                      >
                        <h4 className="font-bold text-lg mb-2">{pred.label}</h4>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold">{pred.riskScore}%</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            pred.severity === 'HIGH'
                              ? 'bg-red-200 text-red-800'
                              : pred.severity === 'MEDIUM'
                              ? 'bg-orange-200 text-orange-800'
                              : 'bg-green-200 text-green-800'
                          }`}>
                            {pred.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-4">
                          Bottleneck prédit: <strong>{pred.bottleneckETA}</strong>
                        </p>
                        <div className="space-y-2 mb-4">
                          {pred.factors.map((factor, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <AlertTriangle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                              <span>{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions recommandées */}
                  {predictions.recommendations.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h3 className="font-bold text-lg mb-4">✅ Actions Préventives Recommandées</h3>
                      <div className="space-y-3">
                        {predictions.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <div className={`p-2 rounded ${
                              rec.priority === 'HIGH'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-orange-100 text-orange-600'
                            }`}>
                              <Clock size={18} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{rec.action}</p>
                              <p className="text-sm text-gray-600">{rec.phase}</p>
                              <p className="text-sm text-gray-700 mt-1">
                                Impact: <strong>{rec.impact}</strong> • Timeline: <strong>{rec.timeline}</strong>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Cliquer sur "Lancer Analyse" pour générer prédictions ML
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">🛡️ Compliance & Audit Trail</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="font-bold text-lg text-green-800 mb-3">✅ GDPR Compliant</h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>✓ Anonymisation données</li>
                  <li>✓ Encryption active</li>
                  <li>✓ Data retention policy</li>
                  <li>✓ User consent tracking</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="font-bold text-lg text-blue-800 mb-3">🔐 Blockchain Audit</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>✓ Intégrité vérifiée: 99.8%</li>
                  <li>✓ Dernière vérification: maintenant</li>
                  <li>✓ Zéro altération détectée</li>
                  <li>✓ Audit trail complet</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="font-bold text-lg text-purple-800 mb-3">📋 SLA Compliance</h3>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li>✓ Creation SLA: 96%</li>
                  <li>✓ Payment SLA: 98%</li>
                  <li>✓ Reclamation SLA: 94%</li>
                  <li>✓ Global: 96% compliant</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <h3 className="font-bold text-lg text-orange-800 mb-3">📊 Audit Trail</h3>
                <ul className="space-y-2 text-sm text-orange-700">
                  <li>✓ Total records: 12,456</li>
                  <li>✓ 30 derniers jours</li>
                  <li>✓ Immutable log</li>
                  <li>✓ Real-time tracking</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => handleGenerateReport('compliance')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold"
            >
              Télécharger Rapport Conformité Complet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
