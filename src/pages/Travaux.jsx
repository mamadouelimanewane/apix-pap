import React, { useState, useEffect } from 'react';
import { Hammer, Calendar, AlertCircle, Camera } from 'lucide-react';

export default function Travaux() {
  const [phases, setPhases] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/travaux')
      .then(res => res.json())
      .then(data => {
        setPhases(data.phases || []);
        setIncidents(data.incidents || []);
        setPhotos([...Array(data.photos || 3)].map((_, i) => ({ id: i + 1, date: '20.07.2026', caption: `Photo ${i + 1}` })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement travaux:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Hammer size={28} color="#006B3F" />
        Planning Travaux & Chantier
      </h1>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Phases */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#006B3F' }}>📅 Phases du Projet</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {phases.map(phase => (
              <div key={phase.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{phase.nom}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {phase.datedebut} → {phase.datefin}
                    </div>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: phase.statut === 'Complété' ? '#d4edda' : phase.statut === 'En cours' ? '#fff3cd' : '#e0e0e0',
                    color: phase.statut === 'Complété' ? '#155724' : phase.statut === 'En cours' ? '#856404' : '#666',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {phase.statut}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '24px',
                  background: '#e0e0e0',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    background: phase.statut === 'Complété' ? '#4caf50' : phase.statut === 'En cours' ? '#ff9800' : '#bdbdbd',
                    width: `${phase.progression}%`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    transition: 'width 0.3s'
                  }}>
                    {phase.progression > 10 && `${phase.progression}%`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#006B3F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} /> Incidents & Alertes ({incidents.length})
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Description</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Impact</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(inc => (
                <tr key={inc.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '600' }}>{inc.date}</td>
                  <td style={{ padding: '0.75rem' }}>{inc.type}</td>
                  <td style={{ padding: '0.75rem' }}>{inc.description}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: inc.impact === 'Critique' ? '#f8d7da' : inc.impact === 'Modéré' ? '#fff3cd' : '#d1ecf1',
                      color: inc.impact === 'Critique' ? '#721c24' : inc.impact === 'Modéré' ? '#856404' : '#0c5460',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {inc.impact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Photos */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#006B3F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={20} /> Photos du Chantier ({photos.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {photos.map(photo => (
              <div key={photo.id} style={{
                background: 'linear-gradient(135deg, #e0e0e0, #9e9e9e)',
                borderRadius: '8px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.3s',
                minHeight: '120px',
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ fontSize: '32px', marginBottom: '0.5rem' }}>📸</div>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '0.25rem' }}>
                  {photo.caption}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>
                  {photo.date}
                </div>
              </div>
            ))}
            <div style={{
              background: '#f5f5f5',
              borderRadius: '8px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px dashed #ccc',
              minHeight: '120px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>+</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                Ajouter photo
              </div>
            </div>
          </div>
        </div>

        {/* Notifications PAP */}
        <div style={{ background: '#f0f8f5', padding: '1.5rem', borderRadius: '12px', border: '1px solid #4caf50' }}>
          <h3 style={{ marginBottom: '1rem', color: '#006B3F' }}>📢 Notifications aux PAP</h3>
          <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#2e7d32' }}>
            ✓ Phase actuelle: <strong>Fondations & Structures (50%)</strong><br />
            ✓ Date de fin estimée: <strong>31.10.2026</strong><br />
            ✓ PAP affectés proximité (1km): <strong>15</strong><br />
            ✓ Notification SMS/Email: <strong>Envoyées le 25.07.2026</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
