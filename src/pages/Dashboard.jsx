import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPAP: 1250,
    papConcilies: 1100,
    papIndemnises: 980,
    papEnCours: 170,
    montantValide: 625000000,
    montantPaye: 490000000,
    reclamationsOuvertes: 25,
    dossiersClotures: 850,
  });

  const [statusData] = useState([
    { name: 'Nouveau', value: 45 },
    { name: 'Recensé', value: 120 },
    { name: 'À vérifier', value: 85 },
    { name: 'Fiabilisé', value: 200 },
    { name: 'Évalué', value: 180 },
    { name: 'En conciliation', value: 120 },
    { name: 'Concilié', value: 300 },
    { name: 'Payé', value: 980 },
    { name: 'Clôturé', value: 850 },
  ]);

  const [paymentData] = useState([
    { month: 'Janvier', montant: 45000000 },
    { month: 'Février', montant: 62000000 },
    { month: 'Mars', montant: 78000000 },
    { month: 'Avril', montant: 95000000 },
    { month: 'Mai', montant: 110000000 },
    { month: 'Juin', montant: 100000000 },
  ]);

  const [paymentModeData] = useState([
    { name: 'Chèque', value: 200000000 },
    { name: 'Virement', value: 180000000 },
    { name: 'Wave', value: 70000000 },
    { name: 'Orange Money', value: 40000000 },
  ]);

  const COLORS = ['#006B3F', '#009639', '#F29400', '#E31B23', '#FCD116', '#1e40af', '#7c3aed', '#db2777', '#059669'];

  const StatCard = ({ icon: Icon, label, value, subtext, color = '#006B3F' }) => (
    <div className="card" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      border: `2px solid ${color}20`,
    }}>
      <div style={{
        background: `${color}10`,
        padding: '1rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={28} style={{ color }} />
      </div>
      <div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{label}</p>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </h3>
        {subtext && <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Tableau de Bord</h1>
        <p className="page-subtitle">Vue d'ensemble de la gestion des PAP</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <StatCard
          icon={Users}
          label="Total PAP"
          value={stats.totalPAP}
          subtext="Personnes affectées"
          color="#006B3F"
        />
        <StatCard
          icon={CheckCircle}
          label="Indemnisés"
          value={stats.papIndemnises}
          subtext={`${Math.round(stats.papIndemnises / stats.totalPAP * 100)}% traités`}
          color="#10b981"
        />
        <StatCard
          icon={Clock}
          label="En cours"
          value={stats.papEnCours}
          subtext="Dossiers en traitement"
          color="#f59e0b"
        />
        <StatCard
          icon={DollarSign}
          label="Montant Validé"
          value={`${(stats.montantValide / 1000000).toFixed(0)}M FCFA`}
          subtext="Total validé"
          color="#F29400"
        />
        <StatCard
          icon={TrendingUp}
          label="Montant Payé"
          value={`${(stats.montantPaye / 1000000).toFixed(0)}M FCFA`}
          subtext={`${Math.round(stats.montantPaye / stats.montantValide * 100)}% payé`}
          color="#006B3F"
        />
        <StatCard
          icon={AlertCircle}
          label="Réclamations"
          value={stats.reclamationsOuvertes}
          subtext="Ouvertes"
          color="#E31B23"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
        {/* Status Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
            Distribution des Statuts
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#006B3F" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Modes */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
            Modes de Paiement
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentModeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentModeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Trend */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
            Évolution des Paiements (6 derniers mois)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paymentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${(value / 1000000).toFixed(0)}M FCFA`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="montant"
                stroke="#006B3F"
                strokeWidth={2}
                dot={{ fill: '#F29400', r: 5 }}
                activeDot={{ r: 7 }}
                name="Montant payé"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Statistiques Rapides</h3>
        <div className="grid grid-3">
          <div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Solde à payer</p>
            <p style={{ fontSize: '1.3rem', fontWeight: '700', color: '#E31B23' }}>
              {((stats.montantValide - stats.montantPaye) / 1000000).toFixed(0)}M FCFA
            </p>
          </div>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Dossiers clôturés</p>
            <p style={{ fontSize: '1.3rem', fontWeight: '700', color: '#10b981' }}>
              {stats.dossiersClotures} ({Math.round(stats.dossiersClotures / stats.totalPAP * 100)}%)
            </p>
          </div>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Taux de traitement</p>
            <p style={{ fontSize: '1.3rem', fontWeight: '700', color: '#006B3F' }}>
              {Math.round((stats.papIndemnises + stats.dossiersClotures) / stats.totalPAP * 100)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
