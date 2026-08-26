import React, { useState } from 'react';
import { DollarSign, Calculator, TrendingUp } from 'lucide-react';

export default function Dedommagement() {
  const [modalite, setModalite] = useState('unique');
  const [selectedPAP, setSelectedPAP] = useState(null);

  const paps = [
    { id: 1, code: 'PAP-2026-001', nom: 'Dia Mamadou', bien: 'Maison', montantCadastre: 12500000, montantOffre: 4500000 },
    { id: 2, code: 'PAP-2026-002', nom: 'Ndiaye Assane', bien: 'Terrain', montantCadastre: 8000000, montantOffre: 3200000 },
    { id: 3, code: 'PAP-2026-003', nom: 'Sall Aïssatou', bien: 'Maison+Terrain', montantCadastre: 15000000, montantOffre: 5000000 },
  ];

  const bareme = [
    { type: 'Terrain nu', base: 'm² × prix local', montant: '50K-100K/m²' },
    { type: 'Maison', base: 'Evaluation + 20%', montant: '10-20M' },
    { type: 'Bétail', base: 'Valeur marché', montant: '500K-1M/tête' },
    { type: 'Récolte', base: 'Rendement × prix', montant: '2-5M/hectare' },
  ];

  const getEchelonnement = (montant) => {
    const tiers = Math.round(montant / 3);
    return [
      { num: 1, date: '10.01.2026', montant: tiers },
      { num: 2, date: '10.02.2026', montant: tiers },
      { num: 3, date: '10.03.2026', montant: montant - (tiers * 2) },
    ];
  };

  return (
    <div className="page-container">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <DollarSign size={28} color="#006B3F" />
        Dédommagement & Compensation
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Contenu principal */}
        <div>
          {/* Barème */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#006B3F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={20} /> Barème de Compensation
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Type Bien</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Base Calcul</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {bareme.map((b, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{b.type}</td>
                    <td style={{ padding: '0.75rem' }}>{b.base}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#006B3F' }}>
                      {b.montant}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modalités */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#006B3F' }}>💳 Modalités de Paiement</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              {['unique', 'echelonne', 'rente'].map(m => (
                <button
                  key={m}
                  onClick={() => setModalite(m)}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: modalite === m ? '#006B3F' : '#f5f5f5',
                    color: modalite === m ? 'white' : '#333',
                    border: `2px solid ${modalite === m ? '#006B3F' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                  }}
                >
                  {m === 'unique' && 'Versement Unique'}
                  {m === 'echelonne' && 'Échelonné (3x)'}
                  {m === 'rente' && 'Rente Annuelle'}
                </button>
              ))}
            </div>

            {modalite === 'unique' && (
              <div style={{ background: '#f0f8f5', padding: '1rem', borderRadius: '8px', fontSize: '13px' }}>
                ✓ Versement intégral en une seule tranche<br />
                ✓ Délai: 5-10 jours ouvrables<br />
                ✓ Mode: Chèque / Virement / Wave / OM
              </div>
            )}

            {modalite === 'echelonne' && (
              <div style={{ background: '#f0f8f5', padding: '1rem', borderRadius: '8px', fontSize: '13px' }}>
                ✓ 3 paiements égaux<br />
                ✓ Intervalle: 30 jours entre chaque<br />
                ✓ Intérêt: 0% (gratuit)
              </div>
            )}

            {modalite === 'rente' && (
              <div style={{ background: '#f0f8f5', padding: '1rem', borderRadius: '8px', fontSize: '13px' }}>
                ✓ Montant annuel: 5-10% du capital<br />
                ✓ Durée: 10-15 ans<br />
                ✓ Indexation inflation annuelle
              </div>
            )}
          </div>

          {/* PAP */}
          {selectedPAP && (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#006B3F' }}>📊 Détail Paiement - {selectedPAP.code}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.25rem' }}>Valeur Cadastre</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2196f3' }}>
                    {(selectedPAP.montantCadastre / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.25rem' }}>Offre</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f44336' }}>
                    {(selectedPAP.montantOffre / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '13px', color: '#856404' }}>
                ⚠️ Écart: {(((selectedPAP.montantCadastre - selectedPAP.montantOffre) / selectedPAP.montantCadastre) * 100).toFixed(0)}% sous-évaluation
              </div>

              {modalite === 'echelonne' && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '0.75rem' }}>📅 Plan Échelonné</h4>
                  {getEchelonnement(selectedPAP.montantOffre).map((e, i) => (
                    <div key={i} style={{
                      display: 'grid',
                      gridTemplateColumns: '30px 1fr 100px',
                      gap: '1rem',
                      padding: '0.75rem',
                      background: '#f5f5f5',
                      borderRadius: '6px',
                      marginBottom: '0.5rem',
                      fontSize: '12px',
                      alignItems: 'center'
                    }}>
                      <div style={{ fontWeight: '700', color: '#006B3F' }}>#{e.num}</div>
                      <div>{e.date}</div>
                      <div style={{ textAlign: 'right', fontWeight: '600', color: '#006B3F' }}>
                        {(e.montant / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panneau PAP */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#006B3F' }}>👥 Sélectionner PAP</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {paps.map(pap => (
              <div
                key={pap.id}
                onClick={() => setSelectedPAP(pap)}
                style={{
                  padding: '1rem',
                  background: selectedPAP?.id === pap.id ? '#f0f8f5' : '#f9f9f9',
                  border: `2px solid ${selectedPAP?.id === pap.id ? '#006B3F' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ fontWeight: '600', color: '#006B3F', marginBottom: '0.25rem' }}>
                  {pap.code}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>
                  {pap.nom} • {pap.bien}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                  <span style={{ color: '#2196f3' }}>C: {(pap.montantCadastre / 1000000).toFixed(1)}M</span>
                  <span style={{ color: '#f44336' }}>O: {(pap.montantOffre / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
