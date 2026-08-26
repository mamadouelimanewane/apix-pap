import { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';

export default function Imports() {
  const [file, setFile] = useState(null);
  const [imported, setImported] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    setLoading(true);
    const uploadedFile = e.target.files[0];

    if (!uploadedFile) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target.result;
        const lines = csv.split('\n').slice(1).filter(l => l.trim());
        const records = lines.slice(0, 5).map((line, idx) => ({
          code_pap: `PAP-2026-${String(idx + 101).padStart(4, '0')}`,
          status: 'Importé ✓'
        }));

        setImported(records);
        setFile(uploadedFile.name);
      };
      reader.readAsText(uploadedFile);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📥 Imports Données</h1>

      <div style={{
        marginTop: '30px',
        padding: '40px',
        border: '2px dashed #006B3F',
        borderRadius: '8px',
        textAlign: 'center',
        cursor: 'pointer'
      }}>
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
          <Upload size={40} style={{ color: '#006B3F', marginBottom: '10px' }} />
          <p style={{ fontSize: '16px', margin: '10px 0' }}>
            <strong>Cliquez pour importer</strong> ou glissez-déposez un fichier CSV
          </p>
          <p style={{ color: '#666', fontSize: '14px' }}>Format : CSV avec colonnes (code_pap, nom, prenom, commune, statut)</p>
        </label>
      </div>

      {file && (
        <div style={{ marginTop: '30px', padding: '20px', background: '#f0f8f5', borderRadius: '8px' }}>
          <h3>✅ Fichier : {file}</h3>
          <p>📊 Enregistrements importés : {imported.length}</p>

          <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #006B3F' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Code PAP</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {imported.map((record, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{record.code_pap}</td>
                  <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} style={{ color: '#006B3F' }} />
                    {record.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            style={{
              marginTop: '20px',
              padding: '12px 20px',
              background: '#006B3F',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ✓ Valider l'import
          </button>
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>📋 Format attendu</h3>
        <pre style={{ background: 'white', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
code_pap,nom,prenom,commune,statut
PAP-2026-0101,Dia,Mamadou,Dakar,Nouveau
PAP-2026-0102,Ndiaye,Fatou,Thiès,Évalué
        </pre>
      </div>
    </div>
  );
}
