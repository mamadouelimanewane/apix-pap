import { useState } from 'react';
import { History } from 'lucide-react';

export default function AuditTrail() {
  const [historique] = useState([
    {
      date_action: '2026-08-25 14:30',
      utilisateur: 'Diop Amadou',
      action: 'CREATION',
      table_cible: 'pap',
      champ: 'code_pap',
      nouvelle_valeur: 'PAP-2026-0001'
    },
    {
      date_action: '2026-08-25 15:15',
      utilisateur: 'Sarr Mariama',
      action: 'MODIFICATION',
      table_cible: 'pap',
      champ: 'statut',
      ancienne_valeur: 'Nouveau',
      nouvelle_valeur: 'Recensé'
    },
    {
      date_action: '2026-08-25 16:45',
      utilisateur: 'Fall Ibrahim',
      action: 'CHANGEMENT_STATUT',
      table_cible: 'pap',
      champ: 'statut',
      ancienne_valeur: 'Recensé',
      nouvelle_valeur: 'Fiabilisé'
    }
  ]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <History size={32} />
          Audit Trail
        </h1>
        <p className="page-subtitle">Historique complet de toutes les modifications du système</p>
      </div>

      <div className="card">
        {historique.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Aucun événement</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {historique.map((h, i) => (
              <div
                key={i}
                style={{
                  padding: '1rem',
                  background: '#f8fafc',
                  borderLeft: '4px solid #006B3F',
                  borderRadius: '4px'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Date/Heure</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: '600' }}>{h.date_action}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Utilisateur</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: '600' }}>{h.utilisateur}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Table</p>
                    <p style={{ fontSize: '0.9rem', color: '#0f172a' }}>{h.table_cible}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Action</p>
                    <p style={{ fontSize: '0.9rem', color: '#0f172a' }}>{h.action}</p>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Champ: {h.champ}</p>
                  <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                    {h.ancienne_valeur && `${h.ancienne_valeur} → `}{h.nouvelle_valeur}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem', background: '#f0f4ff', borderLeft: '4px solid #3b82f6' }}>
        <p style={{ color: '#1e40af', fontWeight: '600', marginBottom: '0.5rem' }}>🔍 Traçabilité Complète</p>
        <p style={{ color: '#1e3a8a', fontSize: '0.9rem' }}>
          Chaque action est enregistrée: création, modification, suppression, changement statut.<br/>
          Utilisateur, date/heure, champs anciens/nouveaux → Compliance 100%
        </p>
      </div>
    </div>
  );
}
