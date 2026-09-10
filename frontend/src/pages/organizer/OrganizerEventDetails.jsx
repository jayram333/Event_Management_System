import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import eventService from '../../services/eventService';
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
  IconArrowLeft,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconXCircle,
  IconUser,
} from '../../components/common/Icons';
import StatusBadge from '../../components/common/StatusBadge';
import { DetailSkeleton } from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';

export const OrganizerEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [coordinators, setCoordinators] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: 'error' });

  // Reschedule / Extend task modal state
  const [extendModal, setExtendModal] = useState({ isOpen: false, taskId: null, taskName: '' });
  const [extensionMinutes, setExtensionMinutes] = useState(15);

  // Assign task modal state
  const [assignModal, setAssignModal] = useState({ isOpen: false, taskId: null, taskName: '' });
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState('');

  const handleVerifyTask = async (taskId) => {
    try {
      setActionLoading(true);
      const res = await eventService.verifyTask(id, taskId);
      if (res.success) {
        setMsg({ text: 'Task verified successfully!', type: 'success' });
        fetchAllData();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to verify task.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!extendModal.taskId || !extensionMinutes) return;
    try {
      setActionLoading(true);
      const res = await eventService.rescheduleEventTasks(id, extendModal.taskId, { extensionMinutes: parseInt(extensionMinutes, 10) });
      if (res.success) {
        setMsg({ text: res.message || 'Task extended and downstream schedule shifted!', type: 'success' });
        setExtendModal({ isOpen: false, taskId: null, taskName: '' });
        fetchAllData();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reschedule tasks.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Task edit modal state
  const [editTaskModal, setEditTaskModal] = useState({ isOpen: false, task: null });
  const [taskForm, setTaskForm] = useState({
    taskName: '',
    duration: 30,
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    guidelines: '',
    remarks: '',
    progress: 0,
  });

  // Delete confirmations
  const [deleteEventModal, setDeleteEventModal] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [evRes, coordRes, reqRes] = await Promise.all([
        eventService.getEventById(id),
        eventService.getEventCoordinators(id).catch(() => ({ success: false, data: [] })),
        eventService.getJoinRequests(id).catch(() => ({ success: false, data: [] })),
      ]);

      if (evRes.success) setEvent(evRes.data);
      if (coordRes.success) setCoordinators(coordRes.data || []);
      if (reqRes.success) setJoinRequests(reqRes.data || []);
    } catch (err) {
      setMsg({ text: 'Error loading event management data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (userId) => {
    try {
      const res = await eventService.approveJoinRequest(id, userId);
      if (res.success) {
        setMsg({ text: 'Join request approved!', type: 'success' });
        fetchAllData();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to approve request.';
      setMsg({ text: errorMsg, type: 'error' });
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      const res = await eventService.rejectJoinRequest(id, userId);
      if (res.success) {
        setMsg({ text: 'Join request rejected.', type: 'success' });
        fetchAllData();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reject request.';
      setMsg({ text: errorMsg, type: 'error' });
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCoordinatorId) return;
    try {
      setActionLoading(true);
      const res = await eventService.assignCoordinatorToTask(id, assignModal.taskId, selectedCoordinatorId);
      if (res.success) {
        setMsg({ text: 'Coordinator assigned to task!', type: 'success' });
        setAssignModal({ isOpen: false, taskId: null, taskName: '' });
        fetchAllData();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to assign coordinator.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const openEditTask = (task) => {
    setEditTaskModal({ isOpen: true, task });
    setTaskForm({
      taskName: task.taskName || '',
      duration: task.duration || 30,
      description: task.description || '',
      priority: task.priority || 'MEDIUM',
      status: task.status || 'PENDING',
      guidelines: task.guidelines || '',
      remarks: task.remarks || '',
      progress: task.progress || 0,
    });
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await eventService.updateTask(id, editTaskModal.task._id, taskForm);
      if (res.success) {
        setMsg({ text: 'Task updated successfully!', type: 'success' });
        setEditTaskModal({ isOpen: false, task: null });
        fetchAllData();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update task.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    try {
      setActionLoading(true);
      const res = await eventService.deleteTask(id, deleteTaskId);
      if (res.success) {
        setMsg({ text: 'Task deleted successfully.', type: 'success' });
        setDeleteTaskId(null);
        fetchAllData();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete task.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      setActionLoading(true);
      const res = await eventService.deleteEvent(id);
      if (res.success) {
        navigate('/organizer/events');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete event.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!event) return <div>Event not found.</div>;

  const pendingRequests = joinRequests.filter((r) => r.status === 'PENDING');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Link to="/organizer/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <IconArrowLeft size={16} /> Back to My Events
      </Link>

      <Toast message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: 'error' })} />

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <StatusBadge status={event.status} type="event" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Event ID: {event._id}</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>{event.eventName}</h1>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to={`/organizer/edit-event/${event._id}`} className="secondary-btn">
              <IconEdit size={16} /> Edit Event
            </Link>
            <button onClick={() => setDeleteEventModal(true)} className="danger-btn">
              <IconTrash size={16} /> Delete Event
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>DATE</span>
            <p style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px' }}>
              <IconCalendar size={16} style={{ display: 'inline', marginRight: '6px' }} />
              {new Date(event.eventDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>TIME</span>
            <p style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px' }}>
              <IconClock size={16} style={{ display: 'inline', marginRight: '6px' }} />
              {event.startTime} - {event.endTime}
            </p>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>VENUE</span>
            <p style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px' }}>
              <IconMapPin size={16} style={{ display: 'inline', marginRight: '6px' }} />
              {event.eventPlace || event.location?.address || 'N/A'}
              {event.location?.latitude && event.location?.longitude && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${event.location.latitude}&mlon=${event.location.longitude}#map=16/${event.location.latitude}/${event.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginLeft: '8px', color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'underline' }}
                >
                  View Map ↗
                </a>
              )}
            </p>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>COORDINATORS</span>
            <p style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px' }}>
              <IconUsers size={16} style={{ display: 'inline', marginRight: '6px' }} />
              {coordinators.length} / {event.numberOfCoordinators} Approved
            </p>
          </div>
        </div>
      </div>

      {/* Pending Join Requests Section */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconClock size={20} className="gradient-text" /> Pending Join Applications ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending coordinator join requests for this event.</p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Requested Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req) => (
                  <tr key={req._id || req.user?._id}>
                    <td style={{ fontWeight: '700' }}>{req.user?.fullName || 'User'}</td>
                    <td>{req.user?.email}</td>
                    <td>{req.user?.phone || 'N/A'}</td>
                    <td>{new Date(req.requestedAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleApproveRequest(req.user?._id)}
                          className="gradient-btn"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <IconCheck size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req.user?._id)}
                          className="danger-btn"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <IconXCircle size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approved Coordinators */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconUsers size={20} className="gradient-text" /> Approved Coordinators ({coordinators.length})
        </h2>

        {coordinators.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No coordinators have been approved yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {coordinators.map((c) => (
              <div key={c._id} style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700' }}>
                  {c.fullName?.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{c.fullName}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.email}</p>
                  <p style={{ fontSize: '0.785rem', color: 'var(--text-dim)' }}>{c.phone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks Breakdown & Assignment */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Event Tasks & Assignments</h2>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Time Window</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Coordinator</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {event.tasks?.map((task) => (
                <tr key={task._id}>
                  <td style={{ fontWeight: '700' }}>
                    {task.taskName}
                    {task.description && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '400' }}>
                        {task.description}
                      </div>
                    )}
                  </td>
                  <td>{task.startTime} - {task.endTime}</td>
                  <td><StatusBadge status={task.priority} type="priority" /></td>
                  <td><StatusBadge status={task.status} type="taskStatus" /></td>
                  <td style={{ fontWeight: 600 }}>
                    {task.coordinator?.fullName || task.coordinator?.name || (
                      <span style={{ color: 'var(--text-dim)' }}>Unassigned</span>
                    )}
                  </td>
                  <td>{task.progress || 0}%</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {task.status === 'SUBMITTED_FOR_VERIFICATION' && (
                        <button
                          onClick={() => handleVerifyTask(task._id)}
                          className="gradient-btn"
                          style={{ padding: '4px 8px', fontSize: '0.785rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                          title="Verify Task Completion"
                        >
                          <IconCheck size={14} /> Verify
                        </button>
                      )}
                      <button
                        onClick={() => setExtendModal({ isOpen: true, taskId: task._id, taskName: task.taskName })}
                        className="secondary-btn"
                        style={{ padding: '4px 8px', fontSize: '0.785rem' }}
                        title="Extend Task Duration & Auto-Shift Schedule"
                      >
                        Extend
                      </button>
                      <button
                        onClick={() => {
                          setAssignModal({ isOpen: true, taskId: task._id, taskName: task.taskName });
                          setSelectedCoordinatorId(task.coordinator?._id || '');
                        }}
                        className="gradient-btn"
                        style={{ padding: '4px 8px', fontSize: '0.785rem' }}
                      >
                        Assign
                      </button>
                      <button onClick={() => openEditTask(task)} className="secondary-btn" style={{ padding: '4px 8px' }}>
                        <IconEdit size={14} />
                      </button>
                      <button onClick={() => setDeleteTaskId(task._id)} className="danger-btn" style={{ padding: '4px 8px' }}>
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extend / Reschedule Task Modal */}
      <Modal
        isOpen={extendModal.isOpen}
        onClose={() => setExtendModal({ isOpen: false, taskId: null, taskName: '' })}
        title={`Extend Duration for "${extendModal.taskName}"`}
      >
        <form onSubmit={handleExtendSubmit}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Extending this task will automatically push back the start and end times of all subsequent sequential tasks in this event.
          </p>
          <div className="form-group">
            <label>Extension Minutes</label>
            <input
              type="number"
              min="1"
              max="240"
              className="form-control"
              value={extensionMinutes}
              onChange={(e) => setExtensionMinutes(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setExtendModal({ isOpen: false, taskId: null, taskName: '' })}
            >
              Cancel
            </button>
            <button type="submit" className="gradient-btn" disabled={actionLoading}>
              {actionLoading ? 'Rescheduling...' : 'Extend & Auto-Shift Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Assignment Modal */}
      <Modal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ isOpen: false, taskId: null, taskName: '' })}
        title={`Assign Coordinator to "${assignModal.taskName}"`}
      >
        <form onSubmit={handleAssignSubmit}>
          <div className="form-group">
            <label>Select Approved Coordinator</label>
            <select
              className="form-control"
              value={selectedCoordinatorId}
              onChange={(e) => setSelectedCoordinatorId(e.target.value)}
              required
            >
              <option value="">-- Choose Approved Coordinator --</option>
              {coordinators.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setAssignModal({ isOpen: false, taskId: null, taskName: '' })}
            >
              Cancel
            </button>
            <button type="submit" className="gradient-btn" disabled={actionLoading}>
              {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Edit Modal */}
      <Modal
        isOpen={editTaskModal.isOpen}
        onClose={() => setEditTaskModal({ isOpen: false, task: null })}
        title="Edit Task Details"
      >
        <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Task Name</label>
            <input
              type="text"
              className="form-control"
              value={taskForm.taskName}
              onChange={(e) => setTaskForm({ ...taskForm, taskName: e.target.value })}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Duration (mins)</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={taskForm.duration}
                onChange={(e) => setTaskForm({ ...taskForm, duration: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-control"
                value={taskForm.progress}
                onChange={(e) => setTaskForm({ ...taskForm, progress: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Priority</label>
              <select
                className="form-control"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                className="form-control"
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="DELAYED">DELAYED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Guidelines</label>
            <input
              type="text"
              className="form-control"
              value={taskForm.guidelines}
              onChange={(e) => setTaskForm({ ...taskForm, guidelines: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <input
              type="text"
              className="form-control"
              value={taskForm.remarks}
              onChange={(e) => setTaskForm({ ...taskForm, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setEditTaskModal({ isOpen: false, task: null })}
            >
              Cancel
            </button>
            <button type="submit" className="gradient-btn" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Task Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modals */}
      <ConfirmModal
        isOpen={deleteEventModal}
        onClose={() => setDeleteEventModal(false)}
        onConfirm={handleDeleteEvent}
        title="Delete Entire Event"
        message="Are you sure you want to permanently delete this event? This action cannot be undone."
        loading={actionLoading}
      />

      <ConfirmModal
        isOpen={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task from the event itinerary?"
        loading={actionLoading}
      />
    </div>
  );
};

export default OrganizerEventDetails;
