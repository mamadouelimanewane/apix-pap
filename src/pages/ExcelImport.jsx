import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, FileText, Loader } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://apix-pap-backend.onrender.com';
const PROJECT_ID = 'TER'; // TER project ID

export default function ExcelImport() {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState('upload'); // upload → detect → import → result
  const [schemaInfo, setSchemaInfo] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.xlsx')) {
      setError('❌ Fichier invalide. Utilisez .xlsx');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setLoading(true);
    setProgress('📄 Détection des catégories...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(
        `${BACKEND_URL}/api/projects/${PROJECT_ID}/detect-schema`,
        { method: 'POST', body: formData }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Erreur détection');
      }

      setSchemaInfo(data);
      setStep('import');
      setProgress('');
    } catch (err) {
      setError(`❌ ${err.message}`);
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setProgress('⏳ Import en cours...');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('categoryMapping', JSON.stringify(
        Object.keys(schemaInfo.categories).reduce((acc, cat) => {
          acc[cat] = cat;
          return acc;
        }, {})
      ));
      formData.append('columnMapping', JSON.stringify(schemaInfo.columnMapping || {}));

      const response = await fetch(
        `${BACKEND_URL}/api/projects/${PROJECT_ID}/import`,
        { method: 'POST', body: formData }
      );

      const data = await response.json();

      setImportResult(data);
      setStep('result');
      setProgress('');

      if (data.success) {
        setProgress(`✅ ${data.stats.totalCreated} bénéficiaires importés!`);
      }
    } catch (err) {
      setError(`❌ Erreur import: ${err.message}`);
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🚀 Import Excel - TER</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Importez les bénéficiaires du Train Express Regional</p>

      {/* Progress */}
      {progress && (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #3b82f6',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
          <span style={{ color: '#3b82f6', fontWeight: '600' }}>{progress}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #ef4444',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          color: '#991b1b'
        }}>
          {error}
        </div>
      )}

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {['Upload', 'Détect', 'Import', 'Résultat'].map((label, i) => {
          const steps = ['upload', 'detect', 'import', 'result'];
          const isActive = step === steps[i];
          const isComplete = ['upload', 'detect', 'import'].indexOf(step) >= i;
          return (
            <div key={i} style={{
              flex: 1,
              padding: '1rem',
              textAlign: 'center',
              background: isComplete && !isActive ? '#10b981' : isActive ? '#3b82f6' : '#e5e7eb',
              color: isActive || isComplete ? 'white' : '#666',
              borderRadius: '8px',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}>
              {label}
            </div>
          );
        })}
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
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Déposez BDD_TC_APIX_29032022 VF.xlsx
          </h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>34 bénéficiaires TER (188 colonnes)</p>
          <label style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'inline-block'
          }}>
            Sélectionner fichier
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileSelect}
              disabled={loading}
              style={{ display: 'none' }}
            />
          </label>
          {file && <p style={{ marginTop: '1rem', color: '#10b981', fontWeight: '600' }}>✅ {file.name}</p>}
        </div>
      )}

      {/* Detect Step */}
      {step === 'detect' && schemaInfo && (
        <div>
          <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #10b981' }}>
            <p style={{ color: '#15803d', fontWeight: '600', marginBottom: '0.5rem' }}>✅ Schéma détecté</p>
            <p style={{ fontSize: '0.9rem', color: '#15803d' }}>
              📊 {schemaInfo.fileInfo.totalRows} lignes × {schemaInfo.fileInfo.totalColumns} colonnes
            </p>
            {Object.entries(schemaInfo.categories).map(([cat, info]) => (
              <p key={cat} style={{ fontSize: '0.9rem', color: '#15803d', marginTop: '0.5rem' }}>
                📂 {cat}: {info.count} bénéficiaires
              </p>
            ))}
          </div>

          <button
            onClick={handleImport}
            disabled={loading}
            style={{
              padding: '0.75rem 2rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'wait' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            {loading ? '⏳ Import...' : '▶ Importer 34 PAPs'}
          </button>
        </div>
      )}

      {/* Result Step */}
      {step === 'result' && importResult && (
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
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: importResult.success ? '#15803d' : '#991b1b'
          }}>
            {importResult.success ? '🎉 Import réussi!' : '❌ Erreur import'}
          </h2>

          {importResult.stats && (
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>✅ Créées</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {importResult.stats.totalCreated}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>❌ Échouées</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                    {importResult.stats.totalFailed}
                  </p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>📊 Taux de succès</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {importResult.stats.successRate}
                  </p>
                </div>
              </div>

              {importResult.importBatchId && (
                <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  🆔 Batch: {importResult.importBatchId}
                </p>
              )}
            </div>
          )}

          {importResult.errors?.length > 0 && (
            <div style={{
              background: '#fef2f2',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'left',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <p style={{ fontWeight: '600', color: '#991b1b', marginBottom: '0.5rem' }}>
                ❌ Erreurs ({importResult.errors.length}):
              </p>
              {importResult.errors.slice(0, 5).map((err, i) => (
                <p key={i} style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                  • {err}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
