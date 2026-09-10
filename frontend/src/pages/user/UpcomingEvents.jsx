import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../../services/eventService';
import { IconCalendar, IconClock, IconMapPin, IconSearch, IconUsers } from '../../components/common/Icons';
import StatusBadge from '../../components/common/StatusBadge';
import CardSkeleton from '../../components/common/Skeleton';
import Toast from '../../components/common/Toast';

export const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [msg, setMsg] = useState({ text: '', type: 'error' });

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const fetchUpcoming = async () => {
    try {
      setLoading(true);
      const res = await eventService.getUpcomingEvents();
      if (res.success) {
        setEvents(res.data || []);
      }
    } catch (err) {
      setMsg({ text: 'Unable to load upcoming events.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickJoin = async (eventId) => {
    try {
      const res = await eventService.sendJoinRequest(eventId);
      if (res.success) {
        setMsg({ text: 'Join request sent successfully!', type: 'success' });
        fetchUpcoming();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Could not send join request.';
      setMsg({ text: errorMsg, type: 'error' });
    }
  };

  const filteredEvents = events.filter((e) => {
    const term = searchTerm.toLowerCase();
    return (
      e.eventName?.toLowerCase().includes(term) ||
      e.eventPlace?.toLowerCase().includes(term) ||
      e.organizerId?.organizationName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Upcoming Events</h1>
          <p>Browse open upcoming events and apply as an event coordinator.</p>
        </div>
      </div>

      <Toast message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: 'error' })} />

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <IconSearch size={20} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search by event name, venue, or organizer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', width: '100%', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none' }}
        />
      </div>

      {loading ? (
        <div className="cards-grid">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <IconCalendar size={48} />
          <h3>No Upcoming Events Found</h3>
          <p>{searchTerm ? 'Try adjusting your search criteria.' : 'There are currently no upcoming public events.'}</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredEvents.map((event) => {
            const isFull = (event.coordinators?.length || 0) >= event.numberOfCoordinators;
            return (
              <div key={event._id} className="event-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <StatusBadge status={event.status} type="event" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isFull ? '#f43f5e' : 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconUsers size={12} />
                    {event.coordinators?.length || 0} / {event.numberOfCoordinators} {isFull ? '(FULL)' : 'Coordinators'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>{event.eventName}</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '14px' }}>
                  Organizer: {event.organizerId?.organizationName || event.organizerId?.fullName || 'Organizer'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconCalendar size={16} /> {new Date(event.eventDate).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconClock size={16} /> {event.startTime} - {event.endTime}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconMapPin size={16} /> {event.eventPlace}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
                  <Link to={`/user/events/${event._id}`} className="secondary-btn" style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}>
                    View Details
                  </Link>
                  <button
                    onClick={() => handleQuickJoin(event._id)}
                    className="gradient-btn"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                    disabled={isFull}
                  >
                    {isFull ? 'Limit Full' : 'Request Join'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
