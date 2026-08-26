import React, { useState, useEffect } from 'react';
import { MapPin, Filter, Download, Eye } from 'lucide-react';

export default function Cartographie() {
  const [paps, setPaps] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    const mockPaps = [
      { id: 1, code: 'PAP-2026-001', lat: 14.7125, lng: -17.4676, nom: 'Dia Mamadou', statut: 'Payé', zone: 'Dakar Centre' },
      { id: 2, code: 'PAP-2026-002', lat: 14.7150, lng: -17.4650, nom: 'Ndiaye Assane', statut: 'Évalué', zone: 'Dakar Centre' },
      { id: 3, code: 'PAP-2026-003', lat: 14.7200, lng: -17.4600, nom: 'Sall Aïssatou', statut: 'Nouveau', zone: 'Thiès' },
      { id: 4, code: 'PAP-2026-004', lat: 14.7175, lng: -17.4625, nom: 'Ba Mohamed', statut: 'Payé', zone: 'Dakar Centre' },
    ];
    setPaps(mockPaps);
  }, []);

  const getStatusColor = (statut) => {
    const colors = {
      'Payé': '#4caf50',
      'Évalué': '#2196f3',
      'Nouveau': '#ff9800',
      'Concilié': '#9c27b0',
    };
    return colors[statut] || '#757575';
  };

  const filteredPaps = filter === 'all' ? paps : paps.filter(p => p.statut === filter);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={28} color="#006B3F" />
          Cartographie Interactive
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Carte */}
        <div style={{
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          borderRadius: '12px',
          padding: '2rem',
          minHeight: '600px',
          border: '2px dashed #4caf50',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '3rem' }}>🗺️</div>
          <div style={{ textAlign: 'center', color: '#2e7d32' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '0.5rem' }}>Carte Leaflet Interactive</div>
            <div style={{ fontSize: '14px', marginBottom: '1rem' }}>
              Affichant {filteredPaps.length} PAP • Zones d'impact • Clusters
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              {filteredPaps.map(pap => (
                <div key={pap.id} style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  fontSize: '12px',
                  cursor: 'pointer',
                  border: `2px solid ${selectedZone === pap.id ? '#006B3F' : 'transparent'}`,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={() => setSelectedZone(pap.id)}
                onMouseLeave={() => setSelectedZone(null)}>
                  <div style={{ color: getStatusColor(pap.statut), fontWeight: 'bold', marginBottom: '0.25rem' }}>●</div>
                  <div style={{ fontWeight: '600' }}>{pap.code}</div>
                  <div style={{ color: '#666' }}>{pap.zone}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panneau latéral */}
        <div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '1rem', color: '#006B3F' }}>🔍 Filtres & Contrôles</h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
                Filtrer par statut
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tous ({paps.length})</option>
                <option value="Payé">Payés ({paps.filter(p => p.statut === 'Payé').length})</option>
                <option value="Évalué">Évalués ({paps.filter(p => p.statut === 'Évalué').length})</option>
                <option value="Nouveau">Nouveaux ({paps.filter(p => p.statut === 'Nouveau').length})</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '14px', fontWeight: '600' }}>📊 Statistiques</h4>
              <div style={{
                background: '#f5f5f5',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '13px',
                lineHeight: '1.8'
              }}>
                <div>Total PAP: <strong>{filteredPaps.length}</strong></div>
                <div>Zones: <strong>3</strong></div>
                <div>Clusters: <strong>5</strong></div>
                <div>Densité moyenne: <strong>15 PAP/km²</strong></div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '14px', fontWeight: '600' }}>🎨 Légende</h4>
              <div style={{ fontSize: '13px', lineHeight: '2' }}>
                <div><span style={{ color: '#4caf50', fontSize: '16px' }}>●</span> Payé</div>
                <div><span style={{ color: '#2196f3', fontSize: '16px' }}>●</span> Évalué</div>
                <div><span style={{ color: '#ff9800', fontSize: '16px' }}>●</span> Nouveau</div>
                <div><span style={{ color: '#9c27b0', fontSize: '16px' }}>●</span> Concilié</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button style={{
                flex: 1,
                padding: '0.75rem',
                background: '#006B3F',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <Download size={16} /> PDF
              </button>
              <button style={{
                flex: 1,
                padding: '0.75rem',
                background: '#e0e0e0',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <Eye size={16} /> Plein écran
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
