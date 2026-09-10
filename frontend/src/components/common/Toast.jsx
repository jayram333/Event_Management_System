import React from 'react';
import { IconCheckCircle, IconXCircle, IconAlertTriangle } from './Icons';

export const Toast = ({ message, type = 'error', onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className="animate-fade-in"
      style={{
        padding: '12px 16px',
        borderRadius: 'var(--radius-sm)',
        background: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
        border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
        color: isSuccess ? '#6ee7b7' : '#fda4af',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        fontSize: '0.9rem',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isSuccess ? <IconCheckCircle size={18} /> : <IconAlertTriangle size={18} />}
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} style={{ color: 'inherit', opacity: 0.7, padding: '2px' }}>
          <IconXCircle size={16} />
        </button>
      )}
    </div>
  );
};

export default Toast;
