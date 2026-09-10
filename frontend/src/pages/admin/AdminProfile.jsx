import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { IconShield } from '../../components/common/Icons';
import Toast from '../../components/common/Toast';

export const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await adminService.getProfile();
      if (res.success && res.data) {
        setAdmin(res.data);
      }
    } catch (err) {
      setMsg('Error fetching admin profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: '240px' }}></div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1>Admin Account Profile</h1>
          <p>System Administrator credentials & security privileges.</p>
        </div>
      </div>

      <Toast message={msg} type="error" onClose={() => setMsg('')} />

      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconShield size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{admin?.name || 'Administrator'}</h2>
            <span className="badge badge-urgent">System Administrator</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.95rem' }}>
          <div className="form-group">
            <label>Admin ID</label>
            <input type="text" className="form-control" value={admin?._id || ''} disabled style={{ opacity: 0.7 }} />
          </div>

          <div className="form-group">
            <label>Admin Email</label>
            <input type="email" className="form-control" value={admin?.email || ''} disabled style={{ opacity: 0.7 }} />
          </div>

          <div className="form-group">
            <label>Account Status</label>
            <input type="text" className="form-control" value={admin?.isActive ? 'Active Administrator' : 'Inactive'} disabled style={{ opacity: 0.7 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
