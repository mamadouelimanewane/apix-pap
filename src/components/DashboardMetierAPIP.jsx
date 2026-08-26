// Dashboard Métier APIX-PAP - Regroupé par flux de valeur
// Organisation: PAP → Biens → Évaluation → Dédommagement → Paiement → Réclamations → Archive
import React, { useEffect, useState } from 'react';
import {
  Users, Home, BarChart3, DollarSign, MessageSquare, Archive,
  TrendingUp, Clock, AlertCircle, CheckCircle, FileText,
  Calendar, Send, Shield, Zap, Eye, Download, RefreshCw
} from 'lucide-react';

export default function DashboardMetierAPIP() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/dashboard/metier-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Premium */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Gestion PAP - Flux Métier Complet
              </h1>
              <p className="text-gray-600">Suivi intégral: Création → Archivage</p>
            </div>
            <button
              onClick={loadMetrics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* PHASE 1: CRÉATION & ACQUISITION PAP */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Phase 1: Personnes Affectées</h2>
              <p className="text-sm text-gray-600">Création, acquisition documents, validation identité</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Box 1: Création PAP */}
            <MetierBox
              icon={<Users className="w-6 h-6" />}
              title="Créer PAP"
              metric={stats?.pap?.total || 0}
              subMetric="Dossiers actifs"
              color="from-blue-500 to-cyan-600"
              actions={[
                { label: 'Nouveau PAP', icon: '➕' },
                { label: 'Import', icon: '📥' }
              ]}
            />

            {/* Box 2: Acquisition Documents */}
            <MetierBox
              icon={<FileText className="w-6 h-6" />}
              title="Documents"
              metric={stats?.documents?.total || 0}
              subMetric="Fichiers stockés"
              color="from-indigo-500 to-blue-600"
              stat={stats?.documents?.uploadQuality}
              statLabel="Qualité moyenne"
              actions={[
                { label: 'Capturer', icon: '📸' },
                { label: 'Uploader', icon: '☁️' }
              ]}
            />

            {/* Box 3: Fraude Detection */}
            <MetierBox
              icon={<AlertCircle className="w-6 h-6" />}
              title="Validation"
              metric={`${stats?.validation?.fraudDetectionRate || 0}%`}
              subMetric="Fraude détectée"
              color="from-orange-500 to-red-600"
              alert={stats?.validation?.flaggedCount}
              alertLabel="Signalés"
              actions={[
                { label: 'Revoir', icon: '👁️' },
                { label: 'Approuver', icon: '✅' }
              ]}
            />

            {/* Box 4: Enregistrement */}
            <MetierBox
              icon={<CheckCircle className="w-6 h-6" />}
              title="Enregistrement"
              metric={stats?.pap?.registered || 0}
              subMetric="Codes PAP émis"
              color="from-green-500 to-teal-600"
              stat={Math.round((stats?.pap?.registered / stats?.pap?.total * 100) || 0)}
              statLabel="Taux complétion"
              actions={[
                { label: 'Registre', icon: '📋' },
                { label: 'Export', icon: '📊' }
              ]}
            />
          </div>
        </section>

        {/* PHASE 2: BIENS & ÉVALUATION */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Phase 2: Biens & Évaluation</h2>
              <p className="text-sm text-gray-600">Enregistrement propriétés, visite terrain, classification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Box 1: Cadastre */}
            <MetierBox
              icon={<Home className="w-6 h-6" />}
              title="Cadastre"
              metric={stats?.bien?.total || 0}
              subMetric="Propriétés"
              color="from-purple-500 to-pink-600"
              stat={Math.round((stats?.bien?.cadastreValidated / stats?.bien?.total * 100) || 0)}
              statLabel="Validées"
              actions={[
                { label: 'Ajouter', icon: '🏠' },
                { label: 'Valider', icon: '✓' }
              ]}
            />

            {/* Box 2: Visite Terrain */}
            <MetierBox
              icon={<Calendar className="w-6 h-6" />}
              title="Visites Terrain"
              metric={stats?.fieldVisits?.completed || 0}
              subMetric="Complétées"
              color="from-green-500 to-emerald-600"
              stat={stats?.fieldVisits?.inProgress}
              statLabel="En cours"
              actions={[
                { label: 'Planifier', icon: '📅' },
                { label: 'En cours', icon: '🚀' }
              ]}
            />

            {/* Box 3: Classification */}
            <MetierBox
              icon={<BarChart3 className="w-6 h-6" />}
              title="Classification"
              metric={stats?.classification?.total || 0}
              subMetric="Biens classés"
              color="from-yellow-500 to-orange-600"
              stat={`${stats?.classification?.avgQualityScore || 0}%`}
              statLabel="Qualité"
              actions={[
                { label: 'Mesurer', icon: '📏' },
                { label: 'Classer', icon: '📂' }
              ]}
            />

            {/* Box 4: Évaluations */}
            <MetierBox
              icon={<TrendingUp className="w-6 h-6" />}
              title="Évaluations"
              metric={`${(stats?.evaluation?.totalAmount / 1000000).toFixed(1)}M`}
              subMetric="CFA évalués"
              color="from-blue-500 to-indigo-600"
              stat={stats?.evaluation?.avgScore}
              statLabel="Confiance"
              actions={[
                { label: 'Évaluer', icon: '💰' },
                { label: 'Rapport', icon: '📑' }
              ]}
            />
          </div>
        </section>

        {/* PHASE 3: DÉDOMMAGEMENT */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Phase 3: Dédommagement</h2>
              <p className="text-sm text-gray-600">Calcul, validations multi-niveaux, certificats blockchain</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Box 1: Calcul */}
            <MetierBox
              icon={<BarChart3 className="w-6 h-6" />}
              title="Calcul Barème"
              metric={stats?.compensation?.submitted || 0}
              subMetric="Dossiers soumis"
              color="from-amber-500 to-yellow-600"
              stat={`${(stats?.compensation?.totalAmount / 1000000).toFixed(1)}M`}
              statLabel="Montant total"
              actions={[
                { label: 'Calculer', icon: '🧮' },
                { label: 'Soumettre', icon: '📤' }
              ]}
            />

            {/* Box 2: Superviseur */}
            <MetierBox
              icon={<Eye className="w-6 h-6" />}
              title="Validation Superviseur"
              metric={stats?.compensation?.supervisorReviewed || 0}
              subMetric="Approuvés"
              color="from-purple-500 to-indigo-600"
              stat={`±${stats?.compensation?.supervisorAdjustmentAvg || 0}%`}
              statLabel="Ajustement moyen"
              actions={[
                { label: 'Revoir', icon: '👁️' },
                { label: 'Ajuster', icon: '↔️' }
              ]}
            />

            {/* Box 3: Directeur */}
            <MetierBox
              icon={<Shield className="w-6 h-6" />}
              title="Approbation Directeur"
              metric={stats?.compensation?.directorApproved || 0}
              subMetric="Finalisés"
              color="from-red-500 to-rose-600"
              stat={`±${stats?.compensation?.directorAdjustmentAvg || 0}%`}
              statLabel="Ajustement final"
              actions={[
                { label: 'Approuver', icon: '✅' },
                { label: 'Certificat', icon: '📜' }
              ]}
            />

            {/* Box 4: Blockchain */}
            <MetierBox
              icon={<Zap className="w-6 h-6" />}
              title="Certificats"
              metric={stats?.blockchain?.certificateGenerated || 0}
              subMetric="Générés"
              color="from-cyan-500 to-blue-600"
              stat="100%"
              statLabel="Vérifiés blockchain"
              actions={[
                { label: 'Générer', icon: '🔗' },
                { label: 'QR Code', icon: '📱' }
              ]}
            />
          </div>
        </section>

        {/* PHASE 4: PAIEMENT */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Phase 4: Paiement</h2>
              <p className="text-sm text-gray-600">5 modes de paiement, vérifications, notifications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Payment Modes */}
            <MetierBox
              icon={<DollarSign className="w-6 h-6" />}
              title="Wave"
              metric={stats?.payment?.waveCount || 0}
              subMetric="Transactions"
              color="from-emerald-500 to-green-600"
              stat={Math.round((stats?.payment?.waveCount / stats?.payment?.total * 100) || 0)}
              statLabel="Distribution"
              actions={[
                { label: 'Initier', icon: '→' }
              ]}
            />

            <MetierBox
              icon={<DollarSign className="w-6 h-6" />}
              title="Orange Money"
              metric={stats?.payment?.orangeCount || 0}
              subMetric="Transactions"
              color="from-orange-500 to-yellow-600"
              stat={Math.round((stats?.payment?.orangeCount / stats?.payment?.total * 100) || 0)}
              statLabel="Distribution"
              actions={[
                { label: 'Initier', icon: '→' }
              ]}
            />

            <MetierBox
              icon={<DollarSign className="w-6 h-6" />}
              title="Virement"
              metric={stats?.payment?.transferCount || 0}
              subMetric="Virements"
              color="from-blue-500 to-indigo-600"
              stat={Math.round((stats?.payment?.transferCount / stats?.payment?.total * 100) || 0)}
              statLabel="Distribution"
              actions={[
                { label: 'Initier', icon: '→' }
              ]}
            />

            <MetierBox
              icon={<CheckCircle className="w-6 h-6" />}
              title="Confirmations"
              metric={stats?.payment?.confirmed || 0}
              subMetric="Paiements reçus"
              color="from-green-500 to-teal-600"
              stat={Math.round((stats?.payment?.confirmed / stats?.payment?.total * 100) || 0)}
              statLabel="Taux succès"
              actions={[
                { label: 'Vérifier', icon: '✓' }
              ]}
            />
          </div>
        </section>

        {/* PHASE 5: RÉCLAMATIONS */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Phase 5: Réclamations & MGP</h2>
              <p className="text-sm text-gray-600">Période 30j, conciliation, résolution litiges</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Box 1: Enregistrement */}
            <MetierBox
              icon={<MessageSquare className="w-6 h-6" />}
              title="Enregistrées"
              metric={stats?.reclamation?.total || 0}
              subMetric="Réclamations"
              color="from-orange-500 to-red-600"
              stat={Math.round((stats?.reclamation?.total / stats?.pap?.total * 100) || 0)}
              statLabel="Taux réclamation"
              actions={[
                { label: 'Enregistrer', icon: '📝' },
                { label: 'Historique', icon: '📜' }
              ]}
            />

            {/* Box 2: Traitement */}
            <MetierBox
              icon={<Clock className="w-6 h-6" />}
              title="En Traitement"
              metric={stats?.reclamation?.inProgress || 0}
              subMetric="En cours"
              color="from-yellow-500 to-orange-600"
              stat={`${stats?.reclamation?.avgResolutionDays || 0}j`}
              statLabel="Durée moyenne"
              actions={[
                { label: 'Traiter', icon: '⚙️' }
              ]}
            />

            {/* Box 3: Conciliation */}
            <MetierBox
              icon={<Users className="w-6 h-6" />}
              title="Conciliation"
              metric={stats?.reclamation?.conciliated || 0}
              subMetric="Résolues"
              color="from-purple-500 to-pink-600"
              stat={Math.round((stats?.reclamation?.conciliated / stats?.reclamation?.total * 100) || 0)}
              statLabel="Taux succès"
              actions={[
                { label: 'Planifier', icon: '📅' }
              ]}
            />

            {/* Box 4: Résolues */}
            <MetierBox
              icon={<CheckCircle className="w-6 h-6" />}
              title="Résolues"
              metric={stats?.reclamation?.resolved || 0}
              subMetric="Fermées"
              color="from-green-500 to-emerald-600"
              stat={Math.round((stats?.reclamation?.resolved / stats?.reclamation?.total * 100) || 0)}
              statLabel="Taux fermeture"
              actions={[
                { label: 'Archiver', icon: '📦' }
              ]}
            />
          </div>
        </section>

        {/* PHASE 6: ARCHIVAGE */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl">
              <Archive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Phase 6: Archivage & Clôture</h2>
              <p className="text-sm text-gray-600">Finalisation, archivage 10 ans, anonymisation données</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Box 1: Fermeture */}
            <MetierBox
              icon={<CheckCircle className="w-6 h-6" />}
              title="Dossiers Fermés"
              metric={stats?.archive?.closed || 0}
              subMetric="Prêts archivage"
              color="from-slate-500 to-gray-600"
              stat={Math.round((stats?.archive?.closed / stats?.pap?.total * 100) || 0)}
              statLabel="Taux fermeture"
              actions={[
                { label: 'Fermer', icon: '🔒' }
              ]}
            />

            {/* Box 2: Archive */}
            <MetierBox
              icon={<Archive className="w-6 h-6" />}
              title="Archivés"
              metric={stats?.archive?.archived || 0}
              subMetric="Dossiers"
              color="from-indigo-500 to-blue-600"
              stat="10 ans"
              statLabel="Rétention"
              actions={[
                { label: 'Archiver', icon: '💾' }
              ]}
            />

            {/* Box 3: Intégrité */}
            <MetierBox
              icon={<Shield className="w-6 h-6" />}
              title="Intégrité"
              metric={`${stats?.archive?.integrityScore || 100}%`}
              subMetric="Vérifiée"
              color="from-green-500 to-teal-600"
              stat={stats?.archive?.blockchainVerified}
              statLabel="Transactions"
              actions={[
                { label: 'Vérifier', icon: '✓' }
              ]}
            />

            {/* Box 4: Anonymisation */}
            <MetierBox
              icon={<Eye className="w-6 h-6" />}
              title="Anonymisation"
              metric={stats?.archive?.anonymized || 0}
              subMetric="Dossiers"
              color="from-purple-500 to-pink-600"
              stat={Math.round((stats?.archive?.anonymized / stats?.archive?.archived * 100) || 0)}
              statLabel="Taux"
              actions={[
                { label: 'Anonymiser', icon: '🔐' }
              ]}
            />
          </div>
        </section>

        {/* SYNTHÈSE GLOBALE */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Synthèse Métier</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* KPI: Durée moyenne */}
            <SynthesisBox
              title="Durée Moyenne Dossier"
              value={`${stats?.global?.avgDuration || 0} jours`}
              target="≤ 35 jours"
              icon="⏱️"
              status={stats?.global?.avgDuration <= 35 ? 'success' : 'warning'}
            />

            {/* KPI: Qualité */}
            <SynthesisBox
              title="Qualité Globale"
              value={`${stats?.global?.overallQuality || 0}%`}
              target="≥ 85%"
              icon="✨"
              status={stats?.global?.overallQuality >= 85 ? 'success' : 'warning'}
            />

            {/* KPI: Satisfaction */}
            <SynthesisBox
              title="Satisfaction PAP"
              value={`${stats?.global?.satisfaction || 0}/5`}
              target="≥ 4/5"
              icon="😊"
              status={stats?.global?.satisfaction >= 4 ? 'success' : 'warning'}
            />

            {/* KPI: Blockchain */}
            <SynthesisBox
              title="Vérification Blockchain"
              value={`${stats?.global?.blockchainVerified || 100}%`}
              target="100%"
              icon="🔗"
              status={stats?.global?.blockchainVerified === 100 ? 'success' : 'warning'}
            />

            {/* KPI: GDPR */}
            <SynthesisBox
              title="Conformité GDPR"
              value="✅ Complète"
              target="100%"
              icon="🔒"
              status="success"
            />

            {/* KPI: Uptime */}
            <SynthesisBox
              title="Disponibilité"
              value={`${stats?.global?.uptime || 99.95}%`}
              target="≥ 99.9%"
              icon="⚡"
              status={stats?.global?.uptime >= 99.9 ? 'success' : 'warning'}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================================================
