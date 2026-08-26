// Drill-Down Pages - Détails par phase
// Cliquer box → Page détaillée avec listes, filtres, actions

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, Plus, Filter, Eye, Edit2, CheckCircle,
  AlertCircle, Clock, TrendingUp, BarChart3
} from 'lucide-react';
import { dashboardAPI, papAPI, bienAPI, evaluationAPI, paymentAPI } from '@/services/ApiService';

// ============================================================================
// PHASE 1: DRILL-DOWN PAP
// ============================================================================

export function DrillDownPAP() {
  const navigate = useNavigate();
  const [paps, setPaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'REGISTERED',
    riskLevel: 'ALL',
    zone: 'ALL',
    search: ''
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadPAPData();
  }, [filters]);

  const loadPAPData = async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        papAPI.list(filters),
        dashboardAPI.getPhaseStats('phase1')
      ]);
      setPaps(listRes.paps || []);
      setStats(statsRes);
    } catch (error) {
      console.error('Erreur chargement PAP:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Personnes Affectées (PAP)</h1>
              <p className="text-sm text-gray-600">Phase 1: Création et enregistrement</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Total PAP" value={stats?.total || 0} icon="👥" />
            <StatCard label="Enregistrés" value={stats?.registered || 0} icon="✓" />
            <StatCard label="Qualité moyenne" value={`${stats?.avgQuality || 0}%`} icon="⭐" />
            <StatCard label="Alertes" value={stats?.alerts || 0} icon="⚠️" />
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Rechercher PAP..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="ALL">Tous statuts</option>
              <option value="DRAFT">Brouillon</option>
              <option value="REGISTERED">Enregistré</option>
            </select>

            <select
              value={filters.riskLevel}
              onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="ALL">Tous risques</option>
              <option value="LOW">Bas</option>
              <option value="MEDIUM">Moyen</option>
              <option value="HIGH">Élevé</option>
            </select>

            <select
              value={filters.zone}
              onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="ALL">Toutes zones</option>
              <option value="DK">Dakar</option>
              <option value="KAOLACK">Kaolack</option>
            </select>

            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau PAP
            </button>
          </div>
        </div>

        {/* Liste PAP */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code PAP</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nom & Prénom</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Zone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Risque</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Qualité</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paps.map((pap) => (
                  <tr key={pap.code_pap} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-blue-600">{pap.code_pap}</span>
                    </td>
                    <td className="px-6 py-4">{pap.nom} {pap.prenom}</td>
                    <td className="px-6 py-4">{pap.zone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pap.status === 'REGISTERED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pap.status === 'REGISTERED' ? '✓ Enregistré' : '⏳ Brouillon'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pap.risk_level === 'LOW' ? 'bg-green-100 text-green-800' :
                        pap.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {pap.risk_score}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-gray-200 rounded">
                          <div
                            className="h-full bg-blue-600 rounded"
                            style={{ width: `${pap.quality_score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">{pap.quality_score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export */}
        <div className="mt-6 flex gap-3">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PHASE 3: DRILL-DOWN DÉDOMMAGEMENT
// ============================================================================

export function DrillDownCompensation() {
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'ALL',
    risk: 'ALL'
  });

  useEffect(() => {
    loadDossiers();
  }, [filters]);

  const loadDossiers = async () => {
    try {
      const response = await dashboardAPI.getPhaseStats('phase3');
      setDossiers(response.dossiers || []);
    } catch (error) {
      console.error('Erreur chargement dossiers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dédommagement</h1>
              <p className="text-sm text-gray-600">Phase 3: Calcul, validations, certificats</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Dossiers total" value="347" icon="📋" />
            <StatCard label="Approuvés" value="289" icon="✓" />
            <StatCard label="Montant total" value="45.2B" icon="💰" />
            <StatCard label="Temp moy validations" value="4.2j" icon="⏱️" />
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filtres */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="ALL">Tous statuts</option>
              <option value="DRAFT">Brouillon</option>
              <option value="SUPERVISEUR">En revue superviseur</option>
              <option value="DIRECTEUR">En revue directeur</option>
              <option value="APPROVED">Approuvé</option>
            </select>

            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau dossier
            </button>
          </div>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Dossier</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">PAP</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Montant</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Statut</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dossiers.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-blue-600">{d.dossierId}</td>
                    <td className="px-6 py-4">{d.papCode}</td>
                    <td className="px-6 py-4 font-semibold">{(d.montantFinal / 1000000).toFixed(1)}M CFA</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        d.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        d.status === 'SUPERVISEUR' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {d.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PHASE 4: DRILL-DOWN PAIEMENT
// ============================================================================

export function DrillDownPayment() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const [statsRes] = await Promise.all([
        dashboardAPI.getPhaseStats('phase4')
      ]);
      setStats(statsRes);
      setPayments(statsRes.payments || []);
    } catch (error) {
      console.error('Erreur paiements:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paiements</h1>
              <p className="text-sm text-gray-600">Phase 4: 5 modes, vérifications, confirmations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Total versé" value={`${(stats?.totalPaid / 1000000).toFixed(1)}M`} icon="💵" />
            <StatCard label="Confirmé" value={`${stats?.confirmationRate || 0}%`} icon="✓" />
            <StatCard label="Temps moy" value={`${stats?.avgTime || 0}j`} icon="⏱️" />
            <StatCard label="Taux succès" value={`${stats?.successRate || 0}%`} icon="📈" />
          </div>
        </div>
      </div>

      {/* Distribution Modes */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[
            { mode: 'Wave', count: 156, percent: 45 },
            { mode: 'Orange Money', count: 89, percent: 26 },
            { mode: 'Virement', count: 67, percent: 19 },
            { mode: 'Chèque', count: 23, percent: 7 },
            { mode: 'Intouch', count: 12, percent: 3 }
          ].map((m) => (
            <div key={m.mode} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-gray-600 mb-2">{m.mode}</p>
              <p className="text-2xl font-bold text-gray-900">{m.count}</p>
              <p className="text-xs text-gray-500 mt-2">{m.percent}% du total</p>
            </div>
          ))}
        </div>

        {/* Liste paiements */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Paiement ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Mode</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Montant</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Statut</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-blue-600">{p.paymentId}</td>
                    <td className="px-6 py-4">{p.mode}</td>
                    <td className="px-6 py-4 font-semibold">{(p.amount / 1000000).toFixed(1)}M CFA</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {p.status === 'CONFIRMED' ? '✓ Confirmé' : '⏳ En cours'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(p.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 font-semibold uppercase mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT PAGES
// ============================================================================

export default {
  DrillDownPAP,
  DrillDownCompensation,
  DrillDownPayment
};
