import { useState } from 'react';
import { Bell, Clock, AlertCircle, CheckCircle, Settings } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'sla', title: 'SLA Approchant', message: 'PAP-2026-0001 - 5 jours avant deadline', date: 'Aujourd\'hui 10:30', read: false },
    { id: 2, type: 'success', title: 'Paiement Confirmé', message: 'PAP-2026-0002 payé avec succès', date: 'Aujourd\'hui 09:15', read: false },
    { id: 3, type: 'alert', title: 'Anomalie Détectée', message: 'PAP-2026-0003 - Doublon téléphone détecté', date: 'Hier 14:20', read: true }
  ]);

  const [settings, setSettings] = useState({
    slaAlerts: true,
    paymentNotifs: true,
    emailNotifs: true,
    smsNotifs: false
  });

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'sla': return <AlertCircle size={20} style={{ color: '#FCD116' }} />;
      case 'success': return <CheckCircle size={20} style={{ color: '#006B3F' }} />;
      case 'alert': return <AlertCircle size={20} style={{ color: '#E31B23' }} />;
      default: return <Bell size={20} />;
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>🔔 Notifications en Temps Réel</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '30px' }}>
        {/* Notifications List */}
        <div>
          <h3 style={{ marginBottom: '15px' }}>Notifications ({notifications.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: notif.read ? '#f9f9f9' : '#f0f8f5',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  opacity: notif.read ? 0.6 : 1
                }}
              >
                <div>{getIcon(notif.type)}</div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '14px' }}>{notif.title}</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>{notif.message}</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#999' }}>
                    <Clock size={12} style={{ marginRight: '4px' }} />
                    {notif.date}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                  style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div>
          <h3 style={{ marginBottom: '15px' }}>Préférences</h3>
          <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {Object.entries(settings).map(([key, value]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '14px' }}>
                  {key === 'slaAlerts' && 'Alertes SLA'}
                  {key === 'paymentNotifs' && 'Notifications Paiements'}
                  {key === 'emailNotifs' && 'Notifications Email'}
                  {key === 'smsNotifs' && 'Notifications SMS'}
                </span>
              </label>
            ))}

            <button style={{
              marginTop: '15px',
              padding: '10px',
              background: '#006B3F',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <Settings size={16} /> Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
