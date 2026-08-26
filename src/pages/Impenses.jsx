import React, { useState } from 'react';
import { TrendingUp, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function Impenses() {
  const [impenses, setImpenses] = useState([
    { id: 1, categorie: 'Dommages bâtiment', montant: 5200000, statut: 'Approuvé', date: '2026-07-15', agent: 'Ndiaye Assane', justification: 'Dégâts aux fondations' },
    { id: 2, categorie: 'Arrêt d\'activité', montant: 3100000, statut: 'En attente', date: '2026-07-20', agent: 'Ba Mohamed', justification: 'Interruption commerce 3 mois' },
    { id: 3, categorie: 'Relocation temporaire', montant: 4200000, statut: 'En attente', date: '2026-07-22', agent: 'Sall Aïssatou', justification: 'Frais d\'hébergement' },
    { id: 4, categorie: 'Perte récolte', montant: 2800000, statut: 'Rejeté', date: '2026-07-10', agent: 'Dia Mamadou', justification: 'Documentation insuffisante' },
  ]);

  const [showForm, setShowForm] = useState(false);

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'Approuvé':
        return <CheckCircle size={16} color="#4caf50" />;
      case 'En attente':
        return <Clock size={16} color="#ff9800" />;
      case 'Rejeté':
        return <XCircle size={16} color="#f44336" />;
      default:
        return null;
    }
  };

  const totalMontant = impenses.reduce((sum, i) => sum + i.montant, 0);
  const approuves = impenses.filter(i => i.statut === 'Approuvé').reduce((sum, i) => sum + i.montant, 0);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={28} color="#006B3F" />
          Gestion Impensés
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#006B3F',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Plus size={18} /> Nouvel impensé
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>Total Montant</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#006B3F' }}>
            {(totalMontant / 1000000).toFixed(1)}M
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>Approuvés</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
            {(approuves / 1000000).toFixed(1)}M
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>En attente</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
            {impenses.filter(i => i.statut === 'En attente').length}
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>Taux Approbation</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
            {((approuves / totalMontant) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#006B3F' }}>📋 Liste Impensés</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Catégorie</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Montant</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Agent</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Justification</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Statut</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {impenses.map(imp => (
              <tr key={imp.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '0.75rem', fontWeight: '600' }}>{imp.categorie}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#006B3F' }}>
                  {(imp.montant / 1000000).toFixed(1)}M
                </td>
                <td style={{ padding: '0.75rem' }}>{imp.agent}</td>
                <td style={{ padding: '0.75rem', fontSize: '12px', color: '#666' }}>{imp.justification}</td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getStatusIcon(imp.statut)}
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: imp.statut === 'Approuvé' ? '#d4edda' : imp.statut === 'En attente' ? '#fff3cd' : '#f8d7da',
                      color: imp.statut === 'Approuvé' ? '#155724' : imp.statut === 'En attente' ? '#856404' : '#721c24',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {imp.statut}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button style={{
                    padding: '0.4rem 0.8rem',
                    background: '#e0e0e0',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    ✏️ Éditer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#006B3F' }}>Nouvel Impensé</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <input placeholder="Catégorie" style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }} />
              <input placeholder="Montant (FCFA)" type="number" style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }} />
              <textarea placeholder="Justification" rows="4" style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowForm(false)} style={{
                flex: 1,
                padding: '0.75rem',
                background: '#e0e0e0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}>
                Annuler
              </button>
              <button style={{
                flex: 1,
                padding: '0.75rem',
                background: '#006B3F',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}>
                Soumettre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
