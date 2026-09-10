import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { IconSearch, IconTrash, IconEye, IconUsers } from '../../components/common/Icons';
import StatusBadge from '../../components/common/StatusBadge';
import { TableSkeleton } from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [msg, setMsg] = useState({ text: '', type: 'error' });

  // Detail drawer modal state
  const [detailModal, setDetailModal] = useState({ isOpen: false, data: null });

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers();
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      setMsg({ text: 'Failed to load users.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      const res = await adminService.updateUserStatus(id, nextStatus);
      if (res.success) {
        setMsg({ text: res.message, type: 'success' });
        fetchUsers();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update user status.';
      setMsg({ text: errorMsg, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setActionLoading(true);
      const res = await adminService.deleteUser(deleteId);
      if (res.success) {
        setMsg({ text: 'User account deleted successfully.', type: 'success' });
        setDeleteId(null);
        fetchUsers();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete user.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const openDetails = async (id) => {
    try {
      const res = await adminService.getUserById(id);
      if (res.success) {
        setDetailModal({ isOpen: true, data: res.data });
      }
    } catch (err) {
      setMsg({ text: 'Error fetching user details.', type: 'error' });
    }
  };

  const filtered = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return u.fullName?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term);
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>User Accounts Management</h1>
          <p>Inspect participant profiles, activate/deactivate access, or remove user accounts.</p>
        </div>
      </div>

      <Toast message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: 'error' })} />

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <IconSearch size={20} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search by full name or email address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', width: '100%', color: 'var(--text-main)', outline: 'none', fontSize: '0.95rem' }}
        />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <IconUsers size={48} />
          <h3>No User Accounts Found</h3>
          <p>No user records match your query.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Email Verified</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: '700' }}>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td><span className="badge badge-upcoming">{u.role}</span></td>
                  <td>
                    <span className={u.isEmailVerified ? 'badge badge-completed' : 'badge badge-cancelled'}>
                      {u.isEmailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(u._id, u.isActive)}
                      style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                      title="Toggle Account Status"
                    >
                      <StatusBadge status={u.isActive} type="active" />
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openDetails(u._id)} className="secondary-btn" style={{ padding: '6px' }} title="View Details">
                        <IconEye size={16} />
                      </button>
                      <button onClick={() => setDeleteId(u._id)} className="danger-btn" style={{ padding: '6px' }} title="Delete User">
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      <Modal isOpen={detailModal.isOpen} onClose={() => setDetailModal({ isOpen: false, data: null })} title="User Profile Details">
        {detailModal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.925rem' }}>
            <div><strong>ID:</strong> {detailModal.data._id}</div>
            <div><strong>Full Name:</strong> {detailModal.data.fullName}</div>
            <div><strong>Email:</strong> {detailModal.data.email}</div>
            <div><strong>Phone:</strong> {detailModal.data.phone}</div>
            <div><strong>Role:</strong> {detailModal.data.role}</div>
            <div><strong>Email Verified:</strong> {detailModal.data.isEmailVerified ? 'Yes' : 'No'}</div>
            <div><strong>Account Active:</strong> {detailModal.data.isActive ? 'Active' : 'Inactive'}</div>
            <div><strong>Terms Accepted:</strong> {detailModal.data.termsAccepted ? 'Yes' : 'No'}</div>
            <div><strong>Registered Date:</strong> {new Date(detailModal.data.createdAt).toLocaleString()}</div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User Account"
        message="Are you sure you want to permanently delete this user account? This action cannot be undone."
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminUsers;
