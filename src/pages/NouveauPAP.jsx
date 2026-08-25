import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NouveauPAP() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projet_id: 1,
    nom: '',
    prenom: '',
    telephone: '',
    commune: 'Dakar',
    region: 'Dakar',
    adresse_detail: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/pap/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/pap/${data.pap.code_pap}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Identité' },
    { num: 2, label: 'Adresse' },
    { num: 3, label: 'Confirmation' }
  ];

  return (
    <div>
      <button
        onClick={() => navigate('/registre')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#006B3F', fontWeight: '600' }}
      >
        <ArrowLeft size={20} />
        Retour au Registre
      </button>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 className="page-title">Créer une nouvelle PAP</h1>
        <p className="page-subtitle">Remplissez le formulaire pour enregistrer une personne affectée par le projet</p>

        {/* Progress Bar */}
        <div style={{ marginBottom: '3rem', display: 'flex', gap: '1rem' }}>
          {steps.map(s => (
            <div key={s.num} style={{ flex: 1 }}>
              <div style={{
                background: step >= s.num ? '#006B3F' : '#e2e8f0',
                color: 'white',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                {s.num}
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>Identité</h2>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="77..."
                  required
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>Adresse</h2>
              <div className="form-group">
                <label>Région *</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                >
                  <option value="Dakar">Dakar</option>
                  <option value="Thiès">Thiès</option>
                  <option value="Kaolack">Kaolack</option>
                  <option value="Kaffrine">Kaffrine</option>
                </select>
              </div>
              <div className="form-group">
                <label>Commune *</label>
                <select
                  name="commune"
                  value={formData.commune}
                  onChange={handleChange}
                  required
                >
                  <option value="Dakar">Dakar</option>
                  <option value="Pikine">Pikine</option>
                  <option value="Guédiawaye">Guédiawaye</option>
                  <option value="Rufisque">Rufisque</option>
                </select>
              </div>
              <div className="form-group">
                <label>Adresse détaillée</label>
                <textarea
                  name="adresse_detail"
                  value={formData.adresse_detail}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Rue, quartier, landmarks..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>Confirmation</h2>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p><strong>Nom:</strong> {formData.nom} {formData.prenom}</p>
                <p><strong>Téléphone:</strong> {formData.telephone}</p>
                <p><strong>Commune:</strong> {formData.commune}</p>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '1rem' }}>
                  Un code PAP unique sera généré automatiquement après soumission.
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Précédent
              </button>
            )}
            {step < 3 && (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && formData.nom && formData.prenom && formData.telephone) {
                    setStep(step + 1);
                  } else if (step === 2) {
                    setStep(step + 1);
                  }
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Suivant
              </button>
            )}
            {step === 3 && (
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Création...' : 'Créer PAP'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
