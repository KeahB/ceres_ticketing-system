import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, AlertCircle, RefreshCcw, Shield } from 'lucide-react';
import '../styles/Dashboard.css';
import { adminApi, formatDate } from '../utils/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'admin',
  });

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/admin-users');
      setUsers(response.data);
      setAlert(null);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load admin users';
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setAlert({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    try {
      await adminApi.post('/admin-users', newUser);
      setAlert({ type: 'success', message: 'Admin user created successfully!' });
      setNewUser({ username: '', email: '', password: '', fullName: '', role: 'admin' });
      setShowNewUserForm(false);
      fetchAdminUsers();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to create user' });
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin user?')) {
      try {
        await adminApi.delete(`/admin-users/${id}`);
        setAlert({ type: 'success', message: 'Admin user deleted successfully!' });
        fetchAdminUsers();
        setTimeout(() => setAlert(null), 3000);
      } catch (error) {
        setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to delete user' });
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

      <div className="dashboard-header">
        <div>
          <h1>Admin Users</h1>
          <p className="header-subtitle">Manage dashboard access, roles, and active administrators.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary"
            onClick={fetchAdminUsers}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCcw size={16} /> Refresh
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowNewUserForm(!showNewUserForm)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* New User Form */}
      {showNewUserForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Admin User</h3>
              <button className="close-btn" onClick={() => setShowNewUserForm(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowNewUserForm(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddUser}>
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading admin users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <Shield size={40} />
          <p>No admin users found</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--ceres-surface)', borderRadius: '12px', border: '1px solid var(--ceres-border)', overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="conductors-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="name-cell">{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.fullName || '-'}</td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${user.status?.toLowerCase()}`}>
                        {user.status || 'Unknown'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt, { dateStyle: 'medium' })}</td>
                    <td>
                      <div className="actions-cell">
                        {user.id !== 1 && (
                          <button 
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                        {user.id === 1 && (
                          <span style={{ fontSize: '12px', color: 'var(--ceres-text-tertiary)' }}>
                            Default Admin
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
