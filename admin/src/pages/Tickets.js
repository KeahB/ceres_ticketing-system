import React, { useState, useEffect } from 'react';
import { Search, Download, AlertCircle, RefreshCcw } from 'lucide-react';
import '../styles/Dashboard.css';
import { adminApi, formatCurrency, formatDate } from '../utils/api';

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConductor, setSelectedConductor] = useState('all');
  const [selectedPassengerType, setSelectedPassengerType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const filtered = tickets.filter(t =>
      (t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.passengerType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.conductorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.routeName || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedConductor === 'all' || String(t.conductorId || 'unknown') === selectedConductor) &&
      (selectedPassengerType === 'all' || t.passengerType === selectedPassengerType)
    );
    setFilteredTickets(filtered);
  }, [searchQuery, selectedConductor, selectedPassengerType, tickets]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/tickets');
      setTickets(response.data);
      setAlert(null);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load tickets';
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredTickets.length === 0) {
      alert('No tickets to export');
      return;
    }

    const headers = ['Ticket ID', 'Conductor', 'From', 'To', 'Route', 'Distance (KM)', 'Passenger Type', 'Fare (PHP)', 'Date'];
    const rows = filteredTickets.map(t => [
      t.ticketId,
      t.conductorName || 'Unknown',
      t.origin || '-',
      t.destination || '-',
      t.routeName || '-',
      t.distance.toFixed(2),
      t.passengerType,
      t.fare.toFixed(2),
      formatDate(t.createdAt, { dateStyle: 'medium', timeStyle: 'short' })
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalRevenue = filteredTickets.reduce((sum, t) => sum + t.fare, 0);
  const avgFare = filteredTickets.length > 0 ? totalRevenue / filteredTickets.length : 0;
  const conductorOptions = tickets.reduce((items, ticket) => {
    if (!items.some((item) => item.value === String(ticket.conductorId || 'unknown'))) {
      items.push({
        value: String(ticket.conductorId || 'unknown'),
        label: ticket.conductorName || 'Unknown',
      });
    }
    return items;
  }, []).sort((left, right) => left.label.localeCompare(right.label));
  const passengerTypeOptions = [...new Set(tickets.map((ticket) => ticket.passengerType).filter(Boolean))].sort();

  return (
    <div className="dashboard-container">
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="dashboard-header">
        <h1>Tickets Management</h1>
        <button 
          className="btn btn-primary"
          onClick={fetchTickets}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Tickets</h3>
          </div>
          <div className="stat-value">{filteredTickets.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Revenue</h3>
          </div>
          <div className="stat-value">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <h3>Average Fare</h3>
          </div>
          <div className="stat-value">{formatCurrency(avgFare)}</div>
        </div>
      </div>

      <div className="section-header">
        <h2>All Tickets</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '250px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by ticket, conductor, route, or passenger type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="table-filter-select"
            value={selectedConductor}
            onChange={(e) => setSelectedConductor(e.target.value)}
          >
            <option value="all">All Conductors</option>
            {conductorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="table-filter-select"
            value={selectedPassengerType}
            onChange={(e) => setSelectedPassengerType(e.target.value)}
          >
            <option value="all">All Passenger Types</option>
            {passengerTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button 
            className="btn btn-primary"
            onClick={exportToCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={40} />
          <p>No tickets found</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--ceres-surface)', borderRadius: '12px', border: '1px solid var(--ceres-border)', overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="conductors-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Conductor</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Route</th>
                  <th>Distance (KM)</th>
                  <th>Passenger Type</th>
                  <th>Fare</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="name-cell">{ticket.ticketId}</td>
                    <td>{ticket.conductorName || 'Unknown'}</td>
                    <td>{ticket.origin || '-'}</td>
                    <td>{ticket.destination || '-'}</td>
                    <td>{ticket.routeName || '-'}</td>
                    <td>{ticket.distance.toFixed(2)}</td>
                    <td>{ticket.passengerType}</td>
                    <td>{formatCurrency(ticket.fare)}</td>
                    <td>{formatDate(ticket.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</td>
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

export default Tickets;
