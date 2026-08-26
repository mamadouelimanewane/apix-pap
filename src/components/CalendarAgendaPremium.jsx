// Calendrier Premium - Design APIX inspired
// Thèmes: Gradient bleu/indigo, Cards, Organisation élégante
import React, { useEffect, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Clock, Users, MapPin, AlertCircle,
  CheckCircle, X, Plus, Edit2, Send, Phone, Mail, Calendar,
  Zap, TrendingUp, Eye, EyeOff
} from 'lucide-react';

export default function CalendarAgendaPremium() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [upcomingCount, setUpcomingCount] = useState(0);

  useEffect(() => {
    loadMeetings();
    const interval = setInterval(loadMeetings, 30000);
    return () => clearInterval(interval);
  }, [currentDate, viewMode]);

  const loadMeetings = async () => {
    try {
      const response = await fetch(
        `/api/calendar/meetings?date=${currentDate.toISOString()}&view=${viewMode}`
      );
      const data = await response.json();
      setMeetings(data.meetings || []);
      setUpcomingCount(data.meetings?.filter(m => m.status === 'SCHEDULED').length || 0);
    } catch (error) {
      console.error('Erreur chargement réunions:', error);
    }
  };

  const filteredMeetings = meetings.filter(m => {
    if (filterRole !== 'ALL' && m.organizerRole !== filterRole) return false;
    if (filterType !== 'ALL' && m.type !== filterType) return false;
    return true;
  });

  const getMeetingColor = (type) => {
    const colors = {
      'BRIEFING': 'from-blue-500 to-blue-600',
      'COMPENSATION_REVIEW': 'from-purple-500 to-purple-600',
      'ESCALATION': 'from-red-500 to-red-600',
      'FIELD_FOLLOWUP': 'from-green-500 to-green-600',
      'MONTHLY_REVIEW': 'from-indigo-500 to-indigo-600',
      'PAP_APPOINTMENT': 'from-cyan-500 to-cyan-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header Premium */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Agenda & Réunions
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">Planifiez et coordonnez vos réunions</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-3">
              <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-600">Réunions programmées</p>
                <p className="text-2xl font-bold text-blue-600">{upcomingCount}</p>
              </div>
              <button
                onClick={() => setShowNewMeetingModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Nouvelle Réunion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          {/* Navigation temporelle */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentDate.toLocaleDateString('fr-FR', {
                  month: 'long',
                  year: 'numeric'
                })}
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* View Mode Selector */}
            <div className="flex gap-2">
              {[
                { mode: 'day', label: 'Jour', icon: '📅' },
                { mode: 'week', label: 'Semaine', icon: '📆' },
                { mode: 'month', label: 'Mois', icon: '📊' }
              ].map(({ mode, label, icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtres */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Rôle</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="ALL">Tous rôles</option>
                <option value="AGENT">Agents</option>
                <option value="SUPERVISEUR">Superviseurs</option>
                <option value="DIRECTEUR">Directeurs</option>
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="ALL">Tous types</option>
                <option value="BRIEFING">Briefing</option>
                <option value="COMPENSATION_REVIEW">Revue Compensation</option>
                <option value="ESCALATION">Escalade</option>
                <option value="PAP_APPOINTMENT">RDV PAP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {viewMode === 'week' && (
            <WeekViewPremium
              meetings={filteredMeetings}
              onSelectMeeting={setSelectedMeeting}
              getMeetingColor={getMeetingColor}
            />
          )}

          {viewMode === 'month' && (
            <MonthViewPremium
              meetings={filteredMeetings}
              onSelectMeeting={setSelectedMeeting}
              getMeetingColor={getMeetingColor}
            />
          )}

          {viewMode === 'day' && (
            <DayViewPremium
              meetings={filteredMeetings}
              onSelectMeeting={setSelectedMeeting}
              getMeetingColor={getMeetingColor}
            />
          )}
        </div>

        {/* Meeting Details Sidebar */}
        {selectedMeeting && (
          <MeetingDetailsPanelPremium
            meeting={selectedMeeting}
            onClose={() => setSelectedMeeting(null)}
            getMeetingColor={getMeetingColor}
          />
        )}

        {/* New Meeting Modal */}
        {showNewMeetingModal && (
          <NewMeetingModalPremium
            onClose={() => setShowNewMeetingModal(false)}
            onCreated={() => {
              setShowNewMeetingModal(false);
              loadMeetings();
            }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// WEEK VIEW PREMIUM
// ============================================================================

function WeekViewPremium({ meetings, onSelectMeeting, getMeetingColor }) {
  const days = [];
  const currentDate = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay() + i);
    days.push(d);
  }

  const hours = Array.from({ length: 10 }, (_, i) => i + 8);

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-8 gap-0 min-w-max">
        {/* Time Column */}
        <div className="col-span-1 bg-gray-50 border-r border-gray-200 min-w-24">
          <div className="h-16 border-b border-gray-200"></div>
          {hours.map(hour => (
            <div
              key={hour}
              className="h-20 border-b border-gray-100 p-2 text-xs font-semibold text-gray-500 text-right"
            >
              {`${String(hour).padStart(2, '0')}:00`}
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {days.map((day, dayIdx) => (
          <div key={dayIdx} className="col-span-1 border-r border-gray-200 min-w-40">
            {/* Day Header */}
            <div className="h-16 border-b border-gray-200 p-3 bg-gradient-to-br from-gray-50 to-gray-100">
              <p className="text-xs font-semibold text-gray-600 uppercase">
                {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
              </p>
              <p className="text-lg font-bold text-gray-900">{day.getDate()}</p>
            </div>

            {/* Hour Slots */}
            {hours.map((hour, hourIdx) => {
              const dayMeetings = meetings.filter(m => {
                const mStart = new Date(m.startTime);
                return (
                  mStart.toDateString() === day.toDateString() &&
                  mStart.getHours() === hour
                );
              });

              return (
                <div
                  key={`${hour}-${dayIdx}`}
                  className="h-20 border-b border-gray-100 p-2 hover:bg-blue-50 transition-colors"
                >
                  {dayMeetings.map(meeting => (
                    <button
                      key={meeting.id}
                      onClick={() => onSelectMeeting(meeting)}
                      className={`w-full h-full bg-gradient-to-br ${getMeetingColor(meeting.type)} rounded-lg p-2 text-white cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 text-xs font-semibold overflow-hidden`}
                    >
                      <div className="truncate">{meeting.title}</div>
                      <div className="text-xs opacity-90">
                        {new Date(meeting.startTime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MONTH VIEW PREMIUM
// ============================================================================

function MonthViewPremium({ meetings, onSelectMeeting, getMeetingColor }) {
  const currentDate = new Date();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const days = [];

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-7 gap-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="text-center font-bold text-gray-700 py-4 border-b-2 border-gray-200">
            {day}
          </div>
        ))}

        {days.map((day, idx) => (
          <div
            key={idx}
            className={`min-h-24 p-3 rounded-lg border-2 transition-all ${
              day
                ? 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-lg'
                : 'bg-gray-50 border-gray-100'
            }`}
          >
            {day && (
              <>
                <p className="font-bold text-lg text-gray-900 mb-2">{day.getDate()}</p>
                <div className="space-y-1">
                  {meetings
                    .filter(m => new Date(m.startTime).toDateString() === day.toDateString())
                    .slice(0, 2)
                    .map(m => (
                      <button
                        key={m.id}
                        onClick={() => onSelectMeeting(m)}
                        className={`w-full px-2 py-1 rounded bg-gradient-to-r ${getMeetingColor(m.type)} text-white text-xs font-semibold truncate hover:shadow-md transition-all`}
                      >
                        {m.title}
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// DAY VIEW PREMIUM
// ============================================================================

function DayViewPremium({ meetings, onSelectMeeting, getMeetingColor }) {
  const hours = Array.from({ length: 10 }, (_, i) => i + 8);

  return (
    <div className="p-6">
      <div className="space-y-3">
        {hours.map(hour => {
          const hourMeetings = meetings.filter(m => {
            const mStart = new Date(m.startTime);
            return mStart.getHours() === hour;
          });

          return (
            <div key={hour} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-bold text-gray-900 mb-3 text-lg">
                {`${String(hour).padStart(2, '0')}:00`}
              </p>

              {hourMeetings.length > 0 ? (
                <div className="space-y-2">
                  {hourMeetings.map(meeting => (
                    <button
                      key={meeting.id}
                      onClick={() => onSelectMeeting(meeting)}
                      className={`w-full text-left p-4 bg-gradient-to-r ${getMeetingColor(meeting.type)} rounded-lg text-white hover:shadow-lg transition-all transform hover:-translate-y-1`}
                    >
                      <p className="font-semibold text-base">{meeting.title}</p>
                      <p className="text-sm opacity-90 mt-1">
                        {new Date(meeting.startTime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {new Date(meeting.endTime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs opacity-75 mt-2">👥 {meeting.participants?.length || 0} participants</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aucune réunion</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// MEETING DETAILS PANEL PREMIUM
// ============================================================================

function MeetingDetailsPanelPremium({ meeting, onClose, getMeetingColor }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-screen md:max-h-96 overflow-y-auto animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getMeetingColor(meeting.type)} p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold mb-2">{meeting.title}</h2>
          <p className="text-sm opacity-90">{meeting.type}</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          {/* Time */}
          <div className="flex gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Horaire</p>
              <p className="font-semibold text-gray-900">
                {new Date(meeting.startTime).toLocaleString('fr-FR')} -{' '}
                {new Date(meeting.endTime).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Lieu</p>
              <p className="font-semibold text-gray-900">{meeting.location}</p>
            </div>
          </div>

          {/* Participants */}
          <div className="flex gap-3">
            <Users className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">Participants ({meeting.participants?.length || 0})</p>
              <div className="space-y-1">
                {meeting.participants?.slice(0, 3).map((p, i) => (
                  <div key={i} className="text-sm text-gray-700">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {p.status === 'ACCEPTED' ? '✅' : p.status === 'DECLINED' ? '❌' : '⏳'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Status: <span className="font-semibold">{meeting.status}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 p-6 border-t border-gray-200 flex gap-2">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            Détails
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            ⋯
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NEW MEETING MODAL PREMIUM
// ============================================================================

function NewMeetingModalPremium({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'COMPENSATION_REVIEW',
    participants: [],
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    location: 'Bureau DK',
    agenda: ''
  });

  const handleCreate = async () => {
    const response = await fetch('/api/calendar/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      onCreated();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-screen overflow-y-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Nouvelle Réunion</h2>
            <p className="text-sm opacity-90 mt-1">Créez et planifiez une réunion</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Titre</label>
            <input
              type="text"
              placeholder="Titre réunion"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="BRIEFING">Briefing</option>
              <option value="COMPENSATION_REVIEW">Revue Compensation</option>
              <option value="ESCALATION">Escalade</option>
              <option value="PAP_APPOINTMENT">RDV PAP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Agenda</label>
            <textarea
              placeholder="Points à discuter..."
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Début</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fin</label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Lieu</label>
            <input
              type="text"
              placeholder="Bureau, Visio, Terrain..."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleCreate}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            ✓ Créer
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
