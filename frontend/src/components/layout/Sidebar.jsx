import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  IconCalendar,
  IconUsers,
  IconUser,
  IconPlus,
  IconCheckCircle,
  IconShield,
  IconBuilding,
  IconClock,
} from '../common/Icons';

export const Sidebar = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const getMenuItems = () => {
    if (role === 'ADMIN') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: IconShield },
        { label: 'Organizers', path: '/admin/organizers', icon: IconBuilding },
        { label: 'Users', path: '/admin/users', icon: IconUsers },
        { label: 'Events', path: '/admin/events', icon: IconCalendar },
        { label: 'Profile', path: '/admin/profile', icon: IconUser },
      ];
    }

    if (role === 'ORGANIZER') {
      return [
        { label: 'Dashboard', path: '/organizer/dashboard', icon: IconBuilding },
        { label: 'My Events', path: '/organizer/events', icon: IconCalendar },
        { label: 'Create Event', path: '/organizer/create-event', icon: IconPlus },
        { label: 'Join Requests', path: '/organizer/join-requests', icon: IconClock },
        { label: 'Coordinators', path: '/organizer/coordinators', icon: IconUsers },
        { label: 'Profile', path: '/organizer/profile', icon: IconUser },
      ];
    }

    // Default USER
    return [
      { label: 'Dashboard', path: '/user/dashboard', icon: IconUser },
      { label: 'Upcoming Events', path: '/user/upcoming-events', icon: IconCalendar },
      { label: 'Joined Events', path: '/user/joined-events', icon: IconCheckCircle },
      { label: 'Profile', path: '/user/profile', icon: IconUser },
    ];
  };

  const items = getMenuItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 95,
          }}
        />
      )}

      <aside
        style={{
          width: '260px',
          background: 'var(--bg-card-dark)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          transition: 'transform 0.3s ease',
          zIndex: 96,
        }}
        className={`sidebar-nav ${isOpen ? 'open' : ''}`}
      >
        <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
            NAVIGATION ({role})
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.925rem',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
