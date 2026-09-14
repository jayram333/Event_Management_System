import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconXCircle } from './Icons';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = '600px' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          background: '#111827',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-muted)', transition: 'color 0.2s', padding: '4px' }}
          >
            <IconXCircle size={22} />
          </button>
        </div>
        <div style={{ padding: '24px', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
