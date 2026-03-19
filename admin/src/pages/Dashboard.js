import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, X, AlertCircle, CheckCircle, Loader, TrendingUp } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import '../styles/Dashboard.css';
import { adminApi, formatCurrency } from '../utils/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalConductors: 0,
    activeTickets: 0,
    revenue: 0,
    completedRoutes: 0,
  });
  const [conductors, setConductors] = useState([]);
  const [filteredConductors, setFilteredConductors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const filtered = conductors.filter(conductor =>
      conductor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conductor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conductor.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredConductors(filtered);
  }, [searchQuery, conductors]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, conductorsRes] = await Promise.all([
        adminApi.get('/stats'),
        adminApi.get('/conductors'),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (conductorsRes.data) setConductors(conductorsRes.data);
    } catch (error) {
      showAlert('Error loading dashboard data: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleEdit = (conductor) => {
    setEditingId(conductor.id);
    setEditData({ ...conductor });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await adminApi.put(`/conductors/${editingId}`, editData);
      showAlert('Conductor updated successfully', 'success');
      setShowEditModal(false);
      loadDashboardData();
    } catch (error) {
      showAlert('Failed to update conductor', 'error');
    }
  };

  const handleDelete = (conductorId, conductorName) => {
    if (window.confirm(`Are you sure you want to delete ${conductorName}?`)) {
      deleteAfterConfirm(conductorId, conductorName);
    }
  };

  const deleteAfterConfirm = async (conductorId, conductorName) => {
    try {
      await adminApi.delete(`/conductors/${conductorId}`);
      showAlert(`${conductorName} has been deleted`, 'success');
      loadDashboardData();
    } catch (error) {
      showAlert('Failed to delete conductor', 'error');
    }
  };

  // Data for charts
  const statusData = [
    { name: 'Active', value: conductors.filter(c => c.status === 'active').length, fill: '#4CAF50' },
    { name: 'Pending', value: conductors.filter(c => c.status === 'pending').length, fill: '#FFC107' },
    {  name: 'Inactive', value: conductors.filter(c => c.status === 'inactive').length, fill: '#757575' },
  ].filter(item => item.value > 0);

  const locationData = conductors.reduce((acc, conductor) => {
    const existing = acc.find(item => item.location === conductor.location);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ location: conductor.location, count: 1 });
    }
    return acc;
  }, []).slice(0, 8);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <Loader size={48} className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="header-subtitle">Welcome to Ceres Liner Management System</p>
        </div>
        <button className="refresh-btn" onClick={loadDashboardData}>
          <TrendingUp size={20} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Conductors</h3>
          </div>
          <div className="stat-value">{stats.totalConductors}</div>
          <p className="stat-change">Active members</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Active Tickets</h3>
          </div>
          <div className="stat-value">{stats.activeTickets}</div>
          <p className="stat-change">In progress</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Revenue</h3>
          </div>
          <div className="stat-value">{formatCurrency(stats.revenue)}</div>
          <p className="stat-change">This period</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Completed Routes</h3>
          </div>
          <div className="stat-value">{stats.completedRoutes}</div>
          <p className="stat-change">Finished today</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h2>Conductor Status Distribution</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No conductor status data available</p>
          )}
        </div>

        <div className="chart-container">
          <h2>Conductors by Location</h2>
          {locationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="location" stroke="var(--ceres-text-secondary)" />
                <YAxis stroke="var(--ceres-text-secondary)" />
                <Tooltip 
                  contentStyle={{ background: 'var(--ceres-surface)', border: '1px solid var(--ceres-border)' }}
                  labelStyle={{ color: 'var(--ceres-primary)' }}
                />
                <Bar dataKey="count" fill="var(--ceres-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No location data available</p>
          )}
        </div>
      </div>

      {/* Conductors Table */}
      <div className="conductors-section">
        <div className="section-header">
          <h2>Manage Conductors</h2>
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="conductors-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConductors.map((conductor) => (
                <tr key={conductor.id}>
                  <td className="name-cell">
                    {conductor.firstName} {conductor.lastName}
                  </td>
                  <td>{conductor.email}</td>
                  <td>{conductor.phone}</td>
                  <td>{conductor.location}</td>
                  <td>
                    <span className={`status-badge status-${conductor.status}`}>
                      {conductor.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEdit(conductor)}
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(conductor.id, `${conductor.firstName} ${conductor.lastName}`)}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredConductors.length === 0 && (
            <div className="empty-state">
              <p>No conductors found. Try a different search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Conductor</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={editData.firstName || ''}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={editData.lastName || ''}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={editData.location || ''}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editData.status || 'active'}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
