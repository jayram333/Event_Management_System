import React from 'react';

export const StatusBadge = ({ status, type = 'event' }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  if (type === 'event') {
    const classMap = {
      DRAFT: 'badge-draft',
      UPCOMING: 'badge-upcoming',
      ONGOING: 'badge-ongoing',
      COMPLETED: 'badge-completed',
      CANCELLED: 'badge-cancelled',
    };
    return <span className={`badge ${classMap[normalized] || 'badge-draft'}`}>{normalized}</span>;
  }

  if (type === 'priority') {
    const classMap = {
      LOW: 'badge-low',
      MEDIUM: 'badge-medium',
      HIGH: 'badge-high',
      URGENT: 'badge-urgent',
    };
    return <span className={`badge ${classMap[normalized] || 'badge-medium'}`}>{normalized}</span>;
  }

  if (type === 'taskStatus') {
    const classMap = {
      PENDING: 'badge-draft',
      IN_PROGRESS: 'badge-ongoing',
      SUBMITTED_FOR_VERIFICATION: 'badge-medium',
      VERIFIED: 'badge-completed',
      COMPLETED: 'badge-completed',
      DELAYED: 'badge-urgent',
      CANCELLED: 'badge-cancelled',
    };
    const label = normalized === 'SUBMITTED_FOR_VERIFICATION' ? 'SUBMITTED FOR VERIFICATION' : normalized.replace(/_/g, ' ');
    return <span className={`badge ${classMap[normalized] || 'badge-draft'}`}>{label}</span>;
  }

  if (type === 'joinRequest') {
    const classMap = {
      PENDING: 'badge-ongoing',
      APPROVED: 'badge-completed',
      REJECTED: 'badge-cancelled',
    };
    return <span className={`badge ${classMap[normalized] || 'badge-draft'}`}>{normalized}</span>;
  }

  if (type === 'active') {
    return status ? (
      <span className="badge badge-completed">Active</span>
    ) : (
      <span className="badge badge-cancelled">Inactive</span>
    );
  }

  return <span className="badge badge-draft">{status}</span>;
};

export default StatusBadge;
