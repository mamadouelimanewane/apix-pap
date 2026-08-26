import { useState } from 'react';
import { Webhook, Plus, Trash2, Copy, Check } from 'lucide-react';

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState([
    { id: 1, url: 'https://api.externe.sn/pap-updated', event: 'PAP Updated', status: 'Active', lastCall: 'Aujourd\'hui 10:30' },
    { id: 2, url: 'https://api.banking.sn/payments', event: 'Payment Confirmed', status: 'Active', lastCall: 'Aujourd\'hui 09:45' },
    { id: 3, url: 'https://alerts.sn/webhook', event: 'SLA Alert', status: 'Inactive', lastCall: 'Hier 14:20' }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ url: '', event: 'PAP Updated' });
  const [copied, setCopied] = useState(null);

  const handleAdd = () => {
    if (newWebhook.url) {
      setWebhooks([...webhooks, {
        id: webhooks.length + 1,
        ...newWebhook,
        status: 'Active',
        lastCall: 'Jamais'
      }]);
      setNewWebhook({ url: '', event: 'PAP Updated' });
      setShowForm(false);
      alert('✅ Webhook ajouté !');
    }
  };

  const handleDelete = (id) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const events = [
    'PAP Updated',
    'Payment Confirmed',
    'SLA Alert',
    'Document Uploaded',
    'Complaint Created',
    'Status Changed'
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🪝 Webhooks & Intégrations</h1>

      <div style={{ marginTop: '30px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '12px 20px',
            background: '#006B3F',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}
        >
          <Plus size={18} /> Ajouter un Webhook
        </button>

        {showForm && (
          <div style={{
            padding: '20px',
            background: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                URL du Webhook
              </label>
              <input
                type="url"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://api.exemple.com/webhook"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                Événement
              </label>
              <select
                value={newWebhook.event}
                onChange={(e) => setNewWebhook({ ...newWebhook, event: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                {events.map(event => (
                  <option key={event} value={event}>{event}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAdd}
              style={{
                padding: '10px 20px',
                background: '#006B3F',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Créer
            </button>

            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: '10px 20px',
                background: '#ccc',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Annuler
            </button>
          </div>
        )}

        {/* Webhooks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {webhooks.map(webhook => (
            <div
              key={webhook.id}
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Webhook size={18} style={{ color: '#006B3F' }} />
                    {webhook.event}
                  </h3>
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#666' }}>
                    Dernier appel: {webhook.lastCall}
                  </p>
                </div>
                <span style={{
                  padding: '6px 12px',
                  background: webhook.status === 'Active' ? '#d4edda' : '#f8d7da',
                  color: webhook.status === 'Active' ? '#155724' : '#721c24',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {webhook.status}
                </span>
              </div>

              <div style={{
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px',
                fontFamily: 'monospace',
                fontSize: '12px',
                overflow: 'auto'
              }}>
                <span style={{ flex: 1 }}>{webhook.url}</span>
                <button
                  onClick={() => copyToClipboard(webhook.url, webhook.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#006B3F',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copied === webhook.id ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{
                  padding: '8px 16px',
                  background: '#F29400',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>
                  Tester
                </button>
                <button
                  onClick={() => handleDelete(webhook.id)}
                  style={{
                    padding: '8px 16px',
                    background: '#E31B23',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '30px', padding: '20px', background: '#f0f8f5', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>📋 Événements Disponibles</h3>
          <ul style={{ columnCount: 2, lineHeight: '2' }}>
            {events.map(event => (
              <li key={event} style={{ fontSize: '13px' }}>{event}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
