import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconEye, IconEyeOff, IconArrowLeft, IconShield, IconUser, IconBuilding } from '../../components/common/Icons';
import Toast from '../../components/common/Toast';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';

export const Login = () => {
  const [role, setRole] = useState('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setEmail('');
    setPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      const res = await login(role, { email: email.trim(), password });
      if (res.success) {
        setSuccessMsg(res.message || 'Login successful!');
        setTimeout(() => {
          if (role === 'ADMIN') navigate('/admin/dashboard');
          else if (role === 'ORGANIZER') navigate('/organizer/dashboard');
          else navigate('/user/dashboard');
        }, 500);
      } else {
        setErrorMsg(res.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to connect. Please try again.';
      setErrorMsg(msg);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: '20px' }}>
      <div className="form-card animate-fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
          <IconArrowLeft size={16} /> Back to Home
        </Link>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>Account Login</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Select your role and enter credentials to access your portal.
        </p>

        {/* Role Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleChange('USER')}
            style={{
              padding: '8px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.85rem',
              color: role === 'USER' ? '#ffffff' : 'var(--text-muted)',
              background: role === 'USER' ? 'var(--primary)' : 'transparent',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <IconUser size={14} /> User
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('ORGANIZER')}
            style={{
              padding: '8px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.85rem',
              color: role === 'ORGANIZER' ? '#ffffff' : 'var(--text-muted)',
              background: role === 'ORGANIZER' ? 'var(--primary)' : 'transparent',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <IconBuilding size={14} /> Organizer
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('ADMIN')}
            style={{
              padding: '8px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.85rem',
              color: role === 'ADMIN' ? '#ffffff' : 'var(--text-muted)',
              background: role === 'ADMIN' ? '#f43f5e' : 'transparent',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <IconShield size={14} /> Admin
          </button>
        </div>

        <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />
        <Toast message={successMsg} type="success" onClose={() => setSuccessMsg('')} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" style={{ margin: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => setIsForgotOpen(true)}
                style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}
              >
                Forgot Password?
              </button>
            </div>
            <div className="password-input-wrapper" style={{ marginTop: '6px' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={role === 'ADMIN' ? 'danger-btn' : 'gradient-btn'}
            style={{ width: '100%', marginTop: '12px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : `Login as ${role}`}
          </button>
        </form>

        {role !== 'ADMIN' ? (
          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link
              to={role === 'ORGANIZER' ? '/register/organizer' : '/register/user'}
              style={{ color: 'var(--primary)', fontWeight: '700' }}
            >
              Register here
            </Link>
          </p>
        ) : (
          <div
            style={{
              marginTop: '24px',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              color: '#fda4af',
              fontSize: '0.8rem',
              textAlign: 'center',
            }}
          >
            Admin access is strictly restricted to system administrators.
          </div>
        )}
      </div>

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        initialRole={role}
      />
    </div>
  );
};

export default Login;