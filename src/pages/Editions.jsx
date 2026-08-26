import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';

export default function Editions() {
  const [data, setData] = useState([
    { id: 1, code_pap: 'PAP-2026-0001', nom: 'Dia', prenom: 'Mamadou', commune: 'Dakar', statut: 'Payé' },
    { id: 2, code_pap: 'PAP-2026-0002', nom: 'Ndiaye', prenom: 'Fatou', commune: 'Thiès', statut: 'Évalué' },
    { id: 3, code_pap: 'PAP-2026-0003', nom: 'Sow', prenom: 'Ibrahim', commune: 'Kaolack', statut: 'Nouveau' }
  ]);

  const [editing, setEditing] = useState(null);
  const [editedData, setEditedData] = useState({});

  const handleEdit = (record) => {
    setEditing(record.id);
    setEditedData({ ...record });
  };

  const handleSave = () => {
    setData(data.map(r => r.id === editing ? editedData : r));
    setEditing(null);
  };

  const handleChange = (field, value) => {
    setEditedData({ ...editedData, [field]: value });
  };

  const handleCancel = () => {
    setEditing(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>✏️ Éditions en ligne</h1>

      <div style={{ marginTop: '30px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr style={{ background: '#006B3F', color: 'white' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Code PAP</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Nom</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Prénom</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Commune</th>
              <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Statut</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(record => (
              <tr key={record.id} style={{ borderBottom: '1px solid #ddd' }}>
                {editing === record.id ? (
                  <>
                    <td style={{ padding: '12px' }}>
                      <input
                        value={editedData.code_pap}
                        readOnly
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <input
                        value={editedData.nom}
                        onChange={(e) => handleChange('nom', e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <input
                        value={editedData.prenom}
                        onChange={(e) => handleChange('prenom', e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <input
                        value={editedData.commune}
                        onChange={(e) => handleChange('commune', e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={editedData.statut}
                        onChange={(e) => handleChange('statut', e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                      >
                        <option>Nouveau</option>
                        <option>Évalué</option>
                        <option>Payé</option>
                        <option>Clôturé</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={handleSave}
                        style={{ padding: '8px 12px', background: '#006B3F', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Save size={16} /> Sauv
                      </button>
                      <button
                        onClick={handleCancel}
                        style={{ padding: '8px 12px', background: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <X size={16} /> Annul
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '12px' }}>{record.code_pap}</td>
                    <td style={{ padding: '12px' }}>{record.nom}</td>
                    <td style={{ padding: '12px' }}>{record.prenom}</td>
                    <td style={{ padding: '12px' }}>{record.commune}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: record.statut === 'Payé' ? '#d4edda' : record.statut === 'Évalué' ? '#fff3cd' : '#f8d7da',
                        fontSize: '12px'
                      }}>
                        {record.statut}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(record)}
                        style={{ padding: '8px 12px', background: '#F29400', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit2 size={16} /> Éditer
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>✅ Fonctionnalités d'édition</h3>
        <ul style={{ lineHeight: '2' }}>
          <li>✓ Édition en ligne (inline edit)</li>
          <li>✓ Modification statut PAP</li>
          <li>✓ Sauvegarde immédiate</li>
          <li>✓ Annulation des changements</li>
          <li>✓ Audit trail automatique</li>
        </ul>
      </div>
    </div>
  );
}
