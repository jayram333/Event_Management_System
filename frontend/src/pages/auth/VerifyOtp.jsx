import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconCheckCircle, IconArrowLeft } from '../../components/common/Icons';
import Toast from '../../components/common/Toast';

export const VerifyOtp = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const role = searchParams.get('role') || 'USER';

  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { verifyOtp, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Missing email parameter. Please register again.');
      return;
    }

    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    try {
      const res = await verifyOtp({
        email: email.trim(),
        otp: otp.trim(),
        role: role.toUpperCase(),
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Email verified successfully! You can now login.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setErrorMsg(res.message || 'Invalid or expired OTP.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Please check your OTP and try again.';
      setErrorMsg(msg);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: '20px' }}>
      <div className="form-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
          <IconArrowLeft size={16} /> Back to Login
        </Link>

        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <IconCheckCircle size={32} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>Verify Your Email</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          An OTP has been sent to <strong style={{ color: 'var(--text-main)' }}>{email || 'your email'}</strong> ({role}). Please enter the verification code below.
        </p>

        <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />
        <Toast message={successMsg} type="success" onClose={() => setSuccessMsg('')} />

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label htmlFor="otp">Enter 6-Digit OTP Code</label>
            <input
              id="otp"
              type="text"
              className="form-control"
              placeholder="e.g. 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              style={{
                fontSize: '1.25rem',
                letterSpacing: '0.2em',
                textAlign: 'center',
                fontWeight: '700',
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="gradient-btn"
            style={{ width: '100%', padding: '12px', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Verifying OTP...' : 'Verify Email & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
