import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import eventService from '../../services/eventService';
import { IconPlus, IconTrash, IconArrowLeft } from '../../components/common/Icons';
import Toast from '../../components/common/Toast';
import { DetailSkeleton } from '../../components/common/Skeleton';
import MapPicker from '../../components/common/MapPicker';

export const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [numberOfCoordinators, setNumberOfCoordinators] = useState(1);
  const [eventPlace, setEventPlace] = useState('');
  const [locationObj, setLocationObj] = useState({ address: '', latitude: null, longitude: null });
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: 'error' });

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEventById(id);
      if (res.success && res.data) {
        const ev = res.data;
        setEventName(ev.eventName || '');
        setEventDate(ev.eventDate ? new Date(ev.eventDate).toISOString().split('T')[0] : '');
        setStartTime(ev.startTime || '');
        setEndTime(ev.endTime || '');
        setNumberOfCoordinators(ev.numberOfCoordinators || 1);
        setEventPlace(ev.eventPlace || '');
        if (ev.location) {
          setLocationObj({
            address: ev.location.address || ev.eventPlace || '',
            latitude: ev.location.latitude || null,
            longitude: ev.location.longitude || null,
          });
        } else {
          setLocationObj({ address: ev.eventPlace || '', latitude: null, longitude: null });
        }
        setTasks(
          ev.tasks?.map((t) => ({
            _id: t._id,
            taskName: t.taskName || '',
            duration: t.duration || 30,
            description: t.description || '',
            priority: t.priority || 'MEDIUM',
            status: t.status || 'PENDING',
            guidelines: t.guidelines || '',
            remarks: t.remarks || '',
            progress: t.progress || 0,
            coordinator: t.coordinator?._id || t.coordinator || null,
          })) || []
        );
      }
    } catch (err) {
      setMsg({ text: 'Error loading event data for edit.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        taskName: '',
        duration: 30,
        description: '',
        priority: 'MEDIUM',
        status: 'PENDING',
        guidelines: '',
        remarks: '',
        progress: 0,
        coordinator: null,
      },
    ]);
  };

  const handleRemoveTask = (index) => {
    if (tasks.length <= 1) {
      setMsg({ text: 'At least one task is required.', type: 'error' });
      return;
    }
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: 'error' });

    const finalVenue = locationObj.address || eventPlace;

    if (!eventName.trim() || !eventDate || !startTime || !endTime || !finalVenue.trim()) {
      setMsg({ text: 'Please fill in all main event details.', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        eventName: eventName.trim(),
        eventDate,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        numberOfCoordinators: Number(numberOfCoordinators),
        eventPlace: finalVenue.trim(),
        location: {
          address: finalVenue.trim(),
          latitude: locationObj.latitude,
          longitude: locationObj.longitude,
        },
        tasks: tasks.map((t) => ({
          _id: t._id,
          taskName: t.taskName.trim(),
          duration: Number(t.duration),
          description: t.description ? t.description.trim() : '',
          priority: t.priority || 'MEDIUM',
          status: t.status || 'PENDING',
          guidelines: t.guidelines ? t.guidelines.trim() : '',
          remarks: t.remarks ? t.remarks.trim() : '',
          progress: Number(t.progress || 0),
          coordinator: t.coordinator || null,
        })),
      };

      const res = await eventService.updateEvent(id, payload);
      if (res.success) {
        setMsg({ text: 'Event updated successfully!', type: 'success' });
        setTimeout(() => {
          navigate(`/organizer/events/${id}`);
        }, 800);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update event.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Link to={`/organizer/events/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
        <IconArrowLeft size={16} /> Back to Event Details
      </Link>

      <div className="page-header">
        <div>
          <h1>Edit Event</h1>
          <p>Update event schedule, venue, and sub-task configurations.</p>
        </div>
      </div>

      <Toast message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: 'error' })} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Event Main Settings</h2>

          <div className="form-group">
            <label>Event Name</label>
            <input
              type="text"
              className="form-control"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
          </div>

          <div className="form-grid" style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label>Event Date</label>
              <input
                type="date"
                className="form-control"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Map Location Picker */}
          <div style={{ marginBottom: '20px' }}>
            <MapPicker
              location={locationObj}
              onChange={(loc) => {
                setLocationObj(loc);
                setEventPlace(loc.address);
              }}
              label="Event Venue / Location Search & Map Pin"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Start Time (HH:MM AM/PM)</label>
              <input
                type="text"
                className="form-control"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time (HH:MM AM/PM)</label>
              <input
                type="text"
                className="form-control"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Coordinators Limit</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={numberOfCoordinators}
                onChange={(e) => setNumberOfCoordinators(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Task List</h2>
            <button type="button" onClick={handleAddTask} className="secondary-btn">
              <IconPlus size={16} /> Add Task
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {tasks.map((task, idx) => (
              <div key={idx} style={{ padding: '20px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>TASK #{idx + 1}</span>
                  {tasks.length > 1 && (
                    <button type="button" onClick={() => handleRemoveTask(idx)} style={{ color: '#fda4af', padding: '2px' }}>
                      <IconTrash size={14} />
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Task Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={task.taskName}
                      onChange={(e) => handleTaskChange(idx, 'taskName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Duration (mins)</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={task.duration}
                      onChange={(e) => handleTaskChange(idx, 'duration', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      className="form-control"
                      value={task.priority}
                      onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={task.description}
                    onChange={(e) => handleTaskChange(idx, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="gradient-btn" style={{ padding: '14px' }} disabled={saving}>
          {saving ? 'Saving Event...' : 'Update Event Settings'}
        </button>
      </form>
    </div>
  );
};

export default EditEvent;
