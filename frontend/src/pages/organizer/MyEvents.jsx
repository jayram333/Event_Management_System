import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../../services/eventService';
import {
  IconSearch,
  IconPlus,
  IconCalendar,
  IconMapPin,
  IconTrash,
  IconEdit,
  IconEye,
  IconUsers,
} from '../../components/common/Icons';
import StatusBadge from '../../components/common/StatusBadge';
import { TableSkeleton } from '../../components/common/Skeleton';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';

export const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [msg, setMsg] = useState({ text: '', type: 'error' });

  // Delete modal state
  const [deleteEventId, setDeleteEventId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      setMsg({ text: 'Error fetching organizer events.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      const res = await eventService.updateEventStatus(eventId, newStatus);
      if (res.success) {
        setMsg({ text: `Event status updated to ${newStatus}`, type: 'success' });
        fetchEvents();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update event status.';
      setMsg({ text: errorMsg, type: 'error' });
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteEventId) return;
    try {
      setDeleteLoading(true);
      const res = await eventService.deleteEvent(deleteEventId);
      if (res.success) {
        setMsg({ text: 'Event deleted successfully.', type: 'success' });
        setDeleteEventId(null);
        fetchEvents();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete event.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesStatus = filterStatus === 'ALL' || e.status === filterStatus;
    const matchesSearch =
      e.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.eventPlace?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>My Events Catalog</h1>
          <p>Manage, publish, edit, and track status transitions across your organized events.</p>
        </div>
        <Link to="/organizer/create-event" className="gradient-btn">
          <IconPlus size={18} /> Create Event
        </Link>
      </div>

      <Toast message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: 'error' })} />

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: filterStatus === st ? '#ffffff' : 'var(--text-muted)',
                background: filterStatus === st ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.2s',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#161e2e', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', minWidth: '240px' }}>
          <IconSearch size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search events or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <IconCalendar size={48} />
          <h3>No Events Found</h3>
          <p>{searchTerm || filterStatus !== 'ALL' ? 'No events match your search/filter.' : 'You have not created any events yet.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date & Time</th>
                <th>Venue</th>
                <th>Coordinators</th>
                <th>Tasks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event._id}>
                  <td style={{ fontWeight: '700' }}>
                    <Link to={`/organizer/events/${event._id}`} style={{ color: 'var(--text-main)' }}>
                      {event.eventName}
                    </Link>
                  </td>
                  <td>
                    <div>{new Date(event.eventDate).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                      {event.startTime} - {event.endTime}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconMapPin size={14} style={{ color: 'var(--accent-rose)' }} />
                      {event.eventPlace}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {event.coordinators?.length || 0} / {event.numberOfCoordinators}
                    </span>
                  </td>
                  <td>{event.tasks?.length || 0} Tasks</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <StatusBadge status={event.status} type="event" />
                      {/* Status Transition Select Dropdown */}
                      <select
                        value={event.status}
                        onChange={(e) => handleStatusChange(event._id, e.target.value)}
                        style={{
                          background: '#161e2e',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        {event.status === 'DRAFT' && <option value="DRAFT">DRAFT</option>}
                        {event.status === 'DRAFT' && <option value="UPCOMING">UPCOMING</option>}
                        {event.status === 'UPCOMING' && <option value="UPCOMING">UPCOMING</option>}
                        {event.status === 'UPCOMING' && <option value="ONGOING">ONGOING</option>}
                        {event.status === 'ONGOING' && <option value="ONGOING">ONGOING</option>}
                        {event.status === 'ONGOING' && <option value="COMPLETED">COMPLETED</option>}
                        {event.status !== 'COMPLETED' && event.status !== 'CANCELLED' && (
                          <option value="CANCELLED">CANCELLED</option>
                        )}
                        {event.status === 'COMPLETED' && <option value="COMPLETED">COMPLETED</option>}
                        {event.status === 'CANCELLED' && <option value="CANCELLED">CANCELLED</option>}
                      </select>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/organizer/events/${event._id}`} className="secondary-btn" style={{ padding: '6px', title: 'View Details' }}>
                        <IconEye size={16} />
                      </Link>
                      <Link to={`/organizer/edit-event/${event._id}`} className="secondary-btn" style={{ padding: '6px', title: 'Edit Event' }}>
                        <IconEdit size={16} />
                      </Link>
                      <button
                        onClick={() => setDeleteEventId(event._id)}
                        className="danger-btn"
                        style={{ padding: '6px', title: 'Delete Event' }}
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteEventId}
        onClose={() => setDeleteEventId(null)}
        onConfirm={handleDeleteEvent}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action will permanently delete all associated task records."
        confirmText="Delete Event"
        loading={deleteLoading}
      />
    </div>
  );
};

export default MyEvents;
