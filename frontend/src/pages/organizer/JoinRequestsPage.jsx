import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../../services/eventService';
import { IconClock, IconCheck, IconXCircle, IconCalendar } from '../../components/common/Icons';
import StatusBadge from '../../components/common/StatusBadge';
import { TableSkeleton } from '../../components/common/Skeleton';
import Toast from '../../components/common/Toast';

export const JoinRequestsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: 'error' });

  useEffect(() => {
    fetchEventsWithRequests();
  }, []);

  const fetchEventsWithRequests = async () => {
    try {
      setLoading(true);
      const res = await eventService.getOrganizerEvents();
      if (res.success) {
        setEvents(res.data || []);
      }
    } catch (err) {
      setMsg({ text: 'Error loading join requests.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId, userId) => {
    try {
      const res = await eventService.approveJoinRequest(eventId, userId);
      if (res.success) {
        setMsg({ text: 'Join request approved successfully!', type: 'success' });
        fetchEventsWithRequests();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to approve request.';
      setMsg({ text: errorMsg, type: 'error' });
    }
  };

  const handleReject = async (eventId, userId) => {
    try {
      const res = await eventService.rejectJoinRequest(eventId, userId);
      if (res.success) {
        setMsg({ text: 'Join request rejected.', type: 'success' });
        fetchEventsWithRequests();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reject request.';
      setMsg({ text: errorMsg, type: 'error' });
    }
  };

  // Flatten all pending requests across events
  const pendingRequests = [];
  events.forEach((ev) => {
    ev.joinRequests?.forEach((req) => {
      if (req.status === 'PENDING') {
        pendingRequests.push({
          eventId: ev._id,
          eventName: ev.eventName,
          reqId: req._id,
          user: req.user,
          requestedAt: req.requestedAt,
        });
      }
    });
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Join Requests Management</h1>
          <p>Review and act upon incoming coordinator join applications across all your events.</p>
        </div>
      </div>

      <Toast message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: 'error' })} />

      {loading ? (
        <TableSkeleton rows={5} />
      ) : pendingRequests.length === 0 ? (
        <div className="empty-state">
          <IconClock size={48} />
          <h3>No Pending Join Requests</h3>
          <p>There are currently no coordinator applications awaiting your decision.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Target Event</th>
                <th>Requested At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((item, idx) => (
                <tr key={item.reqId || idx}>
                  <td style={{ fontWeight: '700' }}>
                    {item.user?.fullName || item.user?.name || (typeof item.user === 'object' ? 'Unknown User' : 'User')}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '400' }}>
                      {item.user?.email ? `${item.user.email}${item.user.phone ? ` • ${item.user.phone}` : ''}` : ''}
                    </div>
                  </td>
                  <td>
                    <Link to={`/organizer/events/${item.eventId}`} style={{ color: 'var(--primary)', fontWeight: '700' }}>
                      {item.eventName}
                    </Link>
                  </td>
                  <td>{new Date(item.requestedAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleApprove(item.eventId, item.user?._id || item.user)}
                        className="gradient-btn"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <IconCheck size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(item.eventId, item.user?._id || item.user)}
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
  );
};

export default JoinRequestsPage;
