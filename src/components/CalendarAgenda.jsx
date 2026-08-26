// Calendrier Partagé & Gestion Réunions
import React, { useEffect, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Clock, Users, MapPin, AlertCircle,
  CheckCircle, X, Plus, Edit2, Send, Phone, Mail
} from 'lucide-react';

export default function CalendarAgenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // week, month, day
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetings();
  }, [currentDate, viewMode]);

  const loadMeetings = async () => {
    try {
      const response = await fetch(
        `/api/calendar/meetings?date=${currentDate.toISOString()}&view=${viewMode}`
      );
      const data = await response.json();
      setMeetings(data.meetings);
    } catch (error) {
      console.error('Erreur chargement réunions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const filteredMeetings = meetings.filter(m => {
    if (filterRole !== 'ALL' && m.organizerRole !== filterRole) return false;
    if (filterType !== 'ALL' && m.type !== filterType) return false;
    return true;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📅 Calendrier Partagé</h1>
          <p className="text-gray-600">Gérez réunions et rendez-vous</p>
        </div>
        <button
          onClick={() => setShowNewMeetingModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Réunion
        </button>
      </div>

      {/* Navigation & Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-semibold">
                {currentDate.toLocaleDateString('fr-FR', {
                  month: 'long',
                  year: 'numeric',
                  week: 'long'
                })}
              </h2>
            </div>

            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            {['day', 'week', 'month'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {mode === 'day' ? 'Jour' : mode === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-4">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="ALL">Tous rôles</option>
            <option value="AGENT">Agents</option>
            <option value="SUPERVISEUR">Superviseurs</option>
            <option value="DIRECTEUR">Directeurs</option>
            <option value="ADMIN">Admin</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="ALL">Tous types</option>
            <option value="BRIEFING">Briefing</option>
            <option value="COMPENSATION_REVIEW">Revue Compensation</option>
            <option value="ESCALATION">Escalade</option>
            <option value="FIELD_FOLLOWUP">Suivi Terrain</option>
            <option value="MONTHLY_REVIEW">Bilan Mensuel</option>
            <option value="PAP_APPOINTMENT">RDV PAP</option>
          </select>
        </div>
      </div>

      {/* Calendrier Grid */}
      {viewMode === 'week' && (
        <WeekView meetings={filteredMeetings} onSelectMeeting={setSelectedMeeting} />
      )}

      {viewMode === 'month' && (
        <MonthView meetings={filteredMeetings} onSelectMeeting={setSelectedMeeting} />
      )}

      {viewMode === 'day' && (
        <DayView meetings={filteredMeetings} onSelectMeeting={setSelectedMeeting} />
      )}

      {/* Meeting Details Panel */}
      {selectedMeeting && (
        <MeetingDetailsPanel
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
        />
      )}

      {/* New Meeting Modal */}
      {showNewMeetingModal && (
        <NewMeetingModal
          onClose={() => setShowNewMeetingModal(false)}
          onCreated={() => {
            setShowNewMeetingModal(false);
            loadMeetings();
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// WEEK VIEW
// ============================================================================

function WeekView({ meetings, onSelectMeeting }) {
  const days = [];
  const currentDate = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay() + i);
    days.push(d);
  }

  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8h-18h

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <div className="grid grid-cols-8 gap-0 border-collapse">
        {/* Header - Jours */}
        <div className="col-span-1 p-2 bg-gray-50 border-b border-r min-w-20">
          <p className="text-xs font-semibold text-gray-600">Heure</p>
        </div>

        {days.map((day, idx) => (
          <div
            key={idx}
            className="col-span-1 p-2 bg-gray-50 border-b border-r min-w-32 text-center"
          >
            <p className="text-sm font-semibold">
              {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
            </p>
            <p className="text-lg font-bold">{day.getDate()}</p>
          </div>
        ))}

        {/* Grid horaire */}
        {hours.map((hour, hourIdx) => (
          <React.Fragment key={hour}>
            {/* Heure */}
            <div className="p-2 border-r border-b bg-gray-50 text-xs font-semibold text-gray-600">
              {`${String(hour).padStart(2, '0')}:00`}
            </div>

            {/* Slots pour chaque jour */}
            {days.map((day, dayIdx) => {
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
                  className="border-r border-b bg-white hover:bg-blue-50 min-h-20 p-1 relative"
                >
                  {dayMeetings.map(meeting => (
                    <button
                      key={meeting.id}
                      onClick={() => onSelectMeeting(meeting)}
                      className={`w-full p-2 rounded text-xs text-white cursor-pointer mb-1 ${
                        meeting.type === 'BRIEFING' ? 'bg-blue-500' :
                        meeting.type === 'COMPENSATION_REVIEW' ? 'bg-purple-500' :
                        meeting.type === 'ESCALATION' ? 'bg-red-500' :
                        meeting.type === 'PAP_APPOINTMENT' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}
                    >
                      <div className="font-semibold truncate">{meeting.title}</div>
                      <div className="text-xs">
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
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MEETING DETAILS PANEL
// ============================================================================

function MeetingDetailsPanel({ meeting, onClose }) {
  const [showMinutesForm, setShowMinutesForm] = useState(false);
  const [minutes, setMinutes] = useState({
    agenda: '',
    decisions: '',
    actionItems: [],
    nextSteps: ''
  });

  const handleSaveMinutes = async () => {
    const response = await fetch('/api/calendar/meetings/minutes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meetingId: meeting.id,
        ...minutes
      })
    });

    if (response.ok) {
      setShowMinutesForm(false);
      alert('Minutes sauvegardées!');
    }
  };

  const statusColor = {
    'SCHEDULED': 'bg-blue-100 text-blue-800',
    'ONGOING': 'bg-green-100 text-green-800',
    'COMPLETED': 'bg-gray-100 text-gray-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end">
      <div className="bg-white w-full md:w-96 h-screen md:h-auto md:rounded-t-lg shadow-lg p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{meeting.title}</h2>
            <p className={`text-sm font-semibold px-2 py-1 rounded w-fit mt-2 ${statusColor[meeting.status]}`}>
              {meeting.status === 'SCHEDULED' ? '📅 Planifiée' :
               meeting.status === 'ONGOING' ? '🔴 En cours' :
               meeting.status === 'COMPLETED' ? '✅ Complétée' :
               '❌ Annulée'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Heure</p>
            <p className="font-semibold">
              <Clock className="w-4 h-4 inline mr-2" />
              {new Date(meeting.startTime).toLocaleString('fr-FR')} -
              {new Date(meeting.endTime).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Lieu</p>
            <p className="font-semibold">
              <MapPin className="w-4 h-4 inline mr-2" />
              {meeting.location}
              {meeting.meetingLink && (
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Lien Zoom
                </a>
              )}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Participants ({meeting.participants.length})</p>
            <div className="space-y-2">
              {meeting.participants.map((p, i) => (
                <div key={i} className={`p-2 rounded text-sm ${
                  p.status === 'ACCEPTED' ? 'bg-green-50' :
                  p.status === 'DECLINED' ? 'bg-red-50' :
                  'bg-yellow-50'
                }`}>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-gray-600">
                    {p.status === 'ACCEPTED' ? '✅ Confirmé' :
                     p.status === 'DECLINED' ? '❌ Refusé' :
                     '⏳ En attente'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Minutes Form */}
        {meeting.status === 'COMPLETED' && !meeting.minutesUrl && (
          <div className="mb-6">
            {!showMinutesForm ? (
              <button
                onClick={() => setShowMinutesForm(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                📝 Créer Minutes de Réunion
              </button>
            ) : (
              <div className="space-y-3 p-4 bg-gray-50 rounded">
                <textarea
                  placeholder="Agenda et points discutés"
                  value={minutes.agenda}
                  onChange={(e) => setMinutes({ ...minutes, agenda: e.target.value })}
                  className="w-full p-2 border rounded text-sm"
                  rows="3"
                />
                <textarea
                  placeholder="Décisions prises"
                  value={minutes.decisions}
                  onChange={(e) => setMinutes({ ...minutes, decisions: e.target.value })}
                  className="w-full p-2 border rounded text-sm"
                  rows="2"
                />
                <button
                  onClick={handleSaveMinutes}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  ✅ Sauvegarder Minutes
                </button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 border-t pt-4">
          {meeting.status === 'SCHEDULED' && (
            <>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                ✅ Marquer comme en cours
              </button>
              <button className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                ❌ Annuler réunion
              </button>
            </>
          )}
          {meeting.status === 'ONGOING' && (
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              ✅ Marquer comme complétée
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NEW MEETING MODAL
// ============================================================================

function NewMeetingModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'COMPENSATION_REVIEW',
    participants: [],
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    location: 'Bureau DK',
    agenda: ''
  });

  const [suggestedSlots, setSuggestedSlots] = useState([]);

  const handleFindSlots = async () => {
    const response = await fetch('/api/calendar/find-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participants: formData.participants,
        duration: 60,
        type: formData.type
      })
    });

    const data = await response.json();
    setSuggestedSlots(data.slots);
  };

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">📅 Nouvelle Réunion</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Titre réunion"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />

          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="BRIEFING">Briefing</option>
            <option value="COMPENSATION_REVIEW">Revue Compensation</option>
            <option value="ESCALATION">Escalade</option>
            <option value="PAP_APPOINTMENT">RDV PAP</option>
          </select>

          <textarea
            placeholder="Agenda"
            value={formData.agenda}
            onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
            className="w-full px-3 py-2 border rounded text-sm"
            rows="3"
          />

          <input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />

          <input
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />

          <div className="flex gap-2">
            <button
              onClick={handleFindSlots}
              className="flex-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
            >
              🔍 Chercher Slots
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              ✅ Créer
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ❌ Fermer
            </button>
          </div>
        </div>

        {suggestedSlots.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="font-semibold mb-2">Créneaux suggérés:</p>
            {suggestedSlots.slice(0, 3).map((slot, i) => (
              <button
                key={i}
                onClick={() => {
                  setFormData({
                    ...formData,
                    startTime: slot.startTime,
                    endTime: slot.endTime
                  });
                  setSuggestedSlots([]);
                }}
                className="block w-full text-left p-2 hover:bg-blue-100 rounded text-sm mb-1"
              >
                {new Date(slot.startTime).toLocaleString('fr-FR')}
                <span className="text-gray-600 ml-2">(Score: {slot.availabilityScore}%)</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Month View Component
function MonthView({ meetings, onSelectMeeting }) {
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
    <div className="bg-white rounded-lg shadow p-4">
      <div className="grid grid-cols-7 gap-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}

        {days.map((day, idx) => (
          <div
            key={idx}
            className={`p-2 rounded min-h-20 border ${
              day ? 'bg-white hover:bg-blue-50' : 'bg-gray-50'
            }`}
          >
            {day && (
              <>
                <p className="font-bold text-sm mb-1">{day.getDate()}</p>
                {meetings
                  .filter(m => new Date(m.startTime).toDateString() === day.toDateString())
                  .slice(0, 2)
                  .map(m => (
                    <button
                      key={m.id}
                      onClick={() => onSelectMeeting(m)}
                      className="block w-full text-left text-xs bg-blue-500 text-white p-1 rounded mb-1 truncate hover:bg-blue-600"
                    >
                      {m.title}
                    </button>
                  ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Day View Component
function DayView({ meetings, onSelectMeeting }) {
  const hours = Array.from({ length: 10 }, (_, i) => i + 8);

  return (
    <div className="space-y-2">
      {hours.map(hour => {
        const hourMeetings = meetings.filter(m => {
          const mStart = new Date(m.startTime);
          return mStart.getHours() === hour;
        });

        return (
          <div key={hour} className="bg-white rounded-lg shadow p-4">
            <p className="font-bold text-gray-900 mb-3">
              {`${String(hour).padStart(2, '0')}:00`}
            </p>
            {hourMeetings.length > 0 ? (
              <div className="space-y-2">
                {hourMeetings.map(meeting => (
                  <button
                    key={meeting.id}
                    onClick={() => onSelectMeeting(meeting)}
                    className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded border-l-4 border-blue-600"
                  >
                    <p className="font-semibold">{meeting.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(meeting.startTime).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(meeting.endTime).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      👥 {meeting.participants.length} participants
                    </p>
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
  );
}
