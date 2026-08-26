// Dashboard Métier Redesigned - Organisation Premium
// Vue d'ensemble des 6 phases avec statistiques et actions
import { useState } from 'react';
import { ChevronRight, TrendingUp, Users, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

export default function DashboardMetierRedesigned() {
  const [expandedPhase, setExpandedPhase] = useState(null);

  // Phases avec stats
  const phases = [
    {
      id: 1,
      name: 'Création PAP',
      color: 'from-blue-600 to-cyan-600',
      icon: Users,
      stats: { total: 1240, active: 856, pending: 384 },
      kpis: [
        { label: 'Durée moyenne', value: '4.2j', target: '5j' },
        { label: 'Qualité', value: '87%', target: '85%' },
        { label: 'Créées aujourd\'hui', value: '23' }
      ],
      actions: [
        { name: 'Créer PAP', path: '/nouveau-pap' },
        { name: 'Voir Liste', path: '/drill/phase1' }
      ]
    },
    {
      id: 2,
      name: 'Évaluation Biens',
      color: 'from-purple-600 to-pink-600',
      icon: CheckCircle,
      stats: { total: 1180, visited: 950, pending: 230 },
      kpis: [
        { label: 'Visites terrain', value: '950', target: '1240' },
        { label: 'Variance', value: '12%', target: '<15%' },
        { label: 'Durée moyenne', value: '6.1j', target: '7j' }
      ],
      actions: [
        { name: 'Planifier visite', path: '/terrain' },
        { name: 'Voir évaluations', path: '/evaluations' }
      ]
    },
    {
      id: 3,
      name: 'Dédommagement',
      color: 'from-amber-600 to-orange-600',
      icon: DollarSign,
      stats: { total: 1050, approved: 920, pending: 130 },
      kpis: [
        { label: 'Approbation', value: '87.6%', target: '>85%' },
        { label: 'Montant moyen', value: '2.4M', currency: 'XOF' },
        { label: 'Durée moyenne', value: '5.9j', target: '7j' }
      ],
      actions: [
        { name: 'Soumettre', path: '/dedommagement' },
        { name: 'Dossiers', path: '/drill/phase3' }
      ]
    },
    {
      id: 4,
      name: 'Paiement',
      color: 'from-green-600 to-emerald-600',
      icon: TrendingUp,
      stats: { total: 920, confirmed: 887, pending: 33 },
      kpis: [
        { label: 'Taux succès', value: '96.4%', target: '≥98%' },
        { label: 'Confirmés', value: '887', target: '920' },
        { label: 'Durée moyenne', value: '2.3j', target: '3j' }
      ],
      actions: [
        { name: 'Initier paiement', path: '/paiements' },
        { name: 'Distribution', path: '/drill/phase4' }
      ]
    },
    {
      id: 5,
      name: 'Réclamations',
      color: 'from-red-600 to-rose-600',
      icon: AlertCircle,
      stats: { total: 127, treated: 89, pending: 38 },
      kpis: [
        { label: 'Non-traitées', value: '38', limit: '>10 ⚠️' },
        { label: 'Taux résolution', value: '70%', target: '>80%' },
        { label: 'Durée moyenne', value: '14.2j', target: '20j' }
      ],
      actions: [
        { name: 'Enregistrer', path: '/reclamations' },
        { name: 'Concilier', path: '/conciliation' }
      ]
    },
    {
      id: 6,
      name: 'Archivage',
      color: 'from-slate-600 to-slate-700',
      icon: CheckCircle,
      stats: { total: 3200, archived: 3145, active: 55 },
      kpis: [
        { label: 'Archivés', value: '3145', percentage: '98.3%' },
        { label: 'Intégrité', value: '✓ 100%', badge: 'Blockchain' },
        { label: 'GDPR', value: '✓ Compliant' }
      ],
      actions: [
        { name: 'Audit Trail', path: '/audit' },
        { name: 'Rapports', path: '/rapports' }
      ]
    }
  ];

  // Synthèse KPIs
  const synthesis = [
    { label: 'Durée Totale', value: '25j', description: 'Moyenne création→archivage' },
    { label: 'Qualité Globale', value: '86%', description: 'Score moyen tous PAPs' },
    { label: 'Satisfaction', value: '4.2/5', description: 'Feedback moyen PAPs' },
    { label: 'Blockchain', value: '100%', description: 'Audit trail vérifiée' },
    { label: 'GDPR', value: '✓ OK', description: 'Conformité data' },
    { label: 'Uptime', value: '99.9%', description: 'Disponibilité systéme' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          📊 Dashboard Métier APIX-PAP
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Vue d'ensemble complète: 6 phases de workflow, KPIs temps réel, actions rapides</p>
      </div>

      {/* Synthèse KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {synthesis.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <p className="text-gray-600 text-xs font-semibold uppercase">{kpi.label}</p>
            <p className="text-2xl font-bold text-blue-600 my-1">{kpi.value}</p>
            <p className="text-gray-500 text-xs">{kpi.description}</p>
          </div>
        ))}
      </div>

      {/* Phases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className={`group bg-gradient-to-br ${phase.color} p-0.5 rounded-2xl hover:shadow-xl transition-all cursor-pointer`}
            onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
          >
            <div className="bg-white rounded-[15px] p-8 h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-gradient-to-br ${phase.color} rounded-lg`}>
                    <phase.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{phase.name}</h3>
                    <p className="text-sm text-gray-600">Phase {phase.id}/6</p>
                  </div>
                </div>
                <ChevronRight className={`w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-all ${expandedPhase === phase.id ? 'rotate-90' : ''}`} />
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {Object.entries(phase.stats).map(([key, value]) => (
                  <div key={key} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3">
                    <p className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              {/* KPIs */}
              <div className="space-y-3 mb-6">
                {phase.kpis.map((kpi, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-700">{kpi.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{kpi.value}</span>
                      {kpi.target && <span className="text-xs text-gray-500">/ {kpi.target}</span>}
                      {kpi.currency && <span className="text-xs text-gray-500">{kpi.currency}</span>}
                      {kpi.badge && <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">{kpi.badge}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                {phase.actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to action path
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold text-white bg-gradient-to-r ${phase.color} hover:shadow-lg transition-all text-sm`}
                  >
                    {action.name}
                  </button>
                ))}
              </div>

              {/* Expanded Details */}
              {expandedPhase === phase.id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-bold text-blue-900 mb-2">Tendance</h4>
                      <p className="text-sm text-blue-700">↑ 5.2% ce mois</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-bold text-green-900 mb-2">SLA Status</h4>
                      <p className="text-sm text-green-700">✓ On track</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-2">📊 Analytics Avancée</h3>
          <p className="text-sm text-blue-100 mb-4">BI avec prédictions ML</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50">
            Voir Analytics →
          </button>
        </div>

        <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-2">📄 Rapports Automatiques</h3>
          <p className="text-sm text-cyan-100 mb-4">Executive, Operational, Compliance</p>
          <button className="bg-white text-cyan-600 px-4 py-2 rounded-lg font-semibold hover:bg-cyan-50">
            Générer Rapports →
          </button>
        </div>

        <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-2">🔮 Prédictions ML</h3>
          <p className="text-sm text-purple-100 mb-4">Bottlenecks 7 jours ahead</p>
          <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50">
            Voir Prédictions →
          </button>
        </div>
      </div>
    </div>
  );
}
