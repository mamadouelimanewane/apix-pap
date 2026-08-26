import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, MapPin } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function CompensationKPI() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [kpiData, setKpiData] = useState({});
  const [distributionData, setDistributionData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/compensation-kpi')
      .then(res => res.json())
      .then(data => {
        setKpiData(data.kpi || {});
        setRegionData(data.distribution || []);
        setTimelineData(data.timeline || []);

        // Construire les données pour les charts
        setDistributionData(
          (data.distribution || []).map(r => ({
            name: r.region,
            value: r.papes,
            pct: Math.round((r.papes / 156) * 100)
          }))
        );

        setComparisonData(
          (data.distribution || []).map(r => ({
            region: r.region,
            cadastre: Math.round(r.cadast / 1000000),
            offre: Math.round(r.montant / 1000000),
            ecart: Math.round(((r.montant - r.cadast) / r.cadast) * 100)
          }))
        );

        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement compensation KPI:', err);
        setLoading(false);
      });
  }, []);

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