// METIER BOX COMPONENT
// ============================================================================

function MetierBox({ icon, title, metric, subMetric, color, stat, statLabel, alert, alertLabel, actions }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all p-6 group cursor-pointer`}>
      {/* Header avec icône */}
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>

      {/* Titre */}
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>

      {/* Métrique principale */}
      <div className="mb-4">
        <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          {metric}
        </p>
        <p className="text-sm text-gray-600 mt-1">{subMetric}</p>
      </div>

      {/* Stat secondaire */}
      {stat && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{stat}</p>
          <p className="text-xs text-gray-600 mt-1">{statLabel}</p>
        </div>
      )}

      {/* Alert */}
      {alert && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-lg font-bold text-red-600">{alert}</p>
          <p className="text-xs text-red-600 mt-1">{alertLabel}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        {actions.map((action, i) => (
          <button
            key={i}
            className="flex-1 py-2 px-3 text-xs font-semibold bg-gray-50 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            {action.icon} {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SYNTHESIS BOX COMPONENT
// ============================================================================

function SynthesisBox({ title, value, target, icon, status }) {
  const statusColor = status === 'success' ? 'from-green-50 to-emerald-50 border-green-200' : 'from-yellow-50 to-amber-50 border-yellow-200';
  const badgeColor = status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';

  return (
    <div className={`bg-gradient-to-br ${statusColor} rounded-xl border-2 p-6`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-3xl">{icon}</span>
        <span className={`text-xs font-bold px-2 py-1 rounded ${badgeColor}`}>
          {status === 'success' ? '✅' : '⚠️'}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-3">{value}</p>

      <div className="p-2 bg-white rounded border border-gray-200">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Cible:</span> {target}
        </p>
      </div>
    </div>
  );
}
