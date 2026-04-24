import React, { useState, useEffect } from 'react';
import { getCalendarEvents } from '../services/api';

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('calendar');

  useEffect(() => {
    getCalendarEvents()
      .then(r => setEvents(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToday = () => setCurrentMonth(new Date());

  const getEventsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .slice(0, 20);

  const overdueEvents = events
    .filter(e => e.date < todayStr && e.status !== 'completed' && e.status !== 'cancelled')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const typeIcons = {
    appointment: '📅',
    vaccination: '💉',
    medication: '💊',
    grooming: '✂️',
    dental: '🦷',
    parasite: '🛡️',
  };

  if (loading) return <div className="empty-state"><div className="ai-loading"><div className="spinner"></div><p>Loading calendar...</p></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>📅 Calendar</h1>
          <p>View all upcoming events, appointments, and reminders</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${view === 'calendar' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('calendar')}>Calendar</button>
          <button className={`btn ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}>List</button>
        </div>
      </div>

      {view === 'calendar' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          {/* Calendar Grid */}
          <div className="data-section">
            <div className="data-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={prevMonth}>&lt;</button>
              <h2 style={{ margin: 0 }}>{monthName}</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={goToday}>Today</button>
                <button className="btn btn-secondary btn-sm" onClick={nextMonth}>&gt;</button>
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center', marginBottom: 8 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} style={{ padding: 8, fontWeight: 600, fontSize: 12, color: 'var(--gray-400)' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`empty-${i}`} style={{ padding: 8, minHeight: 80 }} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dayEvents = getEventsForDate(day);
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isToday = dateStr === todayStr;
                  const isSelected = selectedDate === day;

                  return (
                    <div key={day} onClick={() => setSelectedDate(day)}
                      style={{
                        padding: 6, minHeight: 80, borderRadius: 8, cursor: 'pointer',
                        background: isSelected ? 'var(--primary-50, #eef2ff)' : isToday ? '#f0fdf4' : 'var(--gray-50, #f8fafc)',
                        border: isSelected ? '2px solid var(--primary, #6366f1)' : isToday ? '2px solid #10b981' : '1px solid var(--gray-100, #f1f5f9)',
                        transition: 'all 0.15s',
                      }}>
                      <div style={{ fontWeight: isToday ? 700 : 500, fontSize: 13, marginBottom: 4, color: isToday ? '#10b981' : 'var(--gray-700)' }}>{day}</div>
                      {dayEvents.slice(0, 3).map(evt => (
                        <div key={evt.id} style={{ fontSize: 10, padding: '1px 4px', borderRadius: 4, background: evt.color + '20', color: evt.color, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {typeIcons[evt.type] || '📌'} {evt.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>+{dayEvents.length - 3} more</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Selected Date Events */}
            {selectedDate && (
              <div className="data-section" style={{ marginBottom: 16 }}>
                <div className="data-header">
                  <h2 style={{ fontSize: 16 }}>{monthName.split(' ')[0]} {selectedDate}</h2>
                </div>
                <div style={{ padding: 12 }}>
                  {selectedDateEvents.length > 0 ? selectedDateEvents.map(evt => (
                    <div key={evt.id} style={{ padding: 10, borderRadius: 8, background: evt.color + '10', borderLeft: `3px solid ${evt.color}`, marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{typeIcons[evt.type]} {evt.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{evt.pet} {evt.time ? `· ${evt.time}` : ''}</div>
                    </div>
                  )) : <p style={{ fontSize: 13, color: 'var(--gray-400)', textAlign: 'center', padding: 16 }}>No events this day</p>}
                </div>
              </div>
            )}

            {/* Overdue */}
            {overdueEvents.length > 0 && (
              <div className="data-section" style={{ marginBottom: 16 }}>
                <div className="data-header"><h2 style={{ fontSize: 16, color: '#ef4444' }}>Overdue</h2></div>
                <div style={{ padding: 12 }}>
                  {overdueEvents.slice(0, 5).map(evt => (
                    <div key={evt.id} style={{ padding: 10, borderRadius: 8, background: '#fef2f2', borderLeft: '3px solid #ef4444', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{typeIcons[evt.type]} {evt.title}</div>
                      <div style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>{evt.pet} · {evt.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            <div className="data-section">
              <div className="data-header"><h2 style={{ fontSize: 16 }}>Upcoming Events</h2></div>
              <div style={{ padding: 12 }}>
                {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 8).map(evt => (
                  <div key={evt.id} style={{ padding: 10, borderRadius: 8, background: evt.color + '08', borderLeft: `3px solid ${evt.color}`, marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{typeIcons[evt.type]} {evt.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{evt.pet} · {evt.date} {evt.time ? `· ${evt.time}` : ''}</div>
                  </div>
                )) : <p style={{ fontSize: 13, color: 'var(--gray-400)', textAlign: 'center', padding: 16 }}>No upcoming events</p>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="data-section">
          <div className="data-header"><h2>All Events ({events.length})</h2></div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Event</th>
                <th>Pet</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {events.sort((a, b) => (a.date || '').localeCompare(b.date || '')).map(evt => (
                <tr key={evt.id}>
                  <td><span style={{ padding: '2px 8px', borderRadius: 12, background: evt.color + '20', color: evt.color, fontSize: 12, fontWeight: 600 }}>{evt.type}</span></td>
                  <td>{typeIcons[evt.type]} {evt.title}</td>
                  <td>{evt.pet}</td>
                  <td>{evt.date}</td>
                  <td>{evt.time || '-'}</td>
                  <td>{evt.date < todayStr ? <span className="badge badge-severe">Overdue</span> : evt.status ? <span className={`badge badge-${evt.status}`}>{evt.status}</span> : <span className="badge badge-low">Upcoming</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p>No events found. Add appointments, vaccinations, or other scheduled items to see them here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
