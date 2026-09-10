import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { IconShield, IconBuilding, IconUsers, IconCalendar, IconChevronRight } from '../../components/common/Icons';
import CardSkeleton from '../../components/common/Skeleton';

export const AdminDashboard = () => {
  const [organizers, setOrganizers] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const [orgRes, userRes, evRes] = await Promise.all([
        adminService.getAllOrganizers(),
        adminService.getAllUsers(),
        adminService.getAllEvents(),
      ]);

      if (orgRes.success) setOrganizers(orgRes.data || []);
      if (userRes.success) setUsers(userRes.data || []);
      if (evRes.success) setEvents(evRes.data || []);
    } catch (err) {
      console.error('Admin metrics error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div className="badge badge-urgent" style={{ padding: '6px 12px', marginBottom: '12px' }}>
            <IconShield size={14} /> SYSTEM ADMINISTRATOR PORTAL
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '6px' }}>System Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Monitor accounts, toggle organizer/user access status, and audit system events.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginBottom: '36px',
        }}
      >
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', padding: '16px', borderRadius: '16px' }}>
            <IconBuilding size={32} />
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>REGISTERED ORGANIZERS</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{organizers.length}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '16px', borderRadius: '16px' }}>
            <IconUsers size={32} />
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>REGISTERED USERS</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{users.length}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', padding: '16px', borderRadius: '16px' }}>
            <IconCalendar size={32} />
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>SYSTEM EVENTS</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{events.length}</h2>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Organizer Management</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
            Inspect registered organizers, activate/deactivate accounts, or remove organization profiles.
          </p>
          <Link to="/admin/organizers" className="gradient-btn" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            Manage Organizers <IconChevronRight size={16} />
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>User Management</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
            View user profiles, monitor email verification states, and manage account statuses.
          </p>
          <Link to="/admin/users" className="gradient-btn" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            Manage Users <IconChevronRight size={16} />
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Event Catalog Audit</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
            Inspect system-wide events, examine task breakdowns, venues, and coordinator assignments.
          </p>
          <Link to="/admin/events" className="gradient-btn" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            Browse System Events <IconChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;