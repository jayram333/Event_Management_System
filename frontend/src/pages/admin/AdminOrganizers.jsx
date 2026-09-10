import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { IconSearch, IconTrash, IconEye, IconBuilding } from '../../components/common/Icons';
import StatusBadge from '../../components/common/StatusBadge';
import { TableSkeleton } from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';

export const AdminOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [msg, setMsg] = useState({ text: '', type: 'error' });

  // Detail drawer modal state
  const [detailModal, setDetailModal] = useState({ isOpen: false, data: null });

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllOrganizers();
      if (res.success) {
        setOrganizers(res.data || []);
      }
    } catch (err) {
      setMsg({ text: 'Failed to load organizers.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      const res = await adminService.updateOrganizerStatus(id, nextStatus);
      if (res.success) {
        setMsg({ text: res.message, type: 'success' });
        fetchOrganizers();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update organizer status.';
      setMsg({ text: errorMsg, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setActionLoading(true);
      const res = await adminService.deleteOrganizer(deleteId);
      if (res.success) {
        setMsg({ text: 'Organizer and associated events deleted.', type: 'success' });
        setDeleteId(null);
        fetchOrganizers();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete organizer.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const openDetails = async (id) => {
    try {
      const res = await adminService.getOrganizerById(id);
      if (res.success) {
        setDetailModal({ isOpen: true, data: res.data });
      }
    } catch (err) {
      setMsg({ text: 'Error fetching organizer details.', type: 'error' });
    }
  };

  const filtered = organizers.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      o.fullName?.toLowerCase().includes(term) ||
      o.organizationName?.toLowerCase().includes(term) ||
      o.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Organizer Management</h1>
          <p>Inspect registered organizations, change access status, or delete accounts.</p>
        </div>
      </div>

      <Toast message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: 'error' })} />

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <IconSearch size={20} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search by full name, organization, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', width: '100%', color: 'var(--text-main)', outline: 'none', fontSize: '0.95rem' }}
        />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <IconBuilding size={48} />
          <h3>No Organizers Found</h3>
          <p>No organizer records match your query.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Organization</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Email Verified</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr key={org._id}>
                  <td style={{ fontWeight: '700' }}>{org.fullName}</td>
                  <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{org.organizationName}</td>
                  <td>{org.email}</td>
                  <td>{org.phone}</td>
                  <td>
                    <span className={org.isEmailVerified ? 'badge badge-completed' : 'badge badge-cancelled'}>
                      {org.isEmailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(org._id, org.isActive)}
                      style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                      title="Toggle Account Status"
                    >
                      <StatusBadge status={org.isActive} type="active" />
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openDetails(org._id)} className="secondary-btn" style={{ padding: '6px' }} title="View Details">
                        <IconEye size={16} />
                      </button>
                      <button onClick={() => setDeleteId(org._id)} className="danger-btn" style={{ padding: '6px' }} title="Delete Organizer">
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
      <Modal isOpen={detailModal.isOpen} onClose={() => setDetailModal({ isOpen: false, data: null })} title="Organizer Profile Details">
        {detailModal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.925rem' }}>
            <div><strong>ID:</strong> {detailModal.data._id}</div>
            <div><strong>Full Name:</strong> {detailModal.data.fullName}</div>
            <div><strong>Organization:</strong> {detailModal.data.organizationName}</div>
            <div><strong>Email:</strong> {detailModal.data.email}</div>
            <div><strong>Phone:</strong> {detailModal.data.phone}</div>
            <div><strong>Email Verified:</strong> {detailModal.data.isEmailVerified ? 'Yes' : 'No'}</div>
            <div><strong>Account Active:</strong> {detailModal.data.isActive ? 'Active' : 'Inactive'}</div>
            <div><strong>Created Date:</strong> {new Date(detailModal.data.createdAt).toLocaleString()}</div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Organizer"
        message="Are you sure you want to delete this organizer? All events published by this organizer will also be permanently deleted."
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminOrganizers;
