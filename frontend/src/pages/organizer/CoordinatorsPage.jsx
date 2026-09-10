import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../../services/eventService';
import { IconUsers, IconUser, IconCalendar } from '../../components/common/Icons';
import { TableSkeleton } from '../../components/common/Skeleton';
import Toast from '../../components/common/Toast';

export const CoordinatorsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await eventService.getOrganizerEvents();
      if (res.success) {
        setEvents(res.data || []);
      }
    } catch (err) {
      setMsg('Unable to fetch coordinators data.');
    } finally {
      setLoading(false);
    }
  };

  const coordinatorList = [];
  events.forEach((ev) => {
    ev.coordinators?.forEach((c) => {
      coordinatorList.push({
        eventId: ev._id,
        eventName: ev.eventName,
        coordinator: c,
      });
    });
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Active Coordinators Roster</h1>
          <p>View all approved team coordinators and their assigned event operations.</p>
        </div>
      </div>

      <Toast message={msg} type="error" onClose={() => setMsg('')} />

      {loading ? (
        <TableSkeleton rows={5} />
      ) : coordinatorList.length === 0 ? (
        <div className="empty-state">
          <IconUsers size={48} />
          <h3>No Approved Coordinators Found</h3>
          <p>Approved coordinators for your events will appear here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Coordinator Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Assigned Event</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {coordinatorList.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconUser size={16} style={{ color: 'var(--primary)' }} />
                      {item.coordinator?.fullName || 'Coordinator'}
                    </div>
                  </td>
                  <td>{item.coordinator?.email}</td>
                  <td>{item.coordinator?.phone || 'N/A'}</td>
                  <td>
                    <Link to={`/organizer/events/${item.eventId}`} style={{ color: 'var(--primary)', fontWeight: '700' }}>
                      {item.eventName}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/organizer/events/${item.eventId}`} className="secondary-btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                      View Event
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CoordinatorsPage;
