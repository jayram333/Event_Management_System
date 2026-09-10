import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconLogOut, IconUser, IconShield, IconBuilding } from '../common/Icons';
import NotificationCenter from '../common/NotificationCenter';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    if (role === 'ADMIN') return <span className="badge badge-urgent"><IconShield size={12} /> ADMIN</span>;
    if (role === 'ORGANIZER') return <span className="badge badge-ongoing"><IconBuilding size={12} /> ORGANIZER</span>;
    return <span className="badge badge-upcoming"><IconUser size={12} /> USER</span>;
  };

  const getUserName = () => {
    if (!user) return 'Guest';
    return user.fullName || user.name || user.email || 'User';
  };

  return (
    <header
      style={{
        height: '64px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
          className="mobile-menu-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              color: '#ffffff',
              fontSize: '1rem',
            }}
          >
            E
          </div>
          <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em' }} className="gradient-text">
            Event Management System
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <NotificationCenter />
        {getRoleBadge()}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              color: 'var(--primary)',
            }}
          >
            {getUserName().charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }} className="user-nav-details">
            <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)' }}>
              {getUserName()}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(244, 63, 94, 0.1)',
            color: '#fda4af',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
        >
          <IconLogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
