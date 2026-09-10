import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import eventService from '../../services/eventService';
import {
  IconCalendar,
  IconUsers,
  IconClock,
  IconPlus,
  IconCheckCircle,
  IconChevronRight,
} from '../../components/common/Icons';
import StatusBadge from '../../components/common/StatusBadge';
import CardSkeleton from '../../components/common/Skeleton';

export const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventService.getOrganizerEvents();
      if (res.success) {
        setEvents(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching organizer events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute metrics from actual API response data
  const totalEvents = events.length;
  const draftEvents = events.filter((e) => e.status === 'DRAFT').length;
  const upcomingEvents = events.filter((e) => e.status === 'UPCOMING').length;
  const ongoingEvents = events.filter((e) => e.status === 'ONGOING').length;
  const completedEvents = events.filter((e) => e.status === 'COMPLETED').length;
  const cancelledEvents = events.filter((e) => e.status === 'CANCELLED').length;

  const totalJoinRequests = events.reduce((sum, e) => {
    const pending = e.joinRequests?.filter((r) => r.status === 'PENDING')?.length || 0;
    return sum + pending;
  }, 0);

  const totalActiveCoordinators = events.reduce((sum, e) => sum + (e.coordinators?.length || 0), 0);

  return (
    <div className="animate-fade-in">
      {/* Welcome Hero */}
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '6px' }}>
            Organizer Studio: <span className="gradient-text">{user?.organizationName || user?.fullName}</span> 🚀
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Publish new events, sequence sub-tasks, evaluate coordinator applications, and manage live execution.
          </p>
        </div>

        <Link to="/organizer/create-event" className="gradient-btn" style={{ padding: '12px 24px' }}>
          <IconPlus size={18} /> Create New Event
        </Link>
      </div>

      {/* Real-time Dashboard Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '36px',
        }}
      >
        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>TOTAL EVENTS</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px' }}>{totalEvents}</h3>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>DRAFT</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d1d5db', marginTop: '4px' }}>{draftEvents}</h3>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>UPCOMING</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>{upcomingEvents}</h3>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>ONGOING</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fde047', marginTop: '4px' }}>{ongoingEvents}</h3>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>COMPLETED</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>{completedEvents}</h3>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>PENDING REQUESTS</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '4px' }}>
            {totalJoinRequests}
          </h3>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>ACTIVE COORDINATORS</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
            {totalActiveCoordinators}
          </h3>
        </div>
      </div>

      {/* Recent Events List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Your Published Events</h2>
          <Link to="/organizer/events" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            Manage All Events <IconChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="cards-grid">
            <CardSkeleton /><CardSkeleton />
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <IconCalendar size={48} />
            <h3>No Events Created Yet</h3>
            <p>Start organizing your first event and recruit coordinators now.</p>
            <Link to="/organizer/create-event" className="gradient-btn">
              Create Event Now
            </Link>
          </div>
        ) : (
          <div className="cards-grid">
            {events.slice(0, 4).map((event) => (
              <div key={event._id} className="event-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <StatusBadge status={event.status} type="event" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {event.coordinators?.length || 0} / {event.numberOfCoordinators} Coordinators
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{event.eventName}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  📅 {new Date(event.eventDate).toLocaleDateString()} • ⏱️ {event.startTime} - {event.endTime}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {event.tasks?.length || 0} Tasks
                  </span>
                  <Link to={`/organizer/events/${event._id}`} className="gradient-btn" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                    Manage Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;