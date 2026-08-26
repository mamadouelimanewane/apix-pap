import React, { useState, useEffect } from 'react';
import { Layers, Upload, FileCheck, AlertCircle } from 'lucide-react';

export default function Cadastre() {
  const [parcelles, setParcelles] = useState([]);
  const [searchNumerro, setSearchNumerro] = useState('');
  const [selectedParcelle, setSelectedParcelle] = useState(null);

  useEffect(() => {
    const mockParcelles = [
      {
        id: 1,
        numero: 'RT-001-456',
        proprietaire: 'Dia Mamadou',
        superficie: 500,
        valeur: 12500000,
        titre: 'Titré régulier',
        documents: 3,
        statut: 'Validé'
      },
      {
        id: 2,
        numero: 'RT-001-457',
        proprietaire: 'Ndiaye Assane',
        superficie: 350,
        valeur: 8750000,
        titre: 'Titré régulier',
        documents: 2,
        statut: 'Validé'
      },
      {
        id: 3,
        numero: 'RT-002-123',
        proprietaire: 'Sall Aïssatou',
        superficie: 750,
        valeur: 15000000,
        titre: 'Immatriculé',
        documents: 4,
        statut: 'À vérifier'
      },
    ];
    setParcelles(mockParcelles);
  }, []);

  const filtered = searchNumerro
    ? parcelles.filter(p => p.numero.toLowerCase().includes(searchNumerro.toLowerCase()))
    : parcelles;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={28} color="#006B3F" />
          Cadastre & Propriété
        </h1>
        <button style={{
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
        }}>
          <Upload size={18} /> Importer données
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Parcelles */}
        <div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <input
              type="text"
              placeholder="Rechercher par n° parcelle (RT-001-456)..."
              value={searchNumerro}
              onChange={(e) => setSearchNumerro(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '1.5rem'
              }}
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>N° Parcelle</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Propriétaire</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Superficie</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Valeur</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedParcelle(p)}
                    style={{
                      borderBottom: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      background: selectedParcelle?.id === p.id ? '#f0f8f5' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <td style={{ padding: '0.75rem', fontWeight: '600', color: '#006B3F' }}>{p.numero}</td>
                    <td style={{ padding: '0.75rem' }}>{p.proprietaire}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{p.superficie} m²</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                      {(p.valeur / 1000000).toFixed(1)}M
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: p.statut === 'Validé' ? '#d4edda' : '#fff3cd',
                        color: p.statut === 'Validé' ? '#155724' : '#856404',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {p.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Détails parcelle */}
        <div>
          {selectedParcelle ? (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#006B3F' }}>📋 Détails Parcelle</h3>

              <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '0.75rem', fontSize: '13px' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#666' }}>N° Parcelle</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#006B3F' }}>{selectedParcelle.numero}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#666' }}>Propriétaire</div>
                    <div style={{ fontWeight: '600' }}>{selectedParcelle.proprietaire}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#666' }}>Superficie</div>
                    <div style={{ fontWeight: '600' }}>{selectedParcelle.superficie} m²</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#666' }}>Valeur estimée</div>
                    <div style={{ fontWeight: '600', color: '#006B3F', fontSize: '15px' }}>
                      {(selectedParcelle.valeur / 1000000).toFixed(1)}M FCFA
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#666' }}>Titre</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                      <FileCheck size={16} color="#4caf50" />
                      {selectedParcelle.titre}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '0.75rem' }}>📄 Documents ({selectedParcelle.documents})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[...Array(selectedParcelle.documents)].map((_, i) => (
                    <div key={i} style={{
                      padding: '0.75rem',
                      background: '#f5f5f5',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      border: '1px solid #ddd'
                    }}>
                      📎 Document_{i + 1}.pdf
                    </div>
                  ))}
                </div>
              </div>

              <button style={{
                width: '100%',
                padding: '0.75rem',
                background: '#006B3F',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px'
              }}>
                Voir sur carte
              </button>
            </div>
          ) : (
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#999',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '1rem' }}>🗺️</div>
              <div>Sélectionnez une parcelle pour voir les détails</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
