import React, { useState } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, MapPin } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function CompensationKPI() {
  const [selectedRegion, setSelectedRegion] = useState('all');

  const kpiData = {
    paps_total: 156,
    paps_payes: 125,
    paps_paye_pct: 80,
    montant_total: 580000000,
    montant_moyen: 4600000,
    montant_paye: 580000000,
    delai_moyen: 18,
  };

  const distributionData = [
    { name: 'Dakar', value: 65, pct: 42 },
    { name: 'Thiès', value: 45, pct: 29 },
    { name: 'Kaolack', value: 46, pct: 29 },
  ];

  const comparisonData = [
    { region: 'Dakar', cadastre: 12500, offre: 3100, ecart: -75 },
    { region: 'Thiès', cadastre: 9200, offre: 5050, ecart: -45 },
    { region: 'Kaolack', cadastre: 8800, offre: 5280, ecart: -40 },
  ];

  const timelineData = [
    { jour: 'Sem 1', papes: 15, montant: 45000000 },
    { jour: 'Sem 2', papes: 22, montant: 88000000 },
    { jour: 'Sem 3', papes: 31, montant: 142000000 },
    { jour: 'Sem 4', papes: 28, montant: 138000000 },
    { jour: 'Sem 5', papes: 29, montant: 167000000 },
  ];

  const regionData = [
    { nom: 'Dakar', papes: 65, payes: 52, pct: 80, montant: 240000000, cadast: 812000000, risque: '🔴 Critique' },
    { nom: 'Thiès', papes: 45, payes: 40, pct: 89, montant: 200000000, cadast: 414000000, risque: '🟡 Modéré' },
    { nom: 'Kaolack', papes: 46, payes: 33, pct: 72, montant: 140000000, cadast: 404000000, risque: '🟢 Faible' },
  ];

  const COLORS = ['#006B3F', '#2196f3', '#ff9800'];

  const filtered = selectedRegion === 'all' ? regionData : regionData.filter(r => r.nom === selectedRegion);

  return (
    <div className="page-container">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <BarChart3 size={28} color="#006B3F" />
        Compensation & KPI
      </h1>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>PAP Payés</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#006B3F', marginBottom: '0.5rem' }}>
            {kpiData.paps_payes}/{kpiData.paps_total}
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#4caf50' }}>
            {kpiData.paps_paye_pct}% Complété
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>Montant Payé</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196f3', marginBottom: '0.5rem' }}>
            {(kpiData.montant_total / 1000000000).toFixed(1)}G
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            Moy: {(kpiData.montant_moyen / 1000000).toFixed(1)}M/PAP
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>Délai Moyen</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f44336', marginBottom: '0.5rem' }}>
            {kpiData.delai_moyen}j
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            SLA: 30 jours ✓
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>Risque Social</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800', marginBottom: '0.5rem' }}>
            Élevé
          </div>
          <div style={{ fontSize: '13px', color: '#ff9800', fontWeight: '600' }}>
            -63% moyenne écart
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Distribution PAP */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#006B3F', fontSize: '14px', fontWeight: '600' }}>
            📍 Distribution PAP par Région
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, pct }) => `${name} (${pct}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline Paiements */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#006B3F', fontSize: '14px', fontWeight: '600' }}>
            📈 Timeline Paiements (5 semaines)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="jour" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => (value / 1000000).toFixed(0) + 'M'} />
              <Legend />
              <Line
                type="monotone"
                dataKey="montant"
                stroke="#006B3F"
                name="Montant (FCFA)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparaison Cadastre vs Offre */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#006B3F', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} /> Comparaison Cadastre vs Offre
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" fontSize={12} />
            <YAxis fontSize={12} label={{ value: 'Milliers FCFA', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => (value / 1000).toFixed(0) + 'K'} />
            <Legend />
            <Bar dataKey="cadastre" fill="#2196f3" name="Cadastre" />
            <Bar dataKey="offre" fill="#f44336" name="Offre" />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px', fontSize: '12px', color: '#856404' }}>
          ⚠️ Écart moyen: -53% | Dakar -75% (majorité conflits) | Kaolack -40% (moins de tensions)
        </div>
      </div>

      {/* Détails par Région */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#006B3F', fontSize: '14px', fontWeight: '600' }}>
            🗺️ Analyse par Région
          </h3>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <option value="all">Toutes les régions</option>
            {regionData.map(r => (
              <option key={r.nom} value={r.nom}>{r.nom}</option>
            ))}
          </select>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Région</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>PAP</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Payés</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>%</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Montant</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Cadastre</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Risque</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '0.75rem', fontWeight: '600' }}>{r.nom}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{r.papes}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{r.payes}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center', color: '#006B3F', fontWeight: '600' }}>
                  {r.pct}%
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#006B3F' }}>
                  {(r.montant / 1000000).toFixed(0)}M
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#2196f3', fontWeight: '600' }}>
                  {(r.cadast / 1000000).toFixed(0)}M
                </td>
                <td style={{ padding: '0.75rem', fontSize: '12px' }}>
                  {r.risque}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
