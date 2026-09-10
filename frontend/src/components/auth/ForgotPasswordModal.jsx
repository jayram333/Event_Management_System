import React, { useState } from 'react';
import authService from '../../services/authService';
import Modal from '../common/Modal';
import Toast from '../common/Toast';
import { IconEye, IconEyeOff, IconCheck, IconMail, IconKey } from '../common/Icons';

export const ForgotPasswordModal = ({ isOpen, onClose, initialRole = 'USER' }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleResetState = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(false);
  };

  const handleClose = () => {
    handleResetState();
    onClose();
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword({
        email: email.trim(),
        role,
      });

      if (res.success) {
        setSuccessMsg(res.message || 'OTP sent successfully to your email!');
        setStep(2);
      } else {
        setErrorMsg(res.message || 'Failed to send OTP.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to send verification email. Please try again later.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyResetOtp({
        email: email.trim(),
        role,
        otp: otp.trim(),
      });

      if (res.success) {
        setSuccessMsg('OTP verified successfully! Create a new password.');
        setStep(3);
      } else {
        setErrorMsg(res.message || 'Invalid or expired OTP.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword({
        email: email.trim(),
        role,
        otp: otp.trim(),
        newPassword,
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Password reset successful! You can now log in.');
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setErrorMsg(res.message || 'Password reset failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error resetting password. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Your Password" maxWidth="440px">
      <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />
      <Toast message={successMsg} type="success" onClose={() => setSuccessMsg('')} />

      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Enter your registered email address and role to receive a password reset OTP.
          </p>

          <div className="form-group">
            <label htmlFor="resetRole">Select Account Role</label>
            <select
              id="resetRole"
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="USER">User / Coordinator</option>
              <option value="ORGANIZER">Organizer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="resetEmail">Email Address</label>
            <input
              id="resetEmail"
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="secondary-btn" onClick={handleClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="gradient-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Reset OTP'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Enter the 6-digit verification code sent to <strong>{email}</strong>.
          </p>

          <div className="form-group">
            <label htmlFor="resetOtp">Verification Code (OTP)</label>
            <input
              id="resetOtp"
              type="text"
              className="form-control"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              autoComplete="off"
              style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: '700' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="secondary-btn" onClick={() => setStep(1)} disabled={loading}>
              Back
            </button>
            <button type="submit" className="gradient-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Create a new password for your account.
          </p>

          <div className="form-group">
            <label htmlFor="newPassword">New Password (min 8 chars)</label>
            <div className="password-input-wrapper">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="gradient-btn" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Resetting Password...' : 'Set New Password'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ForgotPasswordModal;
