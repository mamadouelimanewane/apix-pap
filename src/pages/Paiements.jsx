import { useState, useEffect } from 'react';
import { CreditCard, Plus, Check } from 'lucide-react';

export default function Paiements() {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statut, setStatut] = useState('');

  const [formData, setFormData] = useState({
    pap_id: '',
    montant: '',
    mode: 'Chèque',
    reference: '',
    date_paiement: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPaiements();
  }, [page, statut]);

  const fetchPaiements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50, ...(statut && { statut }) });
      const response = await fetch(`/api/paiements/list?${params}`);
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setPaiements(data.data);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/paiements/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          montant: parseInt(formData.montant)
        })
      });
      if (response.ok) {
        fetchPaiements();
        setFormData({
          pap_id: '',
          montant: '',
          mode: 'Chèque',
          reference: '',
          date_paiement: new Date().toISOString().split('T')[0]
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const totalValide = paiements.reduce((sum, p) => sum + (p.montant_valide || 0), 0);
  const totalPaye = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);
  const solde = totalValide - totalPaye;

  const pages = Math.ceil(total / 50);

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CreditCard size={32} style={{ color: '#10b981' }} />
            Gestion des Paiements
          </h1>
          <p className="page-subtitle">Suivi des versements d'indemnisation</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#006B3F',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <Plus size={20} />
          Enregistrer paiement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid_3" style={{ marginBottom: '2rem', gap: '1rem' }}>
        <div className="card">
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total validé</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#006B3F' }}>
            {(totalValide / 1000000).toFixed(1)}M FCFA
          </p>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total payé</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
            {(totalPaye / 1000000).toFixed(1)}M FCFA
          </p>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Solde restant</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: solde > 0 ? '#ef4444' : '#10b981' }}>
            {(solde / 1000000).toFixed(1)}M FCFA
          </p>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>Enregistrer un paiement</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>PAP ID *</label>
                <input
                  type="number"
                  name="pap_id"
                  value={formData.pap_id}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mode de paiement *</label>
                <select name="mode" value={formData.mode} onChange={handleChange}>
                  <option value="Chèque">Chèque</option>
                  <option value="Virement">Virement</option>
                  <option value="Wave">Wave</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Intouch">Intouch</option>
                </select>
              </div>
              <div className="form-group">
                <label>Montant (FCFA) *</label>
                <input
                  type="number"
                  name="montant"
                  value={formData.montant}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Référence (Chèque, ref. virement...)</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Date de paiement *</label>
                <input
                  type="date"
                  name="date_paiement"
                  value={formData.date_paiement}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Check size={18} />
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '10px 20px',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: '600' }}>Statut:</label>
          <select
            value={statut}
            onChange={(e) => {
              setStatut(e.target.value);
              setPage(1);
            }}
            style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', minWidth: '200px' }}
          >
            <option value="">Tous les statuts</option>
            <option value="En attente">En attente</option>
            <option value="Payé">Payé</option>
            <option value="Annulé">Annulé</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="card">
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Chargement...</p>
        ) : paiements.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Aucun paiement enregistré</p>
        ) : (
          <>
            <table style={{ width: '100%', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Code Paiement</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>PAP</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Mode</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Montant</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {paiements.map((pmt) => (
                  <tr key={pmt.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#006B3F' }}>{pmt.code_paiement}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500' }}>{pmt.nom} {pmt.prenom}</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{pmt.code_pap}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{pmt.mode}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>
                      {(pmt.montant / 1000000).toFixed(1)}M FCFA
                    </td>
                    <td style={{ padding: '1rem' }}>{pmt.date_paiement}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.4rem 0.8rem',
                        background: pmt.statut === 'Payé' ? '#d1fae5' : '#fef3c7',
                        color: pmt.statut === 'Payé' ? '#065f46' : '#92400e',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}>
                        {pmt.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Total: <strong>{total}</strong> paiements
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                >
                  Précédent
                </button>
                <span style={{ padding: '8px 12px' }}>{page} / {pages}</span>
                <button
                  onClick={() => setPage(Math.min(pages, page + 1))}
                  disabled={page === pages}
                  style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.5 : 1 }}
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
