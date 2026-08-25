import { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit2 } from 'lucide-react';

export default function Evaluations() {
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    montant_initial: '',
    montant_fiabilise: '',
    evaluateur: ''
  });

  useEffect(() => {
    fetchBiens();
  }, []);

  const fetchBiens = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/biens/list');
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setBiens(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bien) => {
    setEditingId(bien.id);
    setEditForm({
      montant_initial: bien.montant_initial || '',
      montant_fiabilise: bien.montant_valide || bien.montant_initial || '',
      evaluateur: bien.evaluateur || ''
    });
  };

  const handleSave = async (bienId) => {
    try {
      const response = await fetch('/api/evaluations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bien_id: bienId,
          montant_initial: parseInt(editForm.montant_initial),
          montant_fiabilise: parseInt(editForm.montant_fiabilise || editForm.montant_initial),
          evaluateur: editForm.evaluateur
        })
      });
      if (response.ok) {
        fetchBiens();
        setEditingId(null);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <DollarSign size={32} style={{ color: '#F29400' }} />
          Évaluations des Biens
        </h1>
        <p className="page-subtitle">Saisie des montants initial, fiabilisé et validé</p>
      </div>

      {/* Tableau évaluations */}
      <div className="card">
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Chargement...</p>
        ) : biens.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Aucun bien à évaluer</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.85rem', minWidth: '1000px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Code Bien</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>PAP</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Type</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Montant Initial (FCFA)</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Montant Fiabilisé</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Évaluateur</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {biens.map((bien) => (
                  <tr key={bien.id} style={{ borderBottom: '1px solid #e2e8f0', background: editingId === bien.id ? '#f8fafc' : 'white' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600', color: '#006B3F' }}>{bien.code_bien}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: '500' }}>{bien.pap_nom} {bien.pap_prenom}</div>
                      <div style={{ color: '#94a3b8' }}>{bien.code_pap}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{bien.type_bien}</td>
                    {editingId === bien.id ? (
                      <>
                        <td style={{ padding: '0.75rem' }}>
                          <input
                            type="number"
                            value={editForm.montant_initial}
                            onChange={(e) => setEditForm(prev => ({ ...prev, montant_initial: e.target.value }))}
                            style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <input
                            type="number"
                            value={editForm.montant_fiabilise}
                            onChange={(e) => setEditForm(prev => ({ ...prev, montant_fiabilise: e.target.value }))}
                            style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <input
                            type="text"
                            value={editForm.evaluateur}
                            onChange={(e) => setEditForm(prev => ({ ...prev, evaluateur: e.target.value }))}
                            style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleSave(bien.id)}
                            style={{
                              padding: '4px 8px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginRight: '4px',
                              fontSize: '0.8rem'
                            }}
                          >
                            Valider
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{
                              padding: '4px 8px',
                              background: '#e2e8f0',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            Annuler
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                          {bien.montant_initial ? (bien.montant_initial / 1000000).toFixed(1) + 'M' : '-'}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#006B3F' }}>
                          {bien.montant_valide ? (bien.montant_valide / 1000000).toFixed(1) + 'M' : '-'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>{bien.evaluateur || '-'}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleEdit(bien)}
                            style={{
                              padding: '6px',
                              color: '#f59e0b',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={18} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      {biens.length > 0 && (
        <div className="grid grid-3" style={{ marginTop: '2rem', gap: '1rem' }}>
          <div className="card">
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Biens évalués</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#006B3F' }}>
              {biens.filter(b => b.montant_initial).length} / {biens.length}
            </p>
          </div>
          <div className="card">
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total initial</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F29400' }}>
              {(biens.reduce((sum, b) => sum + (b.montant_initial || 0), 0) / 1000000).toFixed(1)}M FCFA
            </p>
          </div>
          <div className="card">
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total validé</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
              {(biens.reduce((sum, b) => sum + (b.montant_valide || 0), 0) / 1000000).toFixed(1)}M FCFA
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
