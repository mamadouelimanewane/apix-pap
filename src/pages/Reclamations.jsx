import { useState, useEffect } from 'react';
import { AlertCircle, Plus, Edit2, CheckCircle } from 'lucide-react';

export default function Reclamations() {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statut, setStatut] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    pap_id: '',
    objet: '',
    description: ''
  });

  useEffect(() => {
    fetchReclamations();
  }, [page, statut]);

  const fetchReclamations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50, ...(statut && { statut }) });
      const response = await fetch(`/api/reclamations/list?${params}`);
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setReclamations(data.data);
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
      const response = await fetch('/api/reclamations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pap_id: parseInt(formData.pap_id)
        })
      });
      if (response.ok) {
        fetchReclamations();
        setFormData({ pap_id: '', objet: '', description: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const statutBadge = (statut) => {
    const colors = {
      'Reçue': '#3b82f6',
      'En analyse': '#f59e0b',
      'Recevable': '#8b5cf6',
      'Irrecevable': '#ef4444',
      'En traitement': '#06b6d4',
      'Réponse envoyée': '#10b981',
      'Clôturée': '#6b7280'
    };
    return colors[statut] || '#94a3b8';
  };

  const pages = Math.ceil(total / 50);

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={32} style={{ color: '#E31B23' }} />
            Réclamations (MGP)
          </h1>
          <p className="page-subtitle">Mécanisme de Gestion des Plaintes - SLA 30 jours</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#E31B23',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <Plus size={20} />
          Nouvelle réclamation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid_3" style={{ marginBottom: '2rem', gap: '1rem' }}>
        <div className="card">
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#E31B23' }}>{total}</p>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Ouvertes</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
            {reclamations.filter(r => r.statut !== 'Clôturée').length}
          </p>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Clôturées</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
            {reclamations.filter(r => r.statut === 'Clôturée').length}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>Enregistrer une réclamation</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid_2" style={{ gap: '1rem', marginBottom: '1rem' }}>
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
                <label>Objet de la réclamation *</label>
                <input
                  type="text"
                  name="objet"
                  value={formData.objet}
                  onChange={handleChange}
                  placeholder="Ex: Montant d'indemnisation insuffisant..."
                  required
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description détaillée</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: '#E31B23',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
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
        <label style={{ fontWeight: '600', marginRight: '1rem' }}>Statut:</label>
        <select
          value={statut}
          onChange={(e) => {
            setStatut(e.target.value);
            setPage(1);
          }}
          style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', minWidth: '200px' }}
        >
          <option value="">Tous</option>
          <option value="Reçue">Reçue</option>
          <option value="En analyse">En analyse</option>
          <option value="En traitement">En traitement</option>
          <option value="Réponse envoyée">Réponse envoyée</option>
          <option value="Clôturée">Clôturée</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="card">
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Chargement...</p>
        ) : reclamations.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Aucune réclamation</p>
        ) : (
          <>
            <table style={{ width: '100%', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Code</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>PAP</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Objet</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Statut</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>SLA</th>
                </tr>
              </thead>
              <tbody>
                {reclamations.map((rec) => {
                  const daysElapsed = rec.date_reception
                    ? Math.floor((new Date() - new Date(rec.date_reception)) / (1000 * 60 * 60 * 24))
                    : 0;
                  const slaStatus = daysElapsed > 30 ? '🔴' : daysElapsed > 25 ? '🟡' : '🟢';

                  return (
                    <tr key={rec.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#E31B23' }}>{rec.code_rec}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>{rec.nom} {rec.prenom}</div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{rec.code_pap}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>{rec.objet}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{rec.date_reception}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.4rem 0.8rem',
                          background: `${statutBadge(rec.statut)}20`,
                          color: statutBadge(rec.statut),
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {rec.statut}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.2rem' }}>
                        {slaStatus} {daysElapsed}j
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0' }}>
              <p style={{ color: '#94a3b8' }}>Total: {total} réclamations</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', opacity: page === 1 ? 0.5 : 1 }}
                >
                  Précédent
                </button>
                <span style={{ padding: '8px 12px' }}>{page} / {pages}</span>
                <button
                  onClick={() => setPage(Math.min(pages, page + 1))}
                  disabled={page === pages}
                  style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', opacity: page === pages ? 0.5 : 1 }}
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info SLA */}
      <div className="card" style={{ marginTop: '2rem', background: '#fef3c7', padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
        <p style={{ color: '#92400e', fontWeight: '600', marginBottom: '0.5rem' }}>📋 Délai de traitement (SLA)</p>
        <p style={{ color: '#78350f', fontSize: '0.9rem' }}>
          🟢 Moins de 25 jours | 🟡 25-30 jours | 🔴 Plus de 30 jours
        </p>
      </div>
    </div>
  );
}
