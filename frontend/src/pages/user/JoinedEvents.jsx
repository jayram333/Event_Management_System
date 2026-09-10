import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import { IconCalendar, IconClock, IconMapPin, IconCheckCircle } from '../../components/common/Icons';
import StatusBadge from '../../components/common/StatusBadge';
import CardSkeleton from '../../components/common/Skeleton';
import Toast from '../../components/common/Toast';

export const JoinedEvents = () => {
  const { user } = useAuth();
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchJoined();
  }, []);

  const fetchJoined = async () => {
    try {
      setLoading(true);
      const res = await eventService.getJoinedEvents();
      if (res.success) {
        setJoinedEvents(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedEventId(res.data[0]._id);
        }
      }
    } catch (err) {
      setMsg('Unable to fetch your joined events.');
    } finally {
      setLoading(false);
    }
  };

  const selectedEvent = joinedEvents.find((e) => e._id === selectedEventId);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Coordinator Workspace</h1>
          <p>Track your approved events, assigned tasks, guidelines, and execution progress.</p>
        </div>
      </div>

      <Toast message={msg} type="error" onClose={() => setMsg('')} />

      {loading ? (
        <CardSkeleton />
      ) : joinedEvents.length === 0 ? (
        <div className="empty-state">
          <IconCheckCircle size={48} />
          <h3>No Joined Events Found</h3>
          <p>You haven't been approved as a coordinator for any events yet.</p>
          <Link to="/user/upcoming-events" className="gradient-btn">
            Browse Upcoming Events
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }} className="workspace-layout">
          {/* Event Selector List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Your Approved Events ({joinedEvents.length})
            </h3>
            {joinedEvents.map((event) => (
              <div
                key={event._id}
                onClick={() => setSelectedEventId(event._id)}
                className="glass-panel"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  borderColor: selectedEventId === event._id ? 'var(--primary)' : 'var(--border-color)',
                  background: selectedEventId === event._id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card-dark)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <StatusBadge status={event.status} type="event" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {new Date(event.eventDate).toLocaleDateString()}
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>{event.eventName}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <IconMapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {event.eventPlace}
                </span>
              </div>
            ))}
          </div>

          {/* Detailed Workspace View */}
          {selectedEvent && (
            <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{selectedEvent.eventName}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                    Organizer: {selectedEvent.organizerId?.organizationName || selectedEvent.organizerId?.fullName || 'Organizer'}
                  </p>
                </div>
                <Link to={`/user/events/${selectedEvent._id}`} className="secondary-btn">
                  View Full Event Page
                </Link>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <IconCalendar size={16} style={{ display: 'inline', marginRight: '6px', color: 'var(--primary)' }} />
                  {new Date(selectedEvent.eventDate).toLocaleDateString()}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <IconClock size={16} style={{ display: 'inline', marginRight: '6px', color: 'var(--accent-cyan)' }} />
                  {selectedEvent.startTime} - {selectedEvent.endTime}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <IconMapPin size={16} style={{ display: 'inline', marginRight: '6px', color: 'var(--accent-rose)' }} />
                  {selectedEvent.eventPlace}
                </span>
              </div>

              {/* Tasks Assigned To User or All Tasks */}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Event Tasks Itinerary & Instructions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedEvent.tasks?.map((task, idx) => {
                    const isMyTask =
                      task.coordinator &&
                      (task.coordinator._id || task.coordinator).toString() === user?.id?.toString();

                    return (
                      <div
                        key={task._id || idx}
                        style={{
                          padding: '20px',
                          borderRadius: 'var(--radius-sm)',
                          background: isMyTask ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                          border: `1px solid ${isMyTask ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-color)'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {isMyTask && <span className="badge badge-completed">Assigned To You</span>}
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{task.taskName}</h4>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <StatusBadge status={task.priority} type="priority" />
                            <StatusBadge status={task.status} type="taskStatus" />
                          </div>
                        </div>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{task.description}</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          <div>⏱️ <strong>Time:</strong> {task.startTime} - {task.endTime} ({task.duration} mins)</div>
                          <div>👤 <strong>Coordinator:</strong> {task.coordinator?.fullName || task.coordinator?.name || (task.coordinator ? 'Assigned' : 'Unassigned')}</div>
                          <div>📊 <strong>Progress:</strong> {task.progress || 0}%</div>
                        </div>

                        {/* Guidelines & Remarks */}
                        {(task.guidelines || task.remarks) && (
                          <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px dashed var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.825rem' }}>
                            {task.guidelines && (
                              <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '10px', borderRadius: '6px' }}>
                                <strong style={{ color: 'var(--accent-cyan)' }}>📌 Guidelines:</strong>
                                <p style={{ color: 'var(--text-main)', marginTop: '2px' }}>{task.guidelines}</p>
                              </div>
                            )}
                            {task.remarks && (
                              <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '10px', borderRadius: '6px' }}>
                                <strong style={{ color: 'var(--accent-amber)' }}>💬 Remarks:</strong>
                                <p style={{ color: 'var(--text-main)', marginTop: '2px' }}>{task.remarks}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JoinedEvents;
