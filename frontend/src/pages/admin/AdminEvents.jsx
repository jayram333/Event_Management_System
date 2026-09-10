import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import eventService from '../../services/eventService';
import { IconSearch, IconCalendar, IconMapPin, IconEye, IconTrash, IconEdit, IconCheckCircle, IconClock } from '../../components/common/Icons';
import StatusBadge from '../../components/common/StatusBadge';
import { TableSkeleton } from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';

export const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [msg, setMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [detailModal, setDetailModal] = useState({ isOpen: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, eventId: null, eventName: '' });
  const [statusModal, setStatusModal] = useState({ isOpen: false, eventId: null, currentStatus: '' });
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllEvents();
      if (res.success) {
        setEvents(res.data || []);
      }
    } catch (err) {
      setMsg('Error loading system events.');
    } finally {
      setLoading(false);
    }
  };

  const openEventDetails = async (id) => {
    try {
      const res = await adminService.getEventById(id);
      if (res.success) {
        setDetailModal({ isOpen: true, data: res.data });
      }
    } catch (err) {
      setMsg('Error fetching event details.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteModal.eventId) return;
    setActionLoading(true);
    try {
      const res = await eventService.deleteEvent(deleteModal.eventId);
      if (res.success) {
        setSuccessMsg('Event deleted successfully.');
        setEvents((prev) => prev.filter((e) => e._id !== deleteModal.eventId));
        setDeleteModal({ isOpen: false, eventId: null, eventName: '' });
      } else {
        setMsg(res.message || 'Failed to delete event.');
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error deleting event.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModal.eventId || !newStatus) return;
    setActionLoading(true);
    try {
      const res = await eventService.updateEventStatus(statusModal.eventId, newStatus);
      if (res.success) {
        setSuccessMsg('Event status updated successfully.');
        fetchEvents();
        setStatusModal({ isOpen: false, eventId: null, currentStatus: '' });
      } else {
        setMsg(res.message || 'Failed to update status.');
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error updating status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyTaskAdmin = async (eventId, taskId) => {
    try {
      const res = await eventService.verifyTask(eventId, taskId, { status: 'VERIFIED' });
      if (res.success) {
        setSuccessMsg('Task verified successfully!');
        openEventDetails(eventId);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error verifying task.');
    }
  };

  const filtered = events.filter((e) => {
    const matchesStatus = filterStatus === 'ALL' || e.status === filterStatus;
    const matchesSearch =
      e.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.eventPlace?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.organizerId?.organizationName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>System Events Catalog</h1>
          <p>Inspect, edit, delete, and manage all organizer events across the platform.</p>
        </div>
      </div>

      <Toast message={msg} type="error" onClose={() => setMsg('')} />
      <Toast message={successMsg} type="success" onClose={() => setSuccessMsg('')} />

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
            placeholder="Search event, venue, or organizer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <IconCalendar size={48} />
          <h3>No System Events Found</h3>
          <p>No event records match your query.</p>
        </div>
      ) : (
        <div className="table-container" style={{ overflow: 'visible' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Organizer</th>
                <th>Date & Time</th>
                <th>Venue</th>
                <th>Coordinators</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event._id}>
                  <td style={{ fontWeight: '700' }}>{event.eventName}</td>
                  <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                    {event.organizerId?.organizationName || event.organizerId?.fullName || 'N/A'}
                  </td>
                  <td>
                    <div>{new Date(event.eventDate).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                      {event.startTime} - {event.endTime}
                    </div>
                  </td>
                  <td>{event.eventPlace}</td>
                  <td>{event.coordinators?.length || 0} / {event.numberOfCoordinators}</td>
                  <td><StatusBadge status={event.status} type="event" /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => openEventDetails(event._id)} className="secondary-btn" style={{ padding: '6px' }} title="Inspect & Manage Event">
                        <IconEye size={16} />
                      </button>
                      <Link to={`/admin/edit-event/${event._id}`} className="secondary-btn" style={{ padding: '6px' }} title="Edit Event Details">
                        <IconEdit size={16} />
                      </Link>
                      <button
                        onClick={() => {
                          setStatusModal({ isOpen: true, eventId: event._id, currentStatus: event.status });
                          setNewStatus(event.status);
                        }}
                        className="secondary-btn"
                        style={{ padding: '6px', color: 'var(--accent-amber)' }}
                        title="Update Event Status"
                      >
                        <IconClock size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, eventId: event._id, eventName: event.eventName })}
                        className="danger-btn"
                        style={{ padding: '6px' }}
                        title="Delete Event"
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

      {/* Admin Event Inspection & Management Modal */}
      <Modal isOpen={detailModal.isOpen} onClose={() => setDetailModal({ isOpen: false, data: null })} title="Admin Event Management" maxWidth="780px">
        {detailModal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.925rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>EVENT TITLE</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{detailModal.data.eventName}</h2>
              </div>
              <Link to={`/admin/edit-event/${detailModal.data._id}`} className="secondary-btn" style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconEdit size={14} /> Edit Event
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div><strong>Organizer:</strong> {detailModal.data.organizerId?.organizationName || detailModal.data.organizerId?.fullName}</div>
              <div><strong>Organizer Email:</strong> {detailModal.data.organizerId?.email}</div>
              <div><strong>Date:</strong> {new Date(detailModal.data.eventDate).toLocaleDateString()}</div>
              <div><strong>Time Window:</strong> {detailModal.data.startTime} - {detailModal.data.endTime}</div>
              <div>
                <strong>Venue:</strong> {detailModal.data.eventPlace}
                {detailModal.data.location?.latitude && (
                  <div style={{ marginTop: '4px' }}>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${detailModal.data.location.latitude}&mlon=${detailModal.data.location.longitude}#map=16/${detailModal.data.location.latitude}/${detailModal.data.location.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--primary)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <IconMapPin size={14} /> Open Location on Map
                    </a>
                  </div>
                )}
              </div>
              <div><strong>Status:</strong> <StatusBadge status={detailModal.data.status} type="event" /></div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Event Tasks Breakdown ({detailModal.data.tasks?.length || 0})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {detailModal.data.tasks?.map((t, i) => (
                  <div key={i} style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{t.taskName}</strong> ({t.duration} mins)
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.startTime} - {t.endTime}</div>
                      {t.coordinator && (
                        <div style={{ fontSize: '0.785rem', color: 'var(--primary)', marginTop: '2px' }}>
                          Assigned: {t.coordinator.fullName || t.coordinator.name || 'Coordinator'}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <StatusBadge status={t.priority} type="priority" />
                      <StatusBadge status={t.status} type="taskStatus" />
                      {t.status === 'SUBMITTED_FOR_VERIFICATION' && (
                        <button
                          onClick={() => handleVerifyTaskAdmin(detailModal.data._id, t._id)}
                          className="gradient-btn"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={statusModal.isOpen} onClose={() => setStatusModal({ isOpen: false, eventId: null, currentStatus: '' })} title="Update Event Status" maxWidth="420px">
        <form onSubmit={handleUpdateStatus}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Change the current operational status of this event.
          </p>
          <div className="form-group">
            <label htmlFor="adminEventStatus">Select Status</label>
            <select
              id="adminEventStatus"
              className="form-control"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="ONGOING">ONGOING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="secondary-btn" onClick={() => setStatusModal({ isOpen: false, eventId: null, currentStatus: '' })} disabled={actionLoading}>
              Cancel
            </button>
            <button type="submit" className="gradient-btn" disabled={actionLoading}>
              {actionLoading ? 'Updating...' : 'Save Status'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, eventId: null, eventName: '' })}
        onConfirm={handleDeleteEvent}
        title="Delete Event"
        message={`Are you sure you want to delete the event "${deleteModal.eventName}"? This action cannot be undone.`}
        confirmText="Delete Event"
        loading={actionLoading}
        danger={true}
      />
    </div>
  );
};

export default AdminEvents;
