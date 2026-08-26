// Advanced Analytics Dashboard - BI avancée avec ML insights
import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Zap, Eye } from 'lucide-react';
import { analyticsAPI } from '../services/ApiService';

export default function AdvancedAnalyticsDashboard() {
  const [phaseAnalytics, setPhaseAnalytics] = useState([]);
  const [trends, setTrends] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const analytics = await analyticsAPI.getPhaseAnalytics('all', '90d');
        setPhaseAnalytics(analytics.phases || []);

        const trendData = await analyticsAPI.getTrendingData('90d');
        setTrends(trendData.trends || []);

        // Prédictions ML simulées
        setPredictions({
          phase1_bottleneck_risk: 'MEDIUM (72%)',
          phase4_payment_delay_risk: 'LOW (18%)',
          recommended_action: 'Augmenter superviseurs phase 1'
        });

        setLoading(false);
      } catch (error) {
        console.error('Analytics error:', error);
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) return <div className="text-center py-8">Chargement analytics...</div>;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          📊 Analytics Avancée
        </h1>
        <p className="text-gray-600 mt-2">BI avec prédictions ML et insights temps réel</p>
      </div>

      {/* Prédictions ML */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Risque Goulot Phase 1</p>
              <p className="text-2xl font-bold text-orange-600">{predictions.phase1_bottleneck_risk}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Risque Délai Paiement</p>
              <p className="text-2xl font-bold text-green-600">{predictions.phase4_payment_delay_risk}</p>
            </div>
            <Zap className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Recommandation</p>
              <p className="text-sm font-semibold text-blue-600 mt-2">{predictions.recommended_action}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Graphiques Analytiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Performance par Phase */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Performance par Phase
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={phaseAnalytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="phase" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgDuration" fill="#3B82F6" name="Durée (jours)" />
              <Bar dataKey="successRate" fill="#10B981" name="Taux succès (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution par Phase */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Distribution PAPs</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={phaseAnalytics}
                dataKey="count"
                nameKey="phase"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {phaseAnalytics.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tendances 90j */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Tendances 90 derniers jours</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="papsCreated" stroke="#3B82F6" name="PAPs créés" />
            <Line type="monotone" dataKey="compensationApproved" stroke="#10B981" name="Compensation approuvée" />
            <Line type="monotone" dataKey="paymentsConfirmed" stroke="#F59E0B" name="Paiements confirmés" />
            <Line type="monotone" dataKey="reclamationsResolved" stroke="#EF4444" name="Réclamations résolues" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendations */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
        <h3 className="font-bold text-blue-900 mb-3">💡 Insights ML Recommandés</h3>
        <ul className="space-y-2 text-blue-800">
          <li>✓ Augmenter team phase 1: bottleneck détecté</li>
          <li>✓ Vérifier mode paiement Orange Money: taux d'échec élevé</li>
          <li>✓ Formation: variance évaluation au-dessus du seuil</li>
          <li>✓ Escalader: 3 PAPs dépassent SLA création</li>
        </ul>
      </div>
    </div>
  );
}
