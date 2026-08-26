import { useState } from 'react';
import { Download, Upload, Clock, HardDrive } from 'lucide-react';

export default function Backup() {
  const [backups, setBackups] = useState([
    { id: 1, date: '26/08/2026 14:30', size: '45.2 MB', status: 'Complété' },
    { id: 2, date: '25/08/2026 14:30', size: '44.8 MB', status: 'Complété' },
    { id: 3, date: '24/08/2026 14:30', size: '44.5 MB', status: 'Complété' }
  ]);

  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFreq, setBackupFreq] = useState('daily');

  const handleBackup = () => {
    const newBackup = {
      id: backups.length + 1,
      date: new Date().toLocaleString('fr-FR'),
      size: '46.1 MB',
      status: 'Complété'
    };
    setBackups([newBackup, ...backups]);
    alert('✅ Sauvegarde créée avec succès !');
  };

  const downloadBackup = (id) => {
    alert(`📥 Téléchargement de la sauvegarde #${id}...`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>💾 Sauvegarde & Restauration</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
        {/* Sauvegarde */}
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Créer une Sauvegarde</h2>

          <button
            onClick={handleBackup}
            style={{
              width: '100%',
              padding: '20px',
              background: '#006B3F',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            <Download size={20} /> Sauvegarder Maintenant
          </button>

          <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Sauvegarde Automatique</h3>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoBackup}
                onChange={(e) => setAutoBackup(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Activer les sauvegardes automatiques</span>
            </label>

            {autoBackup && (
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>
                  Fréquence:
                  <select
                    value={backupFreq}
                    onChange={(e) => setBackupFreq(e.target.value)}
                    style={{
                      marginLeft: '10px',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                  </select>
                </label>
              </div>
            )}

            <p style={{ fontSize: '12px', color: '#666', margin: '15px 0 0 0' }}>
              ✓ Dernier backup: Aujourd'hui 14:30
            </p>
          </div>
        </div>

        {/* Historique */}
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Historique des Sauvegardes</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {backups.map(backup => (
              <div
                key={backup.id}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <HardDrive size={20} style={{ color: '#006B3F' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{backup.date}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {backup.size} • {backup.status}
                  </div>
                </div>
                <button
                  onClick={() => downloadBackup(backup.id)}
                  style={{
                    padding: '8px 12px',
                    background: '#F29400',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px'
                  }}
                >
                  <Upload size={14} /> Télécharger
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '15px', background: '#f0f8f5', borderRadius: '8px', fontSize: '13px' }}>
            <Clock size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Espace utilisé: 45.2 MB / 1 GB
          </div>
        </div>
      </div>
    </div>
  );
}
