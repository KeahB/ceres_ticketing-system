import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import '../styles/Dashboard.css';
import { adminApi, formatCurrency } from '../utils/api';

function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/reports');
      setReports(response.data);
      setAlert(null);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load reports';
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const chartColors = ['#FFEB3B', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];

  return (
    <div className="dashboard-container">
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="dashboard-header">
        <h1>Ticket Reports & Analytics</h1>
        <button 
          className="btn btn-primary"
          onClick={fetchReports}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : !reports ? (
        <div className="empty-state">
          <AlertCircle size={40} />
          <p>No report data available</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Tickets</h3>
              </div>
              <div className="stat-value">{reports.totalTickets}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Revenue</h3>
              </div>
              <div className="stat-value">{formatCurrency(reports.totalRevenue)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <h3>Average Fare</h3>
              </div>
              <div className="stat-value">{formatCurrency(reports.averageFare)}</div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-section">
            {/* Passenger Type Distribution */}
            {reports.passengerTypeData && reports.passengerTypeData.length > 0 && (
              <div className="chart-container">
                <h2>Tickets by Passenger Type</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reports.passengerTypeData}
                      dataKey="count"
                      nameKey="passenger_type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {reports.passengerTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Revenue by Passenger Type */}
            {reports.passengerTypeData && reports.passengerTypeData.length > 0 && (
              <div className="chart-container">
                <h2>Revenue by Passenger Type</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reports.passengerTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ceres-border)" />
                    <XAxis dataKey="passenger_type" stroke="var(--ceres-text-secondary)" />
                    <YAxis stroke="var(--ceres-text-secondary)" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="var(--ceres-primary)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Detailed Statistics Table */}
          <div style={{ marginTop: '30px', backgroundColor: 'var(--ceres-surface)', borderRadius: '12px', border: '1px solid var(--ceres-border)', overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="conductors-table">
                <thead>
                  <tr>
                    <th>Passenger Type</th>
                    <th>Number of Tickets</th>
                    <th>Total Revenue</th>
                    <th>Average Fare</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.passengerTypeData && reports.passengerTypeData.map((row) => (
                    <tr key={row.passenger_type}>
                      <td className="name-cell">{row.passenger_type}</td>
                      <td>{row.count}</td>
                      <td>{formatCurrency(row.total)}</td>
                      <td>{formatCurrency(row.total / row.count)}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: 'rgba(255, 235, 59, 0.1)', fontWeight: 'bold' }}>
                    <td className="name-cell">TOTAL</td>
                    <td>{reports.totalTickets}</td>
                    <td>{formatCurrency(reports.totalRevenue)}</td>
                    <td>{formatCurrency(reports.averageFare)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
