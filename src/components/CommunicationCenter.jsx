// Centre de Communications - Messages & Notifications
import React, { useEffect, useState } from 'react';
import {
  MessageCircle, Bell, Send, Search, Pin, Star, Archive,
  AlertCircle, CheckCircle, Clock, Filter, X, Paperclip
} from 'lucide-react';

export default function CommunicationCenter() {
  const [activeTab, setActiveTab] = useState('messages'); // messages, notifications
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunications();
    const interval = setInterval(loadCommunications, 30000); // Refresh 30s
    return () => clearInterval(interval);
  }, []);

  const loadCommunications = async () => {
    try {
      const [messagesRes, notificationsRes] = await Promise.all([
        fetch('/api/communications/messages'),
        fetch('/api/communications/notifications')
      ]);

      const messagesData = await messagesRes.json();
      const notificationsData = await notificationsRes.json();

      setMessages(messagesData.messages);
      setNotifications(notificationsData.notifications);
    } catch (error) {
      console.error('Erreur chargement communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(m => {
    if (searchQuery && !m.subject.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterPriority !== 'ALL' && m.priority !== filterPriority) {
      return false;
    }
    return true;
  });

  const filteredNotifications = notifications.filter(n => {
    if (filterPriority !== 'ALL' && n.severity !== filterPriority) {
      return false;
    }
    return true;
  });

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">💬 Centre de Communications</h1>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            🔴 {notifications.filter(n => !n.read).length} alertes
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Messages */}
        <div className="w-80 bg-white border-r flex flex-col overflow-hidden">
          {/* Tab Selection */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-3 text-center font-semibold ${
                activeTab === 'messages'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <MessageCircle className="w-5 h-5 inline mr-2" />
              Messages
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-3 text-center font-semibold ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <Bell className="w-5 h-5 inline mr-2" />
              Alertes
            </button>
          </div>

          {/* Search & Filter */}
          <div className="p-4 border-b space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded"
              />
            </div>

            {activeTab === 'messages' && (
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="ALL">Toutes priorités</option>
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
                <option value="URGENT">Urgente</option>
              </select>
            )}
          </div>

          {/* Message/Notification List */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'messages' && filteredMessages.map(msg => (
              <MessageItem
                key={msg.id}
                message={msg}
                selected={selectedThread?.id === msg.id}
                onSelect={() => setSelectedThread(msg)}
              />
            ))}

            {activeTab === 'notifications' && filteredNotifications.map(notif => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                selected={selectedThread?.id === notif.id}
                onSelect={() => setSelectedThread(notif)}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedThread ? (
            <>
              {activeTab === 'messages' ? (
                <MessageThreadView
                  thread={selectedThread}
                  onClose={() => setSelectedThread(null)}
                  onRefresh={loadCommunications}
                />
              ) : (
                <NotificationDetailView
                  notification={selectedThread}
                  onClose={() => setSelectedThread(null)}
                  onRefresh={loadCommunications}
                />
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                {activeTab === 'messages' ? (
                  <>
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez un message pour commencer</p>
                  </>
                ) : (
                  <>
                    <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez une alerte pour voir les détails</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MESSAGE ITEM
// ============================================================================

function MessageItem({ message, selected, onSelect }) {
  const priorityColor = {
    'LOW': 'text-gray-500',
    'MEDIUM': 'text-yellow-600',
    'HIGH': 'text-orange-600',
    'URGENT': 'text-red-600'
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 border-b hover:bg-gray-50 transition ${
        selected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-semibold text-gray-900 flex-1 ${!message.read ? 'font-bold' : ''}`}>
          {!message.read && <span className="w-2 h-2 bg-blue-600 rounded-full inline-block mr-2"></span>}
          {message.subject}
        </h3>
        <span className={`text-xs font-semibold ${priorityColor[message.priority]}`}>
          {message.priority}
        </span>
      </div>

      <p className="text-sm text-gray-600 truncate mb-2">{message.from}</p>
      <p className="text-xs text-gray-500">
        {new Date(message.createdAt).toLocaleString('fr-FR')}
      </p>
    </button>
  );
}

// ============================================================================
// NOTIFICATION ITEM
// ============================================================================

function NotificationItem({ notification, selected, onSelect }) {
  const severityColor = {
    'CRITICAL': 'border-red-500 bg-red-50 text-red-900',
    'HIGH': 'border-orange-500 bg-orange-50 text-orange-900',
    'MEDIUM': 'border-yellow-500 bg-yellow-50 text-yellow-900',
    'LOW': 'border-blue-500 bg-blue-50 text-blue-900'
  };

  const severityIcon = {
    'CRITICAL': '⛔',
    'HIGH': '⚠️',
    'MEDIUM': '⚡',
    'LOW': 'ℹ️'
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 border-b border-l-4 hover:bg-gray-50 transition ${
        severityColor[notification.severity]
      } ${selected ? 'ring-2 ring-blue-600' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold flex-1">
          {severityIcon[notification.severity]} {notification.type}
        </h3>
        {!notification.read && (
          <span className="w-2 h-2 bg-red-600 rounded-full"></span>
        )}
      </div>

      <p className="text-sm mb-2">{notification.message}</p>
      <p className="text-xs opacity-70">
        {new Date(notification.createdAt).toLocaleString('fr-FR')}
      </p>
    </button>
  );
}

// ============================================================================
// MESSAGE THREAD VIEW
// ============================================================================

function MessageThreadView({ thread, onClose, onRefresh }) {
  const [replyText, setReplyText] = useState('');
  const [threadMessages, setThreadMessages] = useState([thread]);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/api/communications/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: thread.threadId,
          body: replyText,
          attachments
        })
      });

      if (response.ok) {
        setReplyText('');
        setAttachments([]);
        onRefresh();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{thread.subject}</h2>
          <p className="text-sm text-gray-600 mt-1">De: {thread.from}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {threadMessages.map((msg, idx) => (
          <div key={idx} className={`p-4 rounded-lg ${
            msg.from === 'ME' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold text-gray-900">{msg.from}</p>
              <p className="text-xs text-gray-500">
                {new Date(msg.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>
            <p className="text-gray-800 text-sm">{msg.body}</p>
            {msg.attachments?.length > 0 && (
              <div className="mt-3 flex gap-2">
                {msg.attachments.map(att => (
                  <a
                    key={att.id}
                    href={att.url}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <Paperclip className="w-4 h-4" />
                    {att.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reply Form */}
      <div className="bg-white border-t p-4">
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Votre réponse..."
          className="w-full p-3 border rounded resize-none"
          rows="4"
        />

        <div className="flex justify-between items-center mt-3">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            onClick={handleSendReply}
            disabled={sending || !replyText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NOTIFICATION DETAIL VIEW
// ============================================================================

function NotificationDetailView({ notification, onClose, onRefresh }) {
  const [actionTaken, setActionTaken] = useState(false);

  const handleAction = async (action) => {
    const response = await fetch(`/api/communications/notifications/${notification.id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });

    if (response.ok) {
      setActionTaken(true);
      onRefresh();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-6 flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-2xl font-bold text-gray-900">{notification.type}</h2>
            <span className={`px-3 py-1 rounded text-sm font-semibold ${
              notification.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
              notification.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {notification.severity}
            </span>
          </div>
          <p className="text-gray-600">{notification.message}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-3">Détails de l'alerte</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Type:</span> {notification.type}</p>
            <p><span className="font-semibold">Sévérité:</span> {notification.severity}</p>
            <p><span className="font-semibold">Date:</span> {new Date(notification.createdAt).toLocaleString('fr-FR')}</p>
            {notification.papCode && (
              <p><span className="font-semibold">Dossier:</span> {notification.papCode}</p>
            )}
          </div>
        </div>

        {notification.actions && (
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-3">Actions suggérées</h3>
            <div className="space-y-2">
              {notification.actions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleAction(action.id)}
                  disabled={actionTaken}
                  className="block w-full text-left p-3 bg-white border rounded hover:bg-blue-100 disabled:opacity-50"
                >
                  <p className="font-semibold text-blue-600">{action.label}</p>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t p-4 flex justify-between">
        <div className="flex gap-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Épingler">
            <Pin className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Marquer comme favoris">
            <Star className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Archiver">
            <Archive className="w-5 h-5" />
          </button>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          ✓ Marquer comme résolu
        </button>
      </div>
    </div>
  );
}
