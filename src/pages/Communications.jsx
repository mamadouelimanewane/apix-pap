import React, { useState } from 'react';
import { MessageSquare, Send, Archive, Trash2, Search, Plus } from 'lucide-react';

const Communications = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, from: 'PAP-2024-001', subject: 'Demande d\'information', date: '2026-08-27', read: false, preview: 'Concernant le dossier de compensation...' },
    { id: 2, from: 'PAP-2024-002', subject: 'Confirmation de RDV', date: '2026-08-26', read: true, preview: 'Confirme la présence pour le 28/08' },
    { id: 3, from: 'Équipe Admin', subject: 'Mise à jour système', date: '2026-08-25', read: true, preview: 'Nouvelle version disponible demain' },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'bottleneck', title: 'Goulot étranglement détecté', message: 'Phase 3 ralentit (45 dossiers en attente)', priority: 'high', date: '2026-08-27' },
    { id: 2, type: 'sla', title: 'SLA violée', message: 'PAP-2024-010 dépasse le délai de 5 jours', priority: 'high', date: '2026-08-27' },
    { id: 3, type: 'quality', title: 'Baisse qualité', message: 'Taux validation réduit à 78%', priority: 'medium', date: '2026-08-26' },
  ]);

  const filteredMessages = messages.filter(m =>
    m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.from.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>
          Communication & Collaboration
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Gérer messages, notifications et alertes
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('messages')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'messages' ? '#1e40af' : 'transparent',
            color: activeTab === 'messages' ? 'white' : '#64748b',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          <MessageSquare size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
          Messages ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'notifications' ? '#1e40af' : 'transparent',
            color: activeTab === 'notifications' ? 'white' : '#64748b',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          🔔 Alertes ({notifications.length})
        </button>
      </div>

      {/* Messages Section */}
      {activeTab === 'messages' && (
        <div>
          {/* Search & Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '0.75rem', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Rechercher messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
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
              <Plus size={18} /> Nouveau
            </button>
          </div>

          {/* Messages List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  padding: '1rem',
                  background: msg.read ? 'white' : '#f0f9ff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontWeight: msg.read ? '600' : '800', color: '#0f172a' }}>
                      {msg.subject}
                    </h3>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                      De: <strong>{msg.from}</strong>
                    </p>
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
                      {msg.preview}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                      {msg.date}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Archive size={16} style={{ cursor: 'pointer', color: '#64748b' }} />
                      <Trash2 size={16} style={{ cursor: 'pointer', color: '#ef4444' }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications Section */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(notif => (
            <div
              key={notif.id}
              style={{
                padding: '1.25rem',
                background: 'white',
                borderLeft: `4px solid ${notif.priority === 'high' ? '#ef4444' : '#f59e0b'}`,
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '700', color: '#0f172a' }}>
                    {notif.title}
                  </h3>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>
                    {notif.message}
                  </p>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                    {notif.date}
                  </p>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  background: notif.priority === 'high' ? '#fee2e2' : '#fef3c7',
                  color: notif.priority === 'high' ? '#991b1b' : '#92400e',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {notif.priority === 'high' ? '🔴 Critique' : '🟡 Normal'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Communications;
