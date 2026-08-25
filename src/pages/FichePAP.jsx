import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function FichePAP() {
  const { code_pap } = useParams();
  const navigate = useNavigate();
  const [pap, setPap] = useState(null);
  const [biens, setBiens] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchFichePAP();
  }, [code_pap]);

  const fetchFichePAP = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pap/${code_pap}`);
      if (!response.ok) throw new Error('PAP non trouvé');

      const data = await response.json();
      setPap(data.pap);
      setBiens(data.biens || []);
      setEvaluations(data.evaluations || []);
      setPaiements(data.paiements || []);
      setDocuments(data.documents || []);
      setHistorique(data.historique || []);

      if (data.pap.anomalies) {
        setAnalysis(JSON.parse(data.pap.anomalies));
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiabiliser = async () => {
    try {
      const response = await fetch(`/api/pap/${code_pap}/fiabiliser`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.anomalies);
        setPap(prev => ({ ...prev, fiabilisation: data.statut }));
      }
    } catch (error) {
      console.error('Fiabilisation error:', error);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
  if (!pap) return <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>PAP non trouvé</div>;

  const fiabBadge = {
    'complet': { emoji: '🟢', text: 'Complet', color: '#10b981' },
    'incomplet': { emoji: '🟠', text: 'Incomplet', color: '#f59e0b' },
    'anomalie': { emoji: '🔴', text: 'Anomalies', color: '#ef4444' }
  }[pap.fiabilisation] || { emoji: '❓', text: 'Inconnu', color: '#94a3b8' };

  const totalEval = evaluations.reduce((sum, e) => sum + (e.montant_valide || 0), 0);
  const totalPaye = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);
  const solde = totalEval - totalPaye;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/registre')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
          >
            <ArrowLeft size={24} style={{ color: '#006B3F' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
              {pap.nom} {pap.prenom}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>{pap.code_pap}</p>
          </div>
        </div>
        <button
          onClick={handleFiabiliser}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#F29400',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <RefreshCw size={18} />
          Fiabiliser
        </button>
      </div>

      {/* KPIs Rapides */}
      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Statut</p>
          <p style={{ fontSize: '1.3rem', fontWeight: '700', color: '#006B3F' }}>{pap.statut}</p>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Fiabilisation</p>
          <p style={{ fontSize: '1.5rem' }}>
            {fiabBadge.emoji} <span style={{ fontSize: '1rem', color: fiabBadge.color, fontWeight: '600' }}>{fiabBadge.text}</span>
          </p>
        </div>
        <div className="card">
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Solde</p>
          <p style={{ fontSize: '1.3rem', fontWeight: '700', color: solde > 0 ? '#ef4444' : '#10b981' }}>
            {(solde / 1000000).toFixed(1)}M FCFA
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div className="card">
        <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
          {['general', 'biens', 'evaluations', 'paiements', 'documents', 'historique'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? '700' : '500',
                color: activeTab === tab ? '#006B3F' : '#94a3b8',
                borderBottom: activeTab === tab ? '3px solid #006B3F' : 'none',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'general' ? 'Général' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div>
            <div className="grid grid-2" style={{ gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>Identité</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <div><strong>Nom:</strong> {pap.nom}</div>
                  <div><strong>Prénom:</strong> {pap.prenom}</div>
                  <div><strong>CNI:</strong> {pap.cni || '-'}</div>
                  <div><strong>Sexe:</strong> {pap.sexe || '-'}</div>
                  <div><strong>Date naissance:</strong> {pap.date_naissance || '-'}</div>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>Contact</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <div><strong>Téléphone:</strong> {pap.telephone}</div>
                  <div><strong>Téléphone 2:</strong> {pap.telephone2 || '-'}</div>
                  <div><strong>Commune:</strong> {pap.commune}</div>
                  <div><strong>Région:</strong> {pap.region || '-'}</div>
                  <div><strong>Adresse:</strong> {pap.adresse_detail || '-'}</div>
                </div>
              </div>
            </div>

            {/* Anomalies */}
            {analysis && analysis.length > 0 && (
              <div style={{ marginTop: '2rem', padding: '1rem', background: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={20} />
                  Anomalies détectées ({analysis.length})
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {analysis.map((anom, i) => (
                    <li key={i} style={{ paddingBottom: '0.5rem', fontSize: '0.9rem', color: '#78350f' }}>
                      • <strong>{anom.code}:</strong> {anom.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Biens Tab */}
        {activeTab === 'biens' && (
          <div>
            {biens.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Aucun bien déclaré</p>
            ) : (
              <table style={{ width: '100%', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Code Bien</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Type</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Superficie</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Localisation</th>
                  </tr>
                </thead>
                <tbody>
                  {biens.map(bien => (
                    <tr key={bien.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.75rem', fontWeight: '600', color: '#006B3F' }}>{bien.code_bien}</td>
                      <td style={{ padding: '0.75rem' }}>{bien.type_bien}</td>
                      <td style={{ padding: '0.75rem' }}>{bien.superficie_m2} m²</td>
                      <td style={{ padding: '0.75rem' }}>{bien.localisation || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Évaluations Tab */}
        {activeTab === 'evaluations' && (
          <div>
            {evaluations.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Aucune évaluation</p>
            ) : (
              <div>
                <table style={{ width: '100%', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Montant Initial</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Montant Validé</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Évaluateur</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map(evaluation => (
                      <tr key={evaluation.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.75rem', fontWeight: '600' }}>
                          {(evaluation.montant_initial / 1000000).toFixed(1)}M FCFA
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: '600', color: '#006B3F' }}>
                          {(evaluation.montant_valide / 1000000).toFixed(1)}M FCFA
                        </td>
                        <td style={{ padding: '0.75rem' }}>{evaluation.evaluateur || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{evaluation.date_evaluation || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px' }}>
                  <p><strong>Total évalué:</strong> {(totalEval / 1000000).toFixed(1)}M FCFA</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Paiements Tab */}
        {activeTab === 'paiements' && (
          <div>
            {paiements.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Aucun paiement enregistré</p>
            ) : (
              <div>
                <table style={{ width: '100%', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Mode</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Montant</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paiements.map(pmt => (
                      <tr key={pmt.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.75rem' }}>{pmt.mode}</td>
                        <td style={{ padding: '0.75rem', fontWeight: '600' }}>
                          {(pmt.montant / 1000000).toFixed(1)}M FCFA
                        </td>
                        <td style={{ padding: '0.75rem' }}>{pmt.date_paiement}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            background: pmt.statut === 'Payé' ? '#d1fae5' : '#fef3c7',
                            color: pmt.statut === 'Payé' ? '#065f46' : '#92400e',
                            borderRadius: '4px',
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
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px' }}>
                  <p><strong>Total payé:</strong> {(totalPaye / 1000000).toFixed(1)}M FCFA</p>
                  <p><strong>Solde restant:</strong> {(solde / 1000000).toFixed(1)}M FCFA</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            {documents.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Aucun document</p>
            ) : (
              <div className="grid grid-3" style={{ gap: '1rem' }}>
                {documents.map(doc => (
                  <div key={doc.id} style={{
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>{doc.type_document}</p>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>{doc.nom_fichier}</p>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '0.5rem 1rem',
                      background: '#006B3F',
                      color: 'white',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      <Download size={16} />
                      Télécharger
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Historique Tab */}
        {activeTab === 'historique' && (
          <div>
            {historique.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Aucune modification</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {historique.map((h, i) => (
                  <div key={i} style={{
                    padding: '1rem',
                    background: '#f8fafc',
                    borderLeft: '3px solid #006B3F',
                    borderRadius: '4px'
                  }}>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                      {new Date(h.date_action).toLocaleString('fr-FR')}
                    </p>
                    <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {h.nom} {h.prenom} · {h.action}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                      <strong>{h.champ}:</strong> {h.ancienne_valeur} → {h.nouvelle_valeur}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
