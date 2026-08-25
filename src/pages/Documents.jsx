import { useState, useEffect } from 'react';
import { Upload, Download, Trash2, FileText, Image as ImageIcon } from 'lucide-react';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pap_id, setPapId] = useState('');

  const [formData, setFormData] = useState({
    pap_id: '',
    type_document: 'CNI',
    nom_fichier: '',
    url: ''
  });

  useEffect(() => {
    if (pap_id) fetchDocuments();
  }, [pap_id]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents/list?pap_id=${pap_id}`);
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setDocuments(data);
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
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pap_id: parseInt(pap_id)
        })
      });
      if (response.ok) {
        fetchDocuments();
        setFormData({
          pap_id: '',
          type_document: 'CNI',
          nom_fichier: '',
          url: ''
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const documentTypes = ['CNI', 'Titre foncier', 'Délibération', 'PV', 'Acte', 'Chèque', 'Photo', 'Autre'];

  const getDocumentIcon = (type) => {
    return ['Photo'].includes(type) ? <ImageIcon size={24} /> : <FileText size={24} />;
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Gestion des Documents</h1>
        <p className="page-subtitle">Stockage centralisé des pièces justificatives</p>
      </div>

      {/* Sélecteur PAP */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
          Sélectionner un PAP:
        </label>
        <input
          type="number"
          value={pap_id}
          onChange={(e) => setPapId(e.target.value)}
          placeholder="ID PAP..."
          style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', width: '100%', maxWidth: '300px' }}
        />
      </div>

      {pap_id && (
        <>
          {/* Bouton upload */}
          <div style={{ marginBottom: '2rem' }}>
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
              <Upload size={20} />
              Ajouter document
            </button>
          </div>

          {/* Formulaire upload */}
          {showForm && (
            <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>Télécharger un document</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid_2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label>Type de document *</label>
                    <select name="type_document" value={formData.type_document} onChange={handleChange}>
                      {documentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nom du fichier *</label>
                    <input
                      type="text"
                      name="nom_fichier"
                      value={formData.nom_fichier}
                      onChange={handleChange}
                      placeholder="document.pdf"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>URL/Lien du fichier *</label>
                    <input
                      type="url"
                      name="url"
                      value={formData.url}
                      onChange={handleChange}
                      placeholder="https://..."
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      background: '#006B3F',
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

          {/* Galerie */}
          <div className="card">
            {loading ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Chargement...</p>
            ) : documents.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Aucun document pour ce PAP</p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                      {getDocumentIcon(doc.type_document)}
                    </div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
                      {doc.type_document}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
                      {doc.nom_fichier}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '6px 10px',
                          background: '#006B3F',
                          color: 'white',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Download size={14} />
                        Télécharger
                      </a>
                      <button
                        onClick={() => console.log('Delete', doc.id)}
                        style={{
                          padding: '6px 10px',
                          background: '#fee2e2',
                          color: '#ef4444',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
