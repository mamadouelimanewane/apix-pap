// Communication Center Premium - Design APIX inspired
// Thèmes: Gradient, Cards, Organisation élégante, Mode dark-aware
import React, { useEffect, useState } from 'react';
import {
  MessageCircle, Bell, Send, Search, Filter,
  AlertCircle, CheckCircle, Clock, X, Plus,
  Paperclip, Star, Archive, Pin, Reply, MoreVertical,
  TrendingUp, Zap, AlertTriangle
} from 'lucide-react';

export default function CommunicationCenterPremium() {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');

  useEffect(() => {
    loadCommunications();
    const interval = setInterval(loadCommunications, 30000);
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

      setMessages(messagesData.messages || []);
      setNotifications(notificationsData.notifications || []);
    } catch (error) {
      console.error('Erreur chargement communications:', error);
    }
  };

  const unreadMessages = messages.filter(m => !m.read).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header Premium */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Centre de Communications
                </h1>
                <p className="text-sm text-gray-500 mt-1">Messages, alertes et notifications</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              {unreadNotifications > 0 && (
                <div className="px-4 py-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-100 animate-pulse">
                  <p className="text-xs text-red-600 font-semibold">Alertes non lues</p>
                  <p className="text-2xl font-bold text-red-600">{unreadNotifications}</p>
                </div>
              )}
              {unreadMessages > 0 && (
                <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold">Nouveaux messages</p>
                  <p className="text-2xl font-bold text-blue-600">{unreadMessages}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-1 flex">
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  activeTab === 'messages'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Messages
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Bell className="w-4 h-4 inline mr-2" />
                Alertes
              </button>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {activeTab === 'messages' && (
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
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
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col max-h-96 lg:max-h-full">
              <div className="overflow-y-auto flex-1">
                {activeTab === 'messages' && filteredMessages.length > 0 && (
                  <div className="divide-y divide-gray-100">
                    {filteredMessages.map(msg => (
                      <MessageItemPremium
                        key={msg.id}
                        message={msg}
                        selected={selectedThread?.id === msg.id}
                        onSelect={() => setSelectedThread(msg)}
                      />
                    ))}
                  </div>
                )}

                {activeTab === 'notifications' && filteredNotifications.length > 0 && (
                  <div className="divide-y divide-gray-100">
                    {filteredNotifications.map(notif => (
                      <NotificationItemPremium
                        key={notif.id}
                        notification={notif}
                        selected={selectedThread?.id === notif.id}
                        onSelect={() => setSelectedThread(notif)}
                      />
                    ))}
                  </div>
                )}

                {((activeTab === 'messages' && filteredMessages.length === 0) ||
                  (activeTab === 'notifications' && filteredNotifications.length === 0)) && (
                  <div className="p-6 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Aucun élément</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            {selectedThread ? (
              <>
                {activeTab === 'messages' ? (
                  <MessageThreadViewPremium
                    thread={selectedThread}
                    onClose={() => setSelectedThread(null)}
                    onRefresh={loadCommunications}
                  />
                ) : (
                  <NotificationDetailViewPremium
                    notification={selectedThread}
                    onClose={() => setSelectedThread(null)}
                    onRefresh={loadCommunications}
                  />
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-full flex items-center justify-center min-h-96">
                <div className="text-center">
                  {activeTab === 'messages' ? (
                    <>
                      <div className="p-4 bg-blue-100 rounded-full inline-block mb-4">
                        <MessageCircle className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun message sélectionné</h3>
                      <p className="text-gray-500">Sélectionnez un message pour commencer</p>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-amber-100 rounded-full inline-block mb-4">
                        <Bell className="w-8 h-8 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune alerte sélectionnée</h3>
                      <p className="text-gray-500">Sélectionnez une alerte pour voir les détails</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MESSAGE ITEM PREMIUM
// ============================================================================

function MessageItemPremium({ message, selected, onSelect }) {
  const priorityConfig = {
    'LOW': { bg: 'bg-gray-100', text: 'text-gray-700', badge: '◯' },
    'MEDIUM': { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: '◯◯' },
    'HIGH': { bg: 'bg-orange-100', text: 'text-orange-700', badge: '◯◯◯' },
    'URGENT': { bg: 'bg-red-100', text: 'text-red-700', badge: '●' }
  };

  const config = priorityConfig[message.priority] || priorityConfig['LOW'];

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-l-4 ${
        selected
          ? 'bg-blue-50 border-l-blue-600'
          : `border-l-transparent ${!message.read ? 'bg-blue-50' : 'bg-white'}`
      }`}
    >
      <div className="flex justify-between items-start gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!message.read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
            )}
            <h3 className={`font-semibold truncate ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}>
              {message.subject}
            </h3>
          </div>
          <p className="text-sm text-gray-600 truncate">{message.from}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${config.text} ${config.bg} flex-shrink-0`}>
          {config.badge}
        </span>
      </div>

      <p className="text-xs text-gray-500">
        {new Date(message.createdAt).toLocaleString('fr-FR')}
      </p>
    </button>
  );
}

// ============================================================================
// NOTIFICATION ITEM PREMIUM
// ============================================================================

function NotificationItemPremium({ notification, selected, onSelect }) {
  const severityConfig = {
    'CRITICAL': {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      badge: 'bg-red-100 text-red-700',
      icon: '⛔'
    },
    'HIGH': {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      badge: 'bg-orange-100 text-orange-700',
      icon: '⚠️'
    },
    'MEDIUM': {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      badge: 'bg-yellow-100 text-yellow-700',
      icon: '⚡'
    },
    'LOW': {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badge: 'bg-blue-100 text-blue-700',
      icon: 'ℹ️'
    }
  };

  const config = severityConfig[notification.severity] || severityConfig['LOW'];

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 border-l-4 transition-all ${
        selected
          ? `${config.bg} ${config.border} border-l-current shadow-sm`
          : `${config.bg} border-l-transparent hover:shadow-sm`
      }`}
    >
      <div className="flex items-start gap-3 mb-2">
        <span className="text-xl flex-shrink-0">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${config.text} truncate`}>
            {notification.type}
          </h3>
          <p className={`text-sm ${config.text} opacity-75 line-clamp-1`}>
            {notification.message}
          </p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-1"></div>
        )}
      </div>

      <p className="text-xs opacity-60 ml-8">
        {new Date(notification.createdAt).toLocaleString('fr-FR')}
      </p>
    </button>
  );
}

// ============================================================================
// MESSAGE THREAD VIEW PREMIUM
// ============================================================================

function MessageThreadViewPremium({ thread, onClose, onRefresh }) {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/api/communications/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: thread.threadId,
          body: replyText
        })
      });

      if (response.ok) {
        setReplyText('');
        onRefresh();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full max-h-screen lg:max-h-96">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{thread.subject}</h2>
          <p className="text-sm text-gray-600 mt-2">De: <span className="font-semibold">{thread.from}</span></p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-800 text-sm">{thread.body}</p>
          <p className="text-xs text-gray-500 mt-3">
            {new Date(thread.createdAt).toLocaleString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Reply Form */}
      <div className="border-t border-gray-100 bg-gray-50 p-6">
        <div className="flex gap-2 items-end">
          <button className="p-3 hover:bg-white rounded-lg transition-colors text-gray-600">
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Votre réponse..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows="2"
            />
          </div>

          <button
            onClick={handleSendReply}
            disabled={sending || !replyText.trim()}
            className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
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
// NOTIFICATION DETAIL VIEW PREMIUM
// ============================================================================

function NotificationDetailViewPremium({ notification, onClose, onRefresh }) {
  const severityConfig = {
    'CRITICAL': { bg: 'from-red-600 to-red-700', icon: '⛔', label: 'CRITIQUE' },
    'HIGH': { bg: 'from-orange-600 to-orange-700', icon: '⚠️', label: 'ÉLEVÉE' },
    'MEDIUM': { bg: 'from-yellow-600 to-yellow-700', icon: '⚡', label: 'MOYENNE' },
    'LOW': { bg: 'from-blue-600 to-indigo-600', icon: 'ℹ️', label: 'BASSE' }
  };

  const config = severityConfig[notification.severity] || severityConfig['LOW'];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full max-h-screen lg:max-h-96">
      {/* Header */}
      <div className={`bg-gradient-to-r ${config.bg} p-6 text-white flex justify-between items-start`}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <h2 className="text-2xl font-bold">{notification.type}</h2>
              <p className="text-sm opacity-90">{config.label}</p>
            </div>
          </div>
          <p className="text-sm opacity-90 mt-3">{notification.message}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Type</p>
            <p className="font-semibold text-gray-900">{notification.type}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Sévérité</p>
            <p className="font-semibold text-gray-900">{config.label}</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Message</p>
          <p className="text-gray-900">{notification.message}</p>
        </div>

        {notification.papCode && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Dossier</p>
            <p className="font-semibold text-blue-900">{notification.papCode}</p>
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Date</p>
          <p className="text-gray-900">{new Date(notification.createdAt).toLocaleString('fr-FR')}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 bg-gray-50 p-4 flex gap-2">
        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm">
          ✓ Marqué comme résolu
        </button>
        <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
