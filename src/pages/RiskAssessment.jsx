import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp, Zap } from 'lucide-react';

export default function RiskAssessment() {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredBy, setFilteredBy] = useState('all');

  useEffect(() => {
    // Charger les profils PAP avec risk scores
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/risk/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'bulk' })
      });
      const data = await response.json();
      setAssessment(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement risk:', error);
      setLoading(false);
    }
  };

  const mockRisks = [
    {
      id: 1,
      pap: 'PAP-2026-0001',
      nom: 'Dia Mamadou',
      riskScore: 15,
      riskLevel: 'LOW',
      factors: [
        { factor: 'Document Quality', weight: 0, risk: 'LOW' },
        { factor: 'Cadastre Match', weight: 0, risk: 'LOW' },
        { factor: 'Title Validity', weight: 15, risk: 'LOW' }
      ],
      docs: ['CNI ✓', 'Titre ✓', 'Attestation ✓'],
      recommendation: 'APPROVE'
    },
    {
      id: 2,
      pap: 'PAP-2026-0002',
      nom: 'Ndiaye Assane',
      riskScore: 42,
      riskLevel: 'MEDIUM',
      factors: [
        { factor: 'Document Quality', weight: 15, risk: 'MEDIUM' },
        { factor: 'Missing Docs', weight: 20, risk: 'MEDIUM' },
        { factor: 'Cadastre Match', weight: 7, risk: 'LOW' }
      ],
      docs: ['CNI ✓', 'Titre ✓', 'Attestation ✗'],
      recommendation: 'VERIFY'
    },
    {
      id: 3,
      pap: 'PAP-2026-0003',
      nom: 'Sall Aïssatou',
      riskScore: 78,
      riskLevel: 'HIGH',
      factors: [
        { factor: 'Cadastre Discrepancy', weight: 35, risk: 'HIGH' },
        { factor: 'Title Invalid', weight: 25, risk: 'HIGH' },
        { factor: 'CNI Expired', weight: 18, risk: 'HIGH' }
      ],
      docs: ['CNI ✗', 'Titre ⚠️', 'Attestation ✓'],
      recommendation: 'REVIEW'
    }
  ];

  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW': return { bg: '#d4edda', border: '#c3e6cb', text: '#155724', icon: '🟢' };
      case 'MEDIUM': return { bg: '#fff3cd', border: '#ffeeba', text: '#856404', icon: '🟡' };
      case 'HIGH': return { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24', icon: '🔴' };
      case 'CRITICAL': return { bg: '#d32f2f', border: '#c62828', text: 'white', icon: '🛑' };
      default: return { bg: '#e0e0e0', border: '#bdbdbd', text: '#666', icon: '⚪' };
    }
  };

  const getRecommendationAction = (rec) => {
    switch (rec) {
      case 'APPROVE': return { color: '#4caf50', label: '✅ APPROUVER', bg: '#d4edda' };
      case 'VERIFY': return { color: '#ff9800', label: '⚠️ VERIFIER', bg: '#fff3cd' };
      case 'REVIEW': return { color: '#f44336', label: '🔴 EXAMINER', bg: '#f8d7da' };
      case 'REJECT': return { color: '#d32f2f', label: '❌ REJETER', bg: '#f5c6cb' };
      default: return { color: '#757575', label: 'PENDING', bg: '#e0e0e0' };
    }
  };

  const filtered = filteredBy === 'all'
    ? mockRisks
    : mockRisks.filter(r => r.riskLevel === filteredBy);

  return (
    <div className="page-container">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <AlertTriangle size={28} color="#006B3F" />
        Évaluation Risques PAP
      </h1>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Tous', value: 'all', count: mockRisks.length },
          { label: '🟢 Faible', value: 'LOW', count: mockRisks.filter(r => r.riskLevel === 'LOW').length },
          { label: '🟡 Moyen', value: 'MEDIUM', count: mockRisks.filter(r => r.riskLevel === 'MEDIUM').length },
          { label: '🔴 Élevé', value: 'HIGH', count: mockRisks.filter(r => r.riskLevel === 'HIGH').length }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilteredBy(f.value)}
            style={{
              padding: '0.75rem 1.5rem',
              background: filteredBy === f.value ? '#006B3F' : '#f5f5f5',
              color: filteredBy === f.value ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Stats Globales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total PAP', value: mockRisks.length, color: '#006B3F' },
          { label: 'Faible Risque', value: mockRisks.filter(r => r.riskLevel === 'LOW').length, color: '#4caf50' },
          { label: 'Risque Moyen', value: mockRisks.filter(r => r.riskLevel === 'MEDIUM').length, color: '#ff9800' },
          { label: 'Risque Élevé', value: mockRisks.filter(r => r.riskLevel === 'HIGH').length, color: '#f44336' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>{stat.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Liste PAP avec Risk Scores */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map(risk => {
          const riskColor = getRiskColor(risk.riskLevel);
          const action = getRecommendationAction(risk.recommendation);

          return (
            <div key={risk.id} style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              border: `2px solid ${riskColor.border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#006B3F', marginBottom: '0.25rem' }}>
                    {risk.pap} - {risk.nom}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Créé le 26.08.2026 • Évalué aujourd'hui
                  </div>
                </div>

                {/* Risk Badge */}
                <div style={{
                  background: riskColor.bg,
                  border: `2px solid ${riskColor.border}`,
                  color: riskColor.text,
                  padding: '1rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                  minWidth: '150px'
                }}>
                  <div style={{ fontSize: '32px' }}>{riskColor.icon}</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {risk.riskScore}%
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600' }}>
                    {risk.riskLevel}
                  </div>
                </div>
              </div>

              {/* Factors */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.75rem', fontSize: '13px' }}>📊 Facteurs de Risque</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  {risk.factors.map((factor, i) => {
                    const factorColor = getRiskColor(factor.risk);
                    return (
                      <div key={i} style={{
                        background: 'white',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: `1px solid ${factorColor.border}`,
                        fontSize: '12px'
                      }}>
                        <div style={{ color: factorColor.text, fontWeight: '600', marginBottom: '0.25rem' }}>
                          {factor.factor}
                        </div>
                        <div style={{ color: factorColor.text, fontSize: '13px', fontWeight: 'bold' }}>
                          +{factor.weight}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Documents Status */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f0f8f5', borderRadius: '8px' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.75rem', fontSize: '13px', color: '#2e7d32' }}>
                  📄 Documents
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {risk.docs.map((doc, i) => (
                    <div key={i} style={{
                      padding: '0.5rem 1rem',
                      background: doc.includes('✓') ? '#d4edda' : doc.includes('⚠️') ? '#fff3cd' : '#f8d7da',
                      color: doc.includes('✓') ? '#155724' : doc.includes('⚠️') ? '#856404' : '#721c24',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {doc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div style={{
                background: action.bg,
                border: `2px solid ${action.color}`,
                color: action.color,
                padding: '1rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: '600'
              }}>
                <div>{action.label}</div>
                <button style={{
                  background: action.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px'
                }}>
                  Voir Détails →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
