import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';

export default function RegistrePAP() {
  const [paps, setPaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [commune, setCommune] = useState('');

  const [communes, setCommunes] = useState([]);
  const [statuts, setStatuts] = useState([]);

  useEffect(() => {
    fetchPAPs();
    fetchFilters();
  }, [page, search, statut, commune]);

  const fetchPAPs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(statut && { statut }),
        ...(commune && { commune })
      });

      const response = await fetch(`/api/pap/list?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setPaps(data.data);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Fetch error:', error);
      setPaps([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      // Récupérer communes uniques
      const communesRes = await fetch('/api/pap/communes');
      if (communesRes.ok) {
        const data = await communesRes.json();
        setCommunes(data);
      }
    } catch (error) {
      console.error('Fetch filters error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce PAP?')) return;
    try {
      const response = await fetch(`/api/pap/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchPAPs();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const statutBadgeColor = (statut) => {
    const colors = {
      'Nouveau': '#3b82f6',
      'Recensé': '#8b5cf6',
      'À vérifier': '#f59e0b',
      'Fiabilisé': '#10b981',
      'Évalué': '#06b6d4',
      'En conciliation': '#ec4899',
      'Concilié': '#14b8a6',
      'Payé': '#22c55e',
      'Clôturé': '#6b7280'
    };
    return colors[statut] || '#94a3b8';
  };

  const fiabilisationBadge = (fiab) => {
    const badges = {
      'complet': { emoji: '🟢', text: 'Complet', color: '#10b981' },
      'incomplet': { emoji: '🟠', text: 'Incomplet', color: '#f59e0b' },
      'anomalie': { emoji: '🔴', text: 'Anomalies', color: '#ef4444' }
    };
    return badges[fiab] || { emoji: '❓', text: 'Inconnu', color: '#94a3b8' };
  };

  const pages = Math.ceil(total / limit);

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Registre des PAP</h1>
          <p className="page-subtitle">Gestion centralisée des Personnes Affectées par les Projets</p>
        </div>
        <Link to="/nouveau-pap" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#006B3F', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
          <Plus size={20} />
          Nouveau PAP
        </Link>
      </div>

      {/* Filtres */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="grid grid-3" style={{ gap: '1rem' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', fontWeight: '500' }}>
              <Search size={18} />
              Recherche
            </label>
            <input
              type="text"
              placeholder="Nom, code PAP, téléphone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
            />
          </div>

          <div>
            <label style={{ marginBottom: '0.5rem', fontWeight: '500', display: 'block' }}>Statut</label>
            <select
              value={statut}
              onChange={(e) => {
                setStatut(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
            >
              <option value="">Tous les statuts</option>
              <option value="Nouveau">Nouveau</option>
              <option value="Recensé">Recensé</option>
              <option value="À vérifier">À vérifier</option>
              <option value="Fiabilisé">Fiabilisé</option>
              <option value="Évalué">Évalué</option>
              <option value="En conciliation">En conciliation</option>
              <option value="Concilié">Concilié</option>
              <option value="À payer">À payer</option>
              <option value="Payé">Payé</option>
              <option value="Clôturé">Clôturé</option>
            </select>
          </div>

          <div>
            <label style={{ marginBottom: '0.5rem', fontWeight: '500', display: 'block' }}>Commune</label>
            <select
              value={commune}
              onChange={(e) => {
                setCommune(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
            >
              <option value="">Toutes communes</option>
              <option value="Dakar">Dakar</option>
              <option value="Pikine">Pikine</option>
              <option value="Guédiawaye">Guédiawaye</option>
              <option value="Rufisque">Rufisque</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="card" style={{ overflow: 'auto' }}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Chargement...</p>
        ) : paps.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Aucun PAP trouvé</p>
        ) : (
          <>
            <table style={{ width: '100%', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Code PAP</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Nom</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Téléphone</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Commune</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Statut</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Fiabilisation</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paps.map((pap) => {
                  const fiab = fiabilisationBadge(pap.fiabilisation);
                  return (
                    <tr key={pap.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#006B3F' }}>{pap.code_pap}</td>
                      <td style={{ padding: '1rem' }}>{pap.nom} {pap.prenom}</td>
                      <td style={{ padding: '1rem' }}>{pap.telephone}</td>
                      <td style={{ padding: '1rem' }}>{pap.commune}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.4rem 0.8rem',
                          background: `${statutBadgeColor(pap.statut)}20`,
                          color: statutBadgeColor(pap.statut),
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {pap.statut}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.2rem' }}>
                        <span title={fiab.text}>{fiab.emoji}</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <Link
                            to={`/pap/${pap.code_pap}`}
                            style={{ padding: '6px', color: '#006B3F', cursor: 'pointer' }}
                            title="Voir détail"
                          >
                            <Eye size={18} />
                          </Link>
                          <button
                            onClick={() => console.log('Edit', pap.id)}
                            style={{ padding: '6px', color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer' }}
                            title="Éditer"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(pap.id)}
                            style={{ padding: '6px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Total: <strong>{total}</strong> PAP ({page} / {pages})
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                >
                  Précédent
                </button>
                {Array.from({ length: Math.min(5, pages) }, (_, i) => page + i - 2).filter(p => p > 0 && p <= pages).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: '8px 12px',
                      border: p === page ? '2px solid #006B3F' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      background: p === page ? '#006B3F' : 'white',
                      color: p === page ? 'white' : '#0f172a',
                      cursor: 'pointer',
                      fontWeight: p === page ? '600' : '400'
                    }}
                  >
                    {p}
                  </button>
                ))}
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
