import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 27)); // August 2026
  const [events, setEvents] = useState([
    { date: '2026-08-28', title: 'Réunion Phase 1', type: 'meeting' },
    { date: '2026-08-28', title: 'Visite Évaluation', type: 'visit' },
    { date: '2026-08-29', title: 'Réunion Compensation', type: 'meeting' },
    { date: '2026-08-30', title: 'Paiement Batch 1', type: 'payment' },
  ]);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventTypeColor = (type) => {
    switch(type) {
      case 'meeting': return '#3b82f6';
      case 'visit': return '#10b981';
      case 'payment': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getEventTypeLabel = (type) => {
    switch(type) {
      case 'meeting': return '📅';
      case 'visit': return '🏠';
      case 'payment': return '💰';
      default: return '📌';
    }
  };

  const formatDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toISOString().split('T')[0];
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = formatDate(day);
    return events.filter(e => e.date === dateStr);
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>
            Calendrier Équipe
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            Synchroniser événements et réunions
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
          <Plus size={18} /> Nouvel Événement
        </button>
      </div>

      {/* Calendar */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {/* Month Header */}
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={prevMonth}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', textTransform: 'capitalize' }}>
            {monthName}
          </h2>
          <button
            onClick={nextMonth}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekdays */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '2px solid #e2e8f0'
        }}>
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div
              key={day}
              style={{
                padding: '1rem',
                textAlign: 'center',
                fontWeight: '700',
                color: '#0f172a',
                background: '#f1f5f9'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          minHeight: '600px'
        }}>
          {days.map((day, index) => (
            <div
              key={index}
              style={{
                padding: '1rem',
                borderRight: index % 7 !== 6 ? '1px solid #e2e8f0' : 'none',
                borderBottom: '1px solid #e2e8f0',
                background: day && isToday(day) ? '#fef3c7' : 'white',
                minHeight: '100px',
                position: 'relative'
              }}
            >
              {day && (
                <>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: isToday(day) ? '#b45309' : '#0f172a',
                    marginBottom: '0.5rem'
                  }}>
                    {day}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {getEventsForDay(day).map((evt, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '0.35rem 0.5rem',
                          background: `${getEventTypeColor(evt.type)}20`,
                          color: getEventTypeColor(evt.type),
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer'
                        }}
                        title={evt.title}
                      >
                        {getEventTypeLabel(evt.type)} {evt.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Event Types Legend */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontWeight: '700', color: '#0f172a' }}>Types d'événements</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div>
            <span style={{ color: '#475569' }}>📅 Réunions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }}></div>
            <span style={{ color: '#475569' }}>🏠 Visites</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }}></div>
            <span style={{ color: '#475569' }}>💰 Paiements</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
