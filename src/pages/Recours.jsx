import React, { useState, useEffect } from 'react';
import { Scale, AlertCircle, Calendar, FileText } from 'lucide-react';

export default function Recours() {
  const [recours, setRecours] = useState([]);
  const [selectedRecours, setSelectedRecours] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/recours')
      .then(res => res.json())
      .then(data => {
        setRecours(data.recours || []);
        setSelectedRecours(data.recours?.[0] || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement recours:', err);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'Commission en cours':
        return { bg: '#fff3cd', color: '#856404', icon: '⏳' };
      case 'Décision rendue':
        return { bg: '#d4edda', color: '#155724', icon: '✓' };
      case 'Appel déposé':
        return { bg: '#d1ecf1', color: '#0c5460', icon: '⚖️' };
      default:
        return { bg: '#f5f5f5', color: '#666', icon: '?' };
    }
  };

  return (
    <div className="page-container">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Scale size={28} color="#006B3F" />
        Appels & Recours
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Détails recours */}
        <div>
          {selectedRecours && (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#006B3F' }}>
                📋 Détails Recours - {selectedRecours.code}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>PAP</div>
                  <div style={{ fontWeight: '600', color: '#006B3F', fontSize: '14px' }}>
                    {selectedRecours.pap} - {selectedRecours.nom}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>Date Réclamation</div>
                  <div style={{ fontWeight: '600', color: '#666', fontSize: '14px' }}>
                    {selectedRecours.dateReclamation}
                  </div>
                </div>
              </div>

              <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                  Motif de Réclamation
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#666', marginBottom: '1rem' }}>
                  {selectedRecours.motif}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '0.25rem' }}>Montant Cadastre</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2196f3' }}>
                      {(selectedRecours.montantRevendique / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '0.25rem' }}>Offre Initiale</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f44336' }}>
                      {(selectedRecours.montantOffre / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', fontSize: '12px', color: '#856404', background: '#fff3cd', padding: '0.75rem', borderRadius: '6px' }}>
                  ⚠️ Écart: {(((selectedRecours.montantRevendique - selectedRecours.montantOffre) / selectedRecours.montantRevendique) * 100).toFixed(0)}%
                </div>
              </div>

              <div style={{ background: '#f0f8f5', padding: '1.5rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '1rem', color: '#2e7d32' }}>
                  📊 Workflow & Timeline
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#4caf50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                      1
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>Réclamation déposée</div>
                      <div style={{ color: '#666' }}>{selectedRecours.dateReclamation}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ff9800', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                      2
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>Examen commission locale</div>
                      <div style={{ color: '#666' }}>En cours...</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#bdbdbd', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                      3
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>Décision rendue</div>
                      <div style={{ color: '#666' }}>Avant 14.08.2026 (délai 30j)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>Total Recours</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#006B3F' }}>{recours.length}</div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '0.5rem' }}>Taux: {((recours.length / 156) * 100).toFixed(1)}% des PAP</div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>Délai Moyen</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>18 jours</div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '0.5rem' }}>Max: 30 jours</div>
            </div>
          </div>
        </div>

        {/* Liste recours */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#006B3F' }}>📋 Recours Ouverts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recours.map(r => {
              const statusColor = getStatusColor(r.statut);
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRecours(r)}
                  style={{
                    padding: '1rem',
                    background: selectedRecours.id === r.id ? '#f0f8f5' : '#f9f9f9',
                    border: `2px solid ${selectedRecours.id === r.id ? '#006B3F' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#006B3F', fontSize: '13px', marginBottom: '0.25rem' }}>
                        {r.code}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {r.nom}
                      </div>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      background: statusColor.bg,
                      color: statusColor.color,
                      borderRadius: '4px',
                      fontSize: '9px',
                      fontWeight: '600'
                    }}>
                      {statusColor.icon}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '0.5rem' }}>
                    {r.dateReclamation} • {r.delaiRestant}
                  </div>
                  <div style={{
                    padding: '0.5rem',
                    background: statusColor.bg,
                    color: statusColor.color,
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    {r.statut}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px', fontSize: '11px', lineHeight: '1.6', color: '#666' }}>
            <strong>💡 SLA Compliance</strong><br />
            ✓ Délai légal: 30 jours<br />
            ✓ Respect: 100%<br />
            ✓ Commission: Hebdomadaire
          </div>
        </div>
      </div>
    </div>
  );
}
