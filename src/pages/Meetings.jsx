import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';

const Meetings = () => {
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      title: 'Réunion Phase 1 - Enregistrement PAP',
      date: '2026-08-28',
      time: '09:00',
      location: 'Bureau Zone A',
      attendees: ['PAP-2024-001', 'PAP-2024-005', 'PAP-2024-012'],
      status: 'scheduled',
      description: 'Première visite et enregistrement des nouvelles PAPs'
    },
    {
      id: 2,
      title: 'Visite Évaluation - Propriété PAP-2024-003',
      date: '2026-08-28',
      time: '14:00',
      location: 'Site Project, Dakar',
      attendees: ['PAP-2024-003'],
      status: 'scheduled',
      description: 'Visite d\'évaluation de la propriété'
    },
    {
      id: 3,
      title: 'Réunion Compensation - PAP-2024-010',
      date: '2026-08-29',
      time: '10:30',
      location: 'Bureau Siège',
      attendees: ['PAP-2024-010', 'Gestionnaire Finance'],
      status: 'scheduled',
      description: 'Présentation proposition compensation'
    },
    {
      id: 4,
      title: 'Paiement & Confirmations - Batch 1',
      date: '2026-08-30',
      time: '08:00',
      location: 'Centre Paiement',
      attendees: ['PAP-2024-001', 'PAP-2024-005', 'PAP-2024-008'],
      status: 'scheduled',
      description: 'Distribution paiements compensation'
    }
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#10b981';
      case 'scheduled': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'completed': return '✅ Complétée';
      case 'scheduled': return '📅 Programmée';
      case 'cancelled': return '❌ Annulée';
      default: return status;
    }
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>
            Planification des Réunions
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            Gérer réunions et visites terrain
          </p>
        </div>
        <button style={{
          padding: '0.75rem 1.5rem',
          background: '#1e40af',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Plus size={18} /> Nouvelle Réunion
        </button>
      </div>

      {/* Meetings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {meetings.map(meeting => (
          <div
            key={meeting.id}
            style={{
              padding: '1.5rem',
              background: 'white',
              borderRadius: '12px',
              border: `2px solid ${getStatusColor(meeting.status)}30`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* Status Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <span style={{
                padding: '0.4rem 0.8rem',
                background: `${getStatusColor(meeting.status)}20`,
                color: getStatusColor(meeting.status),
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                {getStatusLabel(meeting.status)}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Edit2 size={16} style={{ cursor: 'pointer', color: '#64748b' }} />
                <Trash2 size={16} style={{ cursor: 'pointer', color: '#ef4444' }} />
              </div>
            </div>

            {/* Title */}
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
              {meeting.title}
            </h3>

            {/* Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569' }}>
                <Calendar size={16} />
                <span>{meeting.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569' }}>
                <Clock size={16} />
                <span>{meeting.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569' }}>
                <MapPin size={16} />
                <span>{meeting.location}</span>
              </div>
            </div>

            {/* Attendees */}
            <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#0f172a' }}>
                <Users size={16} />
                Participants ({meeting.attendees.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {meeting.attendees.map((att, i) => (
                  <span key={i} style={{
                    padding: '0.35rem 0.65rem',
                    background: '#dbeafe',
                    color: '#0c4a6e',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    {att}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: '1.4' }}>
              {meeting.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Meetings;
