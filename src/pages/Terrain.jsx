import React, { useState } from 'react';
import { Navigation, Users, MapPin, Calendar, CheckCircle } from 'lucide-react';

export default function Terrain() {
  const [agents, setAgents] = useState([
    { id: 1, nom: 'Ndiaye Assane', jour: 'Lundi', papCount: 5, distance: '25km', status: 'En cours' },
    { id: 2, nom: 'Ba Mohamed', jour: 'Lundi', papCount: 4, distance: '18km', status: 'Complété' },
    { id: 3, nom: 'Sall Aïssatou', jour: 'Mardi', papCount: 6, distance: '32km', status: 'Planifié' },
  ]);

  const [selectedAgent, setSelectedAgent] = useState(agents[0]);

  const itineraire = [
    { heure: '08:30', pap: 'PAP-001', lieu: 'Dakar Centre', nom: 'Dia Mamadou', action: 'Visite', statut: 'Complété' },
    { heure: '09:15', pap: 'PAP-005', lieu: 'Dakar Centre', nom: 'Ndiaye Aïda', action: 'Signature', statut: 'Complété' },
    { heure: '10:30', pap: 'PAP-012', lieu: 'Thiès', nom: 'Seck Malick', action: 'Évaluation', statut: 'En cours' },
    { heure: '12:00', pap: '-', lieu: 'Thiès', nom: 'Pause déjeuner', action: '-', statut: 'En attente' },
    { heure: '14:00', pap: 'PAP-008', lieu: 'Thiès', nom: 'Fall Ousseynou', action: 'Visite', statut: 'En attente' },
    { heure: '15:30', pap: 'PAP-015', lieu: 'Thiès', nom: 'Niang Fatou', action: 'Signature', statut: 'En attente' },
  ];

  return (
    <div className="page-container">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Navigation size={28} color="#006B3F" />
        Routes & Terrain
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Itinéraire */}
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>PAP du jour</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#006B3F' }}>
                {selectedAgent.papCount}
              </div>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>Distance</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
                {selectedAgent.distance}
              </div>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '0.5rem' }}>Progression</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>60%</div>
            </div>
          </div>

          {/* Barre progression */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '0.75rem' }}>Progression journée</div>
            <div style={{
              width: '100%',
              height: '20px',
              background: '#e0e0e0',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #4caf50 0%, #ff9800 100%)',
                width: '60%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '0.5rem',
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                60%
              </div>
            </div>
          </div>

          {/* Itinéraire détaillé */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#006B3F' }}>📋 Itinéraire - {selectedAgent.jour}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {itineraire.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 80px 1fr 80px 80px',
                    gap: '1rem',
                    padding: '0.75rem',
                    background: item.statut === 'Complété' ? '#f0f8f5' : item.statut === 'En cours' ? '#fffbf0' : '#f5f5f5',
                    borderRadius: '8px',
                    alignItems: 'center',
                    borderLeft: `3px solid ${item.statut === 'Complété' ? '#4caf50' : item.statut === 'En cours' ? '#ff9800' : '#bdbdbd'}`,
                    fontSize: '12px'
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#006B3F' }}>{item.heure}</div>
                  <div style={{ fontWeight: '600' }}>{item.pap}</div>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.nom}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>{item.lieu}</div>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600', textAlign: 'center' }}>{item.action}</div>
                  <div style={{
                    padding: '0.25rem 0.5rem',
                    background: item.statut === 'Complété' ? '#d4edda' : item.statut === 'En cours' ? '#fff3cd' : '#e0e0e0',
                    color: item.statut === 'Complété' ? '#155724' : item.statut === 'En cours' ? '#856404' : '#666',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    {item.statut}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agents */}
        <div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '1rem', color: '#006B3F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} /> Agents Terrain
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {agents.map(agent => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  style={{
                    padding: '1rem',
                    background: selectedAgent.id === agent.id ? '#f0f8f5' : '#f9f9f9',
                    border: `2px solid ${selectedAgent.id === agent.id ? '#006B3F' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {agent.nom}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {agent.jour}
                      </div>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      background: agent.status === 'Complété' ? '#d4edda' : agent.status === 'En cours' ? '#fff3cd' : '#e0e0e0',
                      color: agent.status === 'Complété' ? '#155724' : agent.status === 'En cours' ? '#856404' : '#666',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      {agent.status}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '11px' }}>
                    <div>
                      <div style={{ color: '#666', marginBottom: '0.1rem' }}>PAP</div>
                      <div style={{ fontWeight: '600', color: '#006B3F' }}>{agent.papCount}</div>
                    </div>
                    <div>
                      <div style={{ color: '#666', marginBottom: '0.1rem' }}>Distance</div>
                      <div style={{ fontWeight: '600', color: '#2196f3' }}>{agent.distance}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f8f5', borderRadius: '8px', fontSize: '12px', color: '#2e7d32' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>💡 Optimisation</div>
              <div>
                • Routes calculées<br />
                • Délai moyen: 4.5h<br />
                • Efficacité: 92%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
