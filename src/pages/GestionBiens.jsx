import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function GestionBiens() {
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchPap, setSearchPap] = useState('');
  const [paps, setPaps] = useState([]);
  const [selectedPap, setSelectedPap] = useState(null);

  const [formData, setFormData] = useState({
    pap_id: '',
    type_bien: 'Terrain',
    superficie_m2: '',
    localisation: '',
    gps_lat: '',
    gps_lng: ''
  });

  useEffect(() => {
    fetchBiens();
  }, []);

  const fetchBiens = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/biens/list');
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setBiens(data);
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
      const response = await fetch('/api/biens/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        fetchBiens();
        setFormData({
          pap_id: '',
          type_bien: 'Terrain',
          superficie_m2: '',
          localisation: '',
          gps_lat: '',
          gps_lng: ''
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Gestion des Biens</h1>
          <p className="page-subtitle">Enregistrement et localisation des propriétés affectées</p>
        </div>
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
          <Plus size={20} />
          Ajouter bien
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>Ajouter un bien</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>PAP *</label>
                <input
                  type="text"
                  placeholder="Code PAP ou nom..."
                  value={searchPap}
                  onChange={(e) => setSearchPap(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Type de bien *</label>
                <select name="type_bien" value={formData.type_bien} onChange={handleChange}>
                  <option value="Terrain">Terrain</option>
                  <option value="Maison">Maison</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Cultures">Cultures</option>
                  <option value="Arbre">Arbre</option>
                </select>
              </div>
              <div className="form-group">
                <label>Superficie (m²) *</label>
                <input
                  type="number"
                  name="superficie_m2"
                  value={formData.superficie_m2}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Localisation</label>
                <input
                  type="text"
                  name="localisation"
                  value={formData.localisation}
                  onChange={handleChange}
                  placeholder="Rue, quartier..."
                />
              </div>
              <div className="form-group">
                <label>Latitude GPS</label>
                <input
                  type="number"
                  name="gps_lat"
                  value={formData.gps_lat}
                  onChange={handleChange}
                  step="0.0001"
                  placeholder="14.7167"
                />
              </div>
              <div className="form-group">
                <label>Longitude GPS</label>
                <input
                  type="number"
                  name="gps_lng"
                  value={formData.gps_lng}
                  onChange={handleChange}
                  step="0.0001"
                  placeholder="-17.4667"
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
                Créer bien
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

      {/* Tableau biens */}
      <div className="card">
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Chargement...</p>
        ) : biens.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Aucun bien enregistré</p>
        ) : (
          <table style={{ width: '100%', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Code Bien</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>PAP</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Type</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Superficie</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Montant Initial</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {biens.map((bien) => (
                <tr key={bien.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#006B3F' }}>{bien.code_bien}</td>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{bien.pap_nom} {bien.pap_prenom}</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{bien.code_pap}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{bien.type_bien}</td>
                  <td style={{ padding: '1rem' }}>{bien.superficie_m2} m²</td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>
                    {bien.montant_initial ? `${(bien.montant_initial / 1000000).toFixed(1)}M FCFA` : '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => console.log('Delete', bien.id)}
                      style={{
                        padding: '6px',
                        color: '#ef4444',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Carte Interactive */}
      <div className="card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={20} style={{ color: '#0284c7' }} />
          Localisation des Biens (Carte Interactive)
        </h3>
        {biens.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px' }}>
            <p>Enregistrez des biens avec coordonnées GPS pour les voir sur la carte</p>
          </div>
        ) : (
          <MapContainer center={[14.7167, -17.4667]} zoom={12} style={{ height: '500px', borderRadius: '8px', marginBottom: '1rem' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {biens.map((bien) => {
              if (bien.gps_lat && bien.gps_lng) {
                return (
                  <Marker key={bien.id} position={[parseFloat(bien.gps_lat), parseFloat(bien.gps_lng)]}>
                    <Popup>
                      <div style={{ fontSize: '0.9rem', minWidth: '200px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#006B3F' }}>
                          {bien.code_bien}
                        </div>
                        <div style={{ marginBottom: '0.3rem' }}>
                          <strong>Type:</strong> {bien.type_bien}
                        </div>
                        <div style={{ marginBottom: '0.3rem' }}>
                          <strong>Superficie:</strong> {bien.superficie_m2} m²
                        </div>
                        <div style={{ marginBottom: '0.3rem' }}>
                          <strong>PAP:</strong> {bien.pap_nom} {bien.pap_prenom}
                        </div>
                        <div style={{ marginBottom: '0.3rem' }}>
                          <strong>Montant:</strong> {bien.montant_initial ? `${(bien.montant_initial / 1000000).toFixed(1)}M FCFA` : '-'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                          {bien.gps_lat}, {bien.gps_lng}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
          </MapContainer>
        )}
        <div style={{ fontSize: '0.85rem', color: '#64748b', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          📍 Cliquez sur les marqueurs pour voir les détails des biens | {biens.filter(b => b.gps_lat && b.gps_lng).length} biens avec coordonnées GPS
        </div>
      </div>
    </div>
  );
}
