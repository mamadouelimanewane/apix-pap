import { useState } from 'react';
import { HandshakeIcon as Handshake, Plus } from 'lucide-react';

export default function Conciliation() {
  const [formData, setFormData] = useState({
    pap_id: '',
    montant_propose: '',
    montant_accepte: '',
    accord: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/conciliations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pap_id: parseInt(formData.pap_id),
          montant_propose: parseInt(formData.montant_propose)
        })
      });
      if (response.ok) {
        alert('Conciliation enregistrée');
        setFormData({ pap_id: '', montant_propose: '', montant_accepte: '', accord: true });
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Handshake size={32} style={{ color: '#006B3F' }} />
          Conciliation (PV)
        </h1>
        <p className="page-subtitle">Enregistrement des accords suite à réunion de conciliation</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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
              <label>Montant Proposé (FCFA) *</label>
              <input
                type="number"
                name="montant_propose"
                value={formData.montant_propose}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Montant Accepté (FCFA)</label>
              <input
                type="number"
                name="montant_accepte"
                value={formData.montant_accepte}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
                <input
                  type="checkbox"
                  name="accord"
                  checked={formData.accord}
                  onChange={handleChange}
                  style={{ width: 'auto', marginBottom: 0 }}
                />
                Accord du PAP
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            <Plus size={18} style={{ marginRight: '8px' }} />
            Enregistrer PV
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '2rem', background: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
        <p style={{ color: '#15803d', fontWeight: '600', marginBottom: '0.5rem' }}>📋 PV Conciliation</p>
        <p style={{ color: '#166534', fontSize: '0.9rem' }}>
          Enregistre les résultats de la réunion de conciliation PAP/APIX.<br/>
          Si accord: statut → Concilié | Si refus: statut → Suspendu
        </p>
      </div>
    </div>
  );
}
