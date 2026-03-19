import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, X, AlertCircle, Key } from 'lucide-react';
import '../styles/Dashboard.css';
import { adminApi, formatDate } from '../utils/api';

function Conductors() {
  const [conductors, setConductors] = useState([]);
  const [filteredConductors, setFilteredConductors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [resetPasswordId, setResetPasswordId] = useState(null);
  const [newPassword, setNewPassword] = useState(generateRandomPassword());

  useEffect(() => {
    fetchConductors();
  }, []);

  useEffect(() => {
    const filtered = conductors.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredConductors(filtered);
  }, [searchQuery, conductors]);

  function generateRandomPassword() {
    return 'Pass' + Math.random().toString(36).substring(2, 8) + '!';
  }

  const fetchConductors = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/conductors');
      setConductors(response.data);
      setAlert(null);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load conductors';
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (conductor) => {
    setEditingId(conductor.id);
    setEditData(conductor);
  };

  const handleResetPassword = (conductorId) => {
    setResetPasswordId(conductorId);
    setNewPassword(generateRandomPassword());
  };

  const handleConfirmResetPassword = async () => {
    try {
      const response = await adminApi.post(`/conductors/${resetPasswordId}/reset-password`, {
        newPassword: newPassword,
      });
      setAlert({ type: 'success', message: response.data.message });
      setResetPasswordId(null);
      setTimeout(() => setAlert(null), 4000);
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to reset password' });
    }
  };

  const handleSaveEdit = async () => {
    try {
      await adminApi.put(`/conductors/${editingId}`, {
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phone,
        location: editData.location,
        status: editData.status,
      });

      setConductors(conductors.map(c =>
        c.id === editingId ? { ...c, ...editData } : c
      ));
      setEditingId(null);
      setAlert({ type: 'success', message: 'Conductor updated successfully!' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to update conductor' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this conductor?')) {
      try {
        await adminApi.delete(`/conductors/${id}`);
        setConductors(conductors.filter(c => c.id !== id));
        setAlert({ type: 'success', message: 'Conductor deleted successfully!' });
        setTimeout(() => setAlert(null), 3000);
      } catch (error) {
        setAlert({ type: 'error', message: 'Failed to delete conductor' });
      }
    }
  };

  return (
    <div className="dashboard-container">
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="section-header">
        <h2>Conductors</h2>
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading conductors...</p>
        </div>
      ) : filteredConductors.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={40} />
          <p>No conductors found</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--ceres-surface)', borderRadius: '12px', border: '1px solid var(--ceres-border)', overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="conductors-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConductors.map((conductor) => (
                  <tr key={conductor.id}>
                    <td className="name-cell">{conductor.firstName} {conductor.lastName}</td>
                    <td>{conductor.email}</td>
                    <td>{conductor.phone}</td>
                    <td>{conductor.location}</td>
                    <td>
                      <span className={`status-badge status-${conductor.status?.toLowerCase()}`}>
                        {conductor.status}
                      </span>
                    </td>
                    <td>{formatDate(conductor.createdAt, { dateStyle: 'medium' })}</td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn-action btn-edit"
                          onClick={() => handleEdit(conductor)}
                          title="Edit conductor details"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button 
                          className="btn-action"
                          onClick={() => handleResetPassword(conductor.id)}
                          title="Reset conductor password"
                          style={{ borderColor: '#FF9800', color: '#FF9800' }}
                        >
                          <Key size={14} /> Reset
                        </button>
                        <button 
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(conductor.id)}
                          title="Delete conductor"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Conductor</h3>
              <button className="close-btn" onClick={() => setEditingId(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={editData.email} disabled />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {resetPasswordId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Reset Conductor Password</h3>
              <button className="close-btn" onClick={() => setResetPasswordId(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', border: '1px solid #FF9800', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--ceres-text-secondary)' }}>
                  This will generate a new password for the conductor. Share this password securely with them.
                </p>
              </div>
              <div className="form-group">
                <label>New Password</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newPassword}
                    readOnly
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={() => setNewPassword(generateRandomPassword())}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Generate New
                  </button>
                </div>
              </div>
              <div style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4CAF50', borderRadius: '8px', padding: '12px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ceres-text-secondary)' }}>
                  Password generated: <strong>{newPassword}</strong>
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setResetPasswordId(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmResetPassword}>
                Confirm Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Conductors;
