import React, { useState, useEffect } from 'react';
import organizerService from '../../services/organizerService';
import { useAuth } from '../../context/AuthContext';
import { IconBuilding, IconEye, IconEyeOff } from '../../components/common/Icons';
import Toast from '../../components/common/Toast';

export const OrganizerProfile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: 'error' });
  const [profileSaving, setProfileSaving] = useState(false);

  // Change password state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [passMsg, setPassMsg] = useState({ text: '', type: 'error' });
  const [passSaving, setPassSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await organizerService.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setFullName(res.data.fullName || '');
        setOrganizationName(res.data.organizationName || '');
        setPhone(res.data.phone || '');
      }
    } catch (err) {
      setProfileMsg({ text: 'Error loading organizer profile.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: 'error' });

    if (!fullName.trim() || !organizationName.trim() || !phone.trim()) {
      setProfileMsg({ text: 'Full name, organization name, and phone are required.', type: 'error' });
      return;
    }

    try {
      setProfileSaving(true);
      const res = await organizerService.updateProfile({
        fullName: fullName.trim(),
        organizationName: organizationName.trim(),
        phone: phone.trim(),
      });
      if (res.success) {
        setProfileMsg({ text: 'Organizer profile updated successfully!', type: 'success' });
        updateUser({
          fullName: res.data.fullName,
          organizationName: res.data.organizationName,
          phone: res.data.phone,
        });
        fetchProfile();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update organizer profile.';
      setProfileMsg({ text: msg, type: 'error' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: 'error' });

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setPassMsg({ text: 'All password fields are required.', type: 'error' });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    if (passwords.newPassword.length < 8) {
      setPassMsg({ text: 'New password must contain at least 8 characters.', type: 'error' });
      return;
    }

    try {
      setPassSaving(true);
      const res = await organizerService.changePassword(passwords);
      if (res.success) {
        setPassMsg({ text: 'Password changed successfully!', type: 'success' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      setPassMsg({ text: msg, type: 'error' });
    } finally {
      setPassSaving(false);
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: '300px', width: '100%' }}></div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header">
        <div>
          <h1>Organizer Account Settings</h1>
          <p>Update organization details and manage login credentials.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
        {/* Profile Form */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconBuilding size={20} className="gradient-text" /> Organization Details
          </h2>

          <Toast message={profileMsg.text} type={profileMsg.type} onClose={() => setProfileMsg({ text: '', type: 'error' })} />

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Organization Name</label>
              <input
                type="text"
                className="form-control"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Work Email Address (Read-only)</label>
              <input
                type="email"
                className="form-control"
                value={profile?.email || ''}
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', marginBottom: '24px' }}>
              <span className="badge badge-ongoing">Role: {profile?.role || 'ORGANIZER'}</span>
              <span className={profile?.isEmailVerified ? 'badge badge-completed' : 'badge badge-cancelled'}>
                {profile?.isEmailVerified ? 'Email Verified' : 'Unverified'}
              </span>
            </div>

            <button type="submit" className="gradient-btn" disabled={profileSaving}>
              {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Security & Password</h2>

          <Toast message={passMsg.text} type={passMsg.type} onClose={() => setPassMsg({ text: '', type: 'error' })} />

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                />
                <button type="button" className="password-toggle-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>New Password (min 8 chars)</label>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="secondary-btn" style={{ marginTop: '12px' }} disabled={passSaving}>
              {passSaving ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfile;
