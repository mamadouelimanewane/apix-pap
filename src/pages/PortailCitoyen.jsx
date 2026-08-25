import { useState } from 'react';
import { Globe, Search, MessageSquare } from 'lucide-react';

export default function PortailCitoyen() {
  const [searchCode, setSearchCode] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searched, setSearched] = useState(false);
  const [dossier] = useState({
    code_pap: 'PAP-2026-0001',
    nom: 'Diallo Ousmane',
    statut: 'Payé',
    montant_valide: 10000000,
    montant_paye: 10000000,
    commune: 'Dakar'
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
  };

  const timeline = [
    { step: 'Nouveau', statut: true, date: '15/08/2026' },
    { step: 'Recensé', statut: true, date: '16/08/2026' },
    { step: 'Fiabilisé', statut: true, date: '17/08/2026' },
    { step: 'Évalué', statut: true, date: '18/08/2026' },
    { step: 'Concilié', statut: true, date: '20/08/2026' },
    { step: 'Payé', statut: true, date: '25/08/2026' },
    { step: 'Clôturé', statut: false, date: '-' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #006B3F 0%, #009639 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Globe size={48} style={{ color: '#F29400' }} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Portail Citoyen APIX-PAP
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            Suivi de votre dossier sans connexion
          </p>
        </div>

        {!searched ? (
          // Formulaire recherche
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <form onSubmit={handleSearch}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
                  Code PAP *
                </label>
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Ex: PAP-2026-0001"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
                  4 derniers chiffres du téléphone *
                </label>
                <input
                  type="text"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="Ex: 6789"
                  maxLength="4"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#006B3F',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Search size={20} />
                Consulter mon dossier
              </button>
            </form>
          </div>
        ) : (
          // Résultat dossier
          <div>
            {/* Info PAP */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem', color: '#006B3F' }}>
                Dossier: {dossier.code_pap}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Titulaire</p>
                  <p style={{ fontWeight: '600', fontSize: '1rem' }}>{dossier.nom}</p>
                </div>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Commune</p>
                  <p style={{ fontWeight: '600', fontSize: '1rem' }}>{dossier.commune}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Montant Validé</p>
                  <p style={{ fontWeight: '700', fontSize: '1.2rem', color: '#006B3F' }}>
                    {(dossier.montant_valide / 1000000).toFixed(1)}M FCFA
                  </p>
                </div>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Montant Payé</p>
                  <p style={{ fontWeight: '700', fontSize: '1.2rem', color: '#10b981' }}>
                    {(dossier.montant_paye / 1000000).toFixed(1)}M FCFA
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', color: '#0f172a' }}>
                Progression de votre dossier
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {timeline.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: item.statut ? '#10b981' : '#e2e8f0',
                      border: '2px solid ' + (item.statut ? '#10b981' : '#cbd5e1'),
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontWeight: '600',
                        color: item.statut ? '#0f172a' : '#94a3b8',
                        marginBottom: '0.25rem'
                      }}>
                        {item.step}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <MessageSquare size={24} style={{ color: '#006B3F' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                  Contacter le support
                </h3>
              </div>
              <p style={{ color: '#475569', marginBottom: '1rem' }}>
                Pour toute question ou réclamation sur votre dossier:
              </p>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ color: '#0f172a', fontWeight: '600' }}>📞 Téléphone: +221 33 XXXX XXXX</p>
                <p style={{ color: '#0f172a', fontWeight: '600' }}>📧 Email: support@apix-pap.sn</p>
              </div>
            </div>

            <button
              onClick={() => {
                setSearched(false);
                setSearchCode('');
                setSearchPhone('');
              }}
              style={{
                marginTop: '2rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Nouvelle recherche
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', marginTop: '3rem', fontSize: '0.9rem' }}>
          <p>© 2026 APIX Sénégal — Plateforme de Gestion des PAP</p>
        </div>
      </div>
    </div>
  );
}
