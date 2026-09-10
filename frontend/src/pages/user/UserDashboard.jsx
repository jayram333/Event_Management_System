import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import eventService from '../../services/eventService';
import { IconCalendar, IconCheckCircle, IconClock, IconMapPin, IconChevronRight } from '../../components/common/Icons';
import StatusBadge from '../../components/common/StatusBadge';
import CardSkeleton from '../../components/common/Skeleton';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [upRes, joinRes] = await Promise.all([
          eventService.getUpcomingEvents(),
          eventService.getJoinedEvents(),
        ]);
        if (upRes.success) setUpcomingEvents(upRes.data || []);
        if (joinRes.success) setJoinedEvents(joinRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
            Welcome back, <span className="gradient-text">{user?.fullName || 'Participant'}</span>! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Discover upcoming events, request coordinator access, and manage your assigned tasks.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/user/upcoming-events" className="gradient-btn">
            Browse Upcoming Events
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '36px',
        }}
      >
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '12px', borderRadius: '12px' }}>
            <IconCalendar size={24} />
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>UPCOMING EVENTS</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{upcomingEvents.length}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '12px', borderRadius: '12px' }}>
            <IconCheckCircle size={24} />
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>JOINED EVENTS</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{joinedEvents.length}</h3>
          </div>
        </div>
      </div>

      {/* Joined Events Section */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>My Joined Events</h2>
          <Link to="/user/joined-events" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <IconChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="cards-grid">
            <CardSkeleton /><CardSkeleton />
          </div>
        ) : joinedEvents.length === 0 ? (
          <div className="empty-state">
            <IconCheckCircle size={40} />
            <h3>No Joined Events Yet</h3>
            <p>Explore upcoming events and submit a join request to start coordinating.</p>
            <Link to="/user/upcoming-events" className="secondary-btn">Explore Events</Link>
          </div>
        ) : (
          <div className="cards-grid">
            {joinedEvents.slice(0, 3).map((event) => (
              <div key={event._id} className="event-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <StatusBadge status={event.status} type="event" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {event.coordinators?.length || 0} / {event.numberOfCoordinators} Coordinators
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{event.eventName}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconCalendar size={14} /> {new Date(event.eventDate).toLocaleDateString()}
                  <span style={{ margin: '0 4px' }}>•</span>
                  <IconClock size={14} /> {event.startTime} - {event.endTime}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <IconMapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {event.eventPlace}
                  </span>
                  <Link to={`/user/events/${event._id}`} className="gradient-btn" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                    Workspace
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events Preview */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Upcoming Events to Join</h2>
          <Link to="/user/upcoming-events" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <IconChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="cards-grid">
            <CardSkeleton /><CardSkeleton />
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="empty-state">
            <IconCalendar size={40} />
            <h3>No Upcoming Events Found</h3>
            <p>Check back later for new events published by organizers.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div key={event._id} className="event-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <StatusBadge status={event.status} type="event" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    By: {event.organizerId?.organizationName || event.organizerId?.fullName || 'Organizer'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{event.eventName}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconCalendar size={14} /> {new Date(event.eventDate).toLocaleDateString()}
                  <span style={{ margin: '0 4px' }}>•</span>
                  <IconClock size={14} /> {event.startTime}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <IconMapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {event.eventPlace}
                  </span>
                  <Link to={`/user/events/${event._id}`} className="secondary-btn" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                    View Details
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

export default UserDashboard;