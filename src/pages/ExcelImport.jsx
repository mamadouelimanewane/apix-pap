import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { parseExcelFile, mapExcelToAPIP, validatePAPData, importToAPI } from '../utils/excelImporter';

export default function ExcelImport() {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState('upload'); // upload → preview → validate → import
  const [excelData, setExcelData] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [validation, setValidation] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    const parsed = await parseExcelFile(selectedFile);
    if (parsed.success) {
      setExcelData(parsed.data);
      const mapped = mapExcelToAPIP(parsed.data);
      setMappedData(mapped.data);
      setStep('preview');
    } else {
      alert(`Erreur: ${parsed.errors.join(', ')}`);
    }
    setLoading(false);
  };

  const handleValidate = () => {
    const val = validatePAPData(mappedData);
    setValidation(val);
    setStep('validate');
  };

  const handleImport = async () => {
    setLoading(true);
    const result = await importToAPI(mappedData);
    setImportResult(result);
    setStep('import');
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Import Excel - PAPs</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Importez des données de bénéficiaires depuis un fichier Excel</p>

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'space-between' }}>
        {['Upload', 'Preview', 'Validate', 'Import'].map((s, i) => (
          <div key={i} style={{
            padding: '1rem',
            flex: 1,
            textAlign: 'center',
            background: i < ['upload', 'preview', 'validate', 'import'].indexOf(step) ? '#10b981' : step === ['upload', 'preview', 'validate', 'import'][i] ? '#3b82f6' : '#e5e7eb',
            color: step === ['upload', 'preview', 'validate', 'import'][i] ? 'white' : '#666',
            borderRadius: '8px',
            fontWeight: '600'
          }}>
            {s}
          </div>
        ))}
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <div style={{
          border: '2px dashed #3b82f6',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          background: '#f0f9ff',
          cursor: 'pointer'
        }}>
          <Upload size={48} style={{ margin: '0 auto 1rem', color: '#3b82f6' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Déposez votre fichier Excel</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>ou cliquez pour parcourir</p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          />
          {file && <p style={{ marginTop: '1rem', color: '#10b981' }}>✅ {file.name}</p>}
        </div>
      )}

      {/* Preview Step */}
      {step === 'preview' && (
        <div>
          <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #10b981' }}>
            <p style={{ color: '#15803d', fontWeight: '600' }}>
              ✅ {excelData.length} lignes détectées - {mappedData.length} PAPs à importer
            </p>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead style={{ background: '#f3f4f6' }}>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #d1d5db' }}>Nom</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #d1d5db' }}>Prénom</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #d1d5db' }}>Email</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #d1d5db' }}>Adresse</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #d1d5db' }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {mappedData.slice(0, 10).map((pap, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem' }}>{pap.nom}</td>
                    <td style={{ padding: '0.75rem' }}>{pap.prenom}</td>
                    <td style={{ padding: '0.75rem' }}>{pap.email}</td>
                    <td style={{ padding: '0.75rem' }}>{pap.adresse}</td>
                    <td style={{ padding: '0.75rem' }}>{pap.montant_initial ? `${(pap.montant_initial / 1000000).toFixed(1)}M` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={handleValidate} disabled={loading} style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            ▶ Valider
          </button>
        </div>
      )}

      {/* Validation Step */}
      {step === 'validate' && validation && (
        <div>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: validation.isValid ? '#f0fdf4' : '#fef2f2', borderRadius: '8px', border: `1px solid ${validation.isValid ? '#10b981' : '#ef4444'}` }}>
            <p style={{ fontWeight: '600', color: validation.isValid ? '#15803d' : '#991b1b', marginBottom: '0.5rem' }}>
              {validation.isValid ? '✅ Validation réussie' : '❌ Erreurs détectées'}
            </p>
            <p>{validation.validCount} / {validation.totalCount} PAPs valides ({validation.successRate})</p>
          </div>

          {validation.errors.length > 0 && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
              <p style={{ fontWeight: '600', color: '#991b1b', marginBottom: '0.5rem' }}>❌ Erreurs ({validation.errors.length}):</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {validation.errors.slice(0, 5).map((err, i) => (
                  <li key={i} style={{ color: '#991b1b', marginBottom: '0.25rem' }}>• {err}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
              <p style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>⚠️ Avertissements ({validation.warnings.length}):</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {validation.warnings.slice(0, 5).map((warn, i) => (
                  <li key={i} style={{ color: '#92400e', marginBottom: '0.25rem' }}>• {warn}</li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={handleImport} disabled={loading || !validation.isValid} style={{
            padding: '0.75rem 1.5rem',
            background: validation.isValid ? '#10b981' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: validation.isValid ? 'pointer' : 'not-allowed',
            fontWeight: '600'
          }}>
            {loading ? '⏳ Import...' : '▶ Importer les PAPs'}
          </button>
        </div>
      )}

      {/* Import Result */}
      {step === 'import' && importResult && (
        <div style={{
          padding: '2rem',
          background: importResult.success ? '#f0fdf4' : '#fef2f2',
          borderRadius: '12px',
          textAlign: 'center',
          border: `2px solid ${importResult.success ? '#10b981' : '#ef4444'}`
        }}>
          {importResult.success ? (
            <CheckCircle size={64} style={{ margin: '0 auto 1rem', color: '#10b981' }} />
          ) : (
            <AlertCircle size={64} style={{ margin: '0 auto 1rem', color: '#ef4444' }} />
          )}
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: importResult.success ? '#15803d' : '#991b1b' }}>
            {importResult.success ? '✅ Import réussi!' : '❌ Erreur import'}
          </h2>
          <p style={{ color: importResult.success ? '#15803d' : '#991b1b', marginBottom: '1rem' }}>
            {importResult.message}
          </p>
          {importResult.errors?.length > 0 && (
            <div style={{ textAlign: 'left', background: 'white', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
              <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Erreurs:</p>
              {importResult.errors.map((err, i) => (
                <p key={i} style={{ fontSize: '0.85rem', color: '#666' }}>• {err}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
