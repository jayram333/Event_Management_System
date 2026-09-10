import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconEye, IconEyeOff, IconArrowLeft } from '../../components/common/Icons';
import Toast from '../../components/common/Toast';

export const UserRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setErrorMsg('All required fields must be provided.');
      return;
    }

    if (!formData.termsAccepted) {
      setErrorMsg('You must accept the Terms and Conditions.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg('Password must contain at least 8 characters.');
      return;
    }

    try {
      const res = await register('USER', {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        termsAccepted: formData.termsAccepted,
      });

      if (res.success) {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email.trim())}&role=USER`);
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error during user registration.';
      setErrorMsg(msg);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: '24px' }}>
      <div className="form-card animate-fade-in" style={{ width: '100%', maxWidth: '480px' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
          <IconArrowLeft size={16} /> Back to Login
        </Link>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>User Registration</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Join as a participant & event coordinator.
        </p>

        <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="form-control"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="form-control"
              placeholder="+1 555-0199"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password (min 8 chars)</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <input
              id="termsAccepted"
              name="termsAccepted"
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              required
            />
            <label htmlFor="termsAccepted" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              I accept the Terms and Conditions
            </label>
          </div>

          <button type="submit" className="gradient-btn" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register User'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Are you an Organizer?{' '}
          <Link to="/register/organizer" style={{ color: 'var(--primary)', fontWeight: '700' }}>
            Register as Organizer
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserRegister;
