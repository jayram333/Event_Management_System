import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import eventService from '../../services/eventService';
import { joinEventRoom } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
  IconArrowLeft,
  IconBuilding,
  IconCheckCircle,
  IconAlertTriangle,
} from '../../components/common/Icons';
import StatusBadge from '../../components/common/StatusBadge';
import { DetailSkeleton } from '../../components/common/Skeleton';
import ConfirmModal from '../../components/common/ConfirmModal';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

export const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [joinRequest, setJoinRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: 'error' });

  // Submit task for verification state
  const [submitModal, setSubmitModal] = useState({ isOpen: false, taskId: null, taskName: '' });
  const [taskRemarks, setTaskRemarks] = useState('');

  const handleSubmitTaskForVerification = async (e) => {
    e.preventDefault();
    if (!submitModal.taskId) return;
    try {
      setActionLoading(true);
      const res = await eventService.submitTaskForVerification(id, submitModal.taskId, taskRemarks);
      if (res.success) {
        setMsg({ text: 'Task submitted for organizer/admin verification!', type: 'success' });
        setSubmitModal({ isOpen: false, taskId: null, taskName: '' });
        setTaskRemarks('');
        fetchData();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to submit task for verification.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    joinEventRoom(id);
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [evRes, reqRes] = await Promise.all([
        eventService.getEventById(id),
        eventService.getMyJoinRequest(id).catch(() => ({ success: false })),
      ]);

      if (evRes.success) setEvent(evRes.data);
      if (reqRes.success) setJoinRequest(reqRes.data);
    } catch (err) {
      setMsg({ text: 'Error loading event details.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      setActionLoading(true);
      const res = await eventService.sendJoinRequest(id);
      if (res.success) {
        setMsg({ text: 'Join request sent successfully!', type: 'success' });
        setJoinRequest(res.data);
        fetchData();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send join request.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    try {
      setActionLoading(true);
      const res = await eventService.leaveEvent(id);
      if (res.success) {
        setMsg({ text: 'You have left the event.', type: 'success' });
        setShowLeaveModal(false);
        setJoinRequest(null);
        fetchData();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to leave event.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  if (!event) {
    return (
      <div className="empty-state">
        <IconAlertTriangle size={48} />
        <h3>Event Not Found</h3>
        <Link to="/user/upcoming-events" className="gradient-btn" style={{ marginTop: '16px' }}>
          Back to Events
        </Link>
      </div>
    );
  }

  const isCoordinator = event.coordinators?.some(
    (c) => (c._id || c).toString() === user?.id?.toString()
  );
  const isFull = (event.coordinators?.length || 0) >= event.numberOfCoordinators;

  const renderJoinButton = () => {
    if (isCoordinator) {
      return (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="badge badge-completed" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <IconCheckCircle size={14} /> Approved Coordinator
          </span>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="danger-btn"
            style={{ padding: '8px 16px' }}
          >
            Leave Event
          </button>
        </div>
      );
    }

    if (joinRequest?.status === 'PENDING') {
      return (
        <span className="badge badge-ongoing" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          <IconClock size={14} /> Request Pending Approval
        </span>
      );
    }

    if (joinRequest?.status === 'REJECTED') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <span className="badge badge-cancelled" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Request Rejected
          </span>
          <button
            onClick={handleSendRequest}
            className="gradient-btn"
            disabled={actionLoading || isFull}
          >
            Re-submit Join Request
          </button>
        </div>
      );
    }

    if (isFull) {
      return (
        <span className="badge badge-urgent" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          Coordinator Limit Full
        </span>
      );
    }

    if (event.status !== 'UPCOMING') {
      return (
        <span className="badge badge-draft" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          Event Not Open for Joining
        </span>
      );
    }

    return (
      <button
        onClick={handleSendRequest}
        className="gradient-btn"
        style={{ padding: '10px 24px' }}
        disabled={actionLoading}
      >
        {actionLoading ? 'Sending...' : 'Request to Join as Coordinator'}
      </button>
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <Link to="/user/upcoming-events" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <IconArrowLeft size={16} /> Back to Events
      </Link>

      <Toast message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: 'error' })} />

      {/* Main Banner Header */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <StatusBadge status={event.status} type="event" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <IconBuilding size={14} /> {event.organizerId?.organizationName || event.organizerId?.fullName || 'Organizer'}
              </span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>{event.eventName}</h1>
          </div>

          <div>{renderJoinButton()}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>EVENT DATE</span>
            <p style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconCalendar size={18} style={{ color: 'var(--primary)' }} />
              {new Date(event.eventDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>TIME SCHEDULE</span>
            <p style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconClock size={18} style={{ color: 'var(--accent-cyan)' }} />
              {event.startTime} - {event.endTime}
            </p>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>VENUE / LOCATION</span>
            <p style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <IconMapPin size={18} style={{ color: 'var(--accent-rose)' }} />
              {event.eventPlace || event.location?.address || 'N/A'}
              {event.location?.latitude && event.location?.longitude && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${event.location.latitude}&mlon=${event.location.longitude}#map=16/${event.location.latitude}/${event.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'underline', marginLeft: '4px' }}
                >
                  View Map ↗
                </a>
              )}
            </p>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>COORDINATOR CAPACITY</span>
            <p style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconUsers size={18} style={{ color: 'var(--accent-emerald)' }} />
              {event.coordinators?.length || 0} / {event.numberOfCoordinators} Approved
            </p>
          </div>
        </div>
      </div>

      {/* Task Schedule Breakdown */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '20px' }}>Event Tasks Itinerary</h2>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Time Window</th>
                <th>Duration</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Coordinator</th>
                {isCoordinator && <th>My Action</th>}
              </tr>
            </thead>
            <tbody>
              {event.tasks?.map((task, idx) => {
                const isMyTask = task.coordinator?._id?.toString() === user?.id?.toString() || task.coordinator?.toString() === user?.id?.toString();
                return (
                  <tr key={task._id || idx}>
                    <td style={{ fontWeight: '700' }}>
                      {task.taskName}
                      {task.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '400', marginTop: '2px' }}>
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td>{task.startTime} - {task.endTime}</td>
                    <td>{task.duration} mins</td>
                    <td><StatusBadge status={task.priority} type="priority" /></td>
                    <td><StatusBadge status={task.status} type="taskStatus" /></td>
                    <td style={{ color: task.coordinator ? 'var(--text-main)' : 'var(--text-dim)' }}>
                      {task.coordinator?.fullName || task.coordinator?.name || (task.coordinator ? 'Assigned' : 'Unassigned')}
                    </td>
                    {isCoordinator && (
                      <td>
                        {isMyTask ? (
                          task.status === 'VERIFIED' || task.status === 'COMPLETED' ? (
                            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>Verified ✓</span>
                          ) : task.status === 'SUBMITTED_FOR_VERIFICATION' ? (
                            <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>Awaiting Verification</span>
                          ) : (
                            <button
                              onClick={() => setSubmitModal({ isOpen: true, taskId: task._id, taskName: task.taskName })}
                              className="gradient-btn"
                              style={{ padding: '4px 10px', fontSize: '0.785rem' }}
                            >
                              Submit for Verification
                            </button>
                          )
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>-</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Task for Verification Modal */}
      <Modal
        isOpen={submitModal.isOpen}
        onClose={() => setSubmitModal({ isOpen: false, taskId: null, taskName: '' })}
        title={`Submit Task "${submitModal.taskName}" for Verification`}
      >
        <form onSubmit={handleSubmitTaskForVerification}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Notify the Organizer and Admin that this task has been completed and is ready for verification.
          </p>
          <div className="form-group">
            <label>Completion Remarks / Notes (Optional)</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="e.g. Stage lighting setup completed and tested..."
              value={taskRemarks}
              onChange={(e) => setTaskRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setSubmitModal({ isOpen: false, taskId: null, taskName: '' })}
            >
              Cancel
            </button>
            <button type="submit" className="gradient-btn" disabled={actionLoading}>
              {actionLoading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveEvent}
        title="Leave Event"
        message="Are you sure you want to leave this event? You will be removed from all assigned tasks."
        confirmText="Leave Event"
        loading={actionLoading}
      />
    </div>
  );
};

export default EventDetails;
