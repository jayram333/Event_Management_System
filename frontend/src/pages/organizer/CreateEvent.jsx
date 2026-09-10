import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import eventService from '../../services/eventService';
import { IconPlus, IconTrash, IconArrowLeft, IconClock, IconCalendar, IconMapPin, IconUsers } from '../../components/common/Icons';
import Toast from '../../components/common/Toast';
import MapPicker from '../../components/common/MapPicker';

export const CreateEvent = () => {
  const navigate = useNavigate();

  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [numberOfCoordinators, setNumberOfCoordinators] = useState(5);
  const [eventPlace, setEventPlace] = useState('');
  const [locationObj, setLocationObj] = useState({ address: '', latitude: null, longitude: null });

  // Tasks list (minimum 1 task)
  const [tasks, setTasks] = useState([
    {
      taskName: 'Welcome & Registration Desk',
      duration: 60,
      description: 'Check-in attendees and distribute badge kits.',
      priority: 'HIGH',
      guidelines: 'Ensure QR scanner is active.',
      remarks: '',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: 'error' });

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        taskName: '',
        duration: 30,
        description: '',
        priority: 'MEDIUM',
        guidelines: '',
        remarks: '',
      },
    ]);
  };

  const handleRemoveTask = (index) => {
    if (tasks.length <= 1) {
      setMsg({ text: 'At least one task is required for an event.', type: 'error' });
      return;
    }
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);
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

    if (Number(numberOfCoordinators) < 1) {
      setMsg({ text: 'Number of coordinators must be at least 1.', type: 'error' });
      return;
    }

    if (tasks.length === 0) {
      setMsg({ text: 'At least one task is required.', type: 'error' });
      return;
    }

    for (let i = 0; i < tasks.length; i++) {
      if (!tasks[i].taskName.trim()) {
        setMsg({ text: `Task ${i + 1} must have a valid name.`, type: 'error' });
        return;
      }
      if (!tasks[i].duration || Number(tasks[i].duration) <= 0) {
        setMsg({ text: `Task ${i + 1} (${tasks[i].taskName}) must have a valid duration in minutes.`, type: 'error' });
        return;
      }
    }

    try {
      setLoading(true);
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
          taskName: t.taskName.trim(),
          duration: Number(t.duration),
          description: t.description ? t.description.trim() : '',
          priority: t.priority || 'MEDIUM',
          guidelines: t.guidelines ? t.guidelines.trim() : '',
          remarks: t.remarks ? t.remarks.trim() : '',
        })),
      };

      const res = await eventService.createEvent(payload);
      if (res.success) {
        setMsg({ text: 'Event created successfully!', type: 'success' });
        setTimeout(() => {
          navigate('/organizer/events');
        }, 800);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create event.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/organizer/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
        <IconArrowLeft size={16} /> Back to My Events
      </Link>

      <div className="page-header">
        <div>
          <h1>Create New Event</h1>
          <p>Define event parameters and sequence sub-tasks with priority levels.</p>
        </div>
      </div>

      <Toast message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: 'error' })} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Main Details Card */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>1. General Event Details</h2>

          <div className="form-group">
            <label htmlFor="eventName">Event Name</label>
            <input
              id="eventName"
              type="text"
              className="form-control"
              placeholder="e.g. Annual Developer Summit 2026"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
          </div>

          <div className="form-grid" style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="eventDate"><IconCalendar size={14} /> Event Date</label>
              <input
                id="eventDate"
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
              <label htmlFor="startTime"><IconClock size={14} /> Start Time (HH:MM AM/PM)</label>
              <input
                id="startTime"
                type="text"
                className="form-control"
                placeholder="09:00 AM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime"><IconClock size={14} /> End Time (HH:MM AM/PM)</label>
              <input
                id="endTime"
                type="text"
                className="form-control"
                placeholder="05:00 PM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="numberOfCoordinators"><IconUsers size={14} /> Coordinator Capacity</label>
              <input
                id="numberOfCoordinators"
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

        {/* Dynamic Task Builder */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>2. Event Tasks Builder</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                Add sub-tasks. Start & end times will be calculated automatically based on duration.
              </p>
            </div>
            <button type="button" onClick={handleAddTask} className="secondary-btn" style={{ padding: '8px 16px' }}>
              <IconPlus size={16} /> Add Task
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {tasks.map((task, idx) => (
              <div
                key={idx}
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                    TASK #{idx + 1}
                  </span>
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      style={{ color: '#fda4af', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                    >
                      <IconTrash size={14} /> Remove
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Task Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Task Title"
                      value={task.taskName}
                      onChange={(e) => handleTaskChange(idx, 'taskName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Duration (Minutes)</label>
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
                    placeholder="Brief description of task responsibilities..."
                    value={task.description}
                    onChange={(e) => handleTaskChange(idx, 'description', e.target.value)}
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Guidelines / Instructions</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Special instructions for coordinators..."
                      value={task.guidelines}
                      onChange={(e) => handleTaskChange(idx, 'guidelines', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Remarks</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Additional notes..."
                      value={task.remarks}
                      onChange={(e) => handleTaskChange(idx, 'remarks', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="gradient-btn" style={{ padding: '14px', fontSize: '1rem' }} disabled={loading}>
          {loading ? 'Creating Event...' : 'Publish Event & Tasks'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
