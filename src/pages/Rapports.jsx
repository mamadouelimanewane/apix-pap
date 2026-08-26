import { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Download } from 'lucide-react';

export default function Rapports() {
  const [dateRange, setDateRange] = useState('month');

  const stats = {
    totalPap: 156,
    paye: 125,
    enCours: 20,
    suspendu: 11,
    montantTotal: 625000000,
    montantPaye: 580000000,
    tauxCompletion: 82,
    delaiMoyen: '18 jours'
  };

  const parCommune = [
    { commune: 'Dakar', count: 52, paye: 48 },
    { commune: 'Thiès', count: 28, paye: 24 },
    { commune: 'Kaolack', count: 25, paye: 20 },
    { commune: 'Saint-Louis', count: 18, paye: 15 },
    { commune: 'Tambacounda', count: 33, paye: 28 }
  ];

  const parStatut = [
    { statut: 'Payé', count: 125, color: '#006B3F' },
    { statut: 'En cours', count: 20, color: '#F29400' },
    { statut: 'Suspendu', count: 11, color: '#E31B23' }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>📊 Rapports & Analytics</h1>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '20px', marginBottom: '30px' }}>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette année</option>
        </select>
        <button style={{
          padding: '10px 20px',
          background: '#006B3F',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Download size={16} /> Télécharger Rapport
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: '#f0f8f5', borderRadius: '8px', borderLeft: '4px solid #006B3F' }}>
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Taux de Complétion</p>
          <h2 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#006B3F' }}>{stats.tauxCompletion}%</h2>
        </div>
        <div style={{ padding: '20px', background: '#fff0f5', borderRadius: '8px', borderLeft: '4px solid #E31B23' }}>
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>PAP Payés</p>
          <h2 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#006B3F' }}>{stats.paye}/{stats.totalPap}</h2>
        </div>
        <div style={{ padding: '20px', background: '#fef5f0', borderRadius: '8px', borderLeft: '4px solid #F29400' }}>
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Montant Payé</p>
          <h2 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#006B3F' }}>580M</h2>
        </div>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', borderLeft: '4px solid #666' }}>
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Délai Moyen</p>
          <h2 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#006B3F' }}>{stats.delaiMoyen}</h2>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Par Commune */}
        <div style={{ padding: '20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} /> PAP par Commune
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            {parCommune.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
                  <span>{item.commune}</span>
                  <span>{item.paye}/{item.count}</span>
                </div>
                <div style={{ width: '100%', height: '20px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(item.paye / item.count) * 100}%`,
                    height: '100%',
                    background: '#006B3F',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Par Statut */}
        <div style={{ padding: '20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={20} /> Distribution Statuts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            {parStatut.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: item.color,
                  borderRadius: '4px'
                }} />
                <span style={{ flex: 1 }}>{item.statut}</span>
                <strong style={{ color: item.color }}>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tendances */}
      <div style={{ padding: '20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} /> Tendances (Derniers 30 jours)
        </h3>
        <div style={{ marginTop: '20px', height: '200px', background: '#f5f5f5', borderRadius: '6px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px' }}>
          {[65, 78, 82, 88, 90, 92, 95].map((val, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '30px',
                height: `${val * 1.5}px`,
                background: '#006B3F',
                borderRadius: '4px 4px 0 0'
              }} />
              <span style={{ fontSize: '12px', color: '#666' }}>J{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
