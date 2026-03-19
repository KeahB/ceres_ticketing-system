import React, { useState } from 'react';
import { Save, AlertCircle, Lock } from 'lucide-react';
import '../styles/Dashboard.css';
import { adminApi, getBackendUrl } from '../utils/api';

const getInitialSettings = () => {
  const defaults = {
    apiUrl: getBackendUrl(),
    refreshInterval: 30,
    maxTicketsPerPage: 50,
    theme: 'dark',
    notifications: true,
  };

  try {
    const rawSettings = localStorage.getItem('adminSettings');
    if (!rawSettings) {
      return defaults;
    }

    return {
      ...defaults,
      ...JSON.parse(rawSettings),
    };
  } catch (error) {
    return defaults;
  }
};

function Settings() {
  const [settings, setSettings] = useState(getInitialSettings);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [saved, setSaved] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSaved(false);
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save to localStorage for persistence
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    setAlert({ type: 'success', message: 'Settings saved successfully!' });
    setSaved(true);
    setTimeout(() => setAlert(null), 3000);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setAlert({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlert({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setAlert({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    try {
      const response = await adminApi.post('/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setAlert({ type: 'success', message: response.data.message });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to change password' });
    }
  };

  const handleReset = () => {
    setSettings({
      apiUrl: getBackendUrl(),
      refreshInterval: 30,
      maxTicketsPerPage: 50,
      theme: 'dark',
      notifications: true,
    });
    setSaved(false);
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
          <h1>Settings</h1>
          <p className="header-subtitle">Configure your admin dashboard preferences and security</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {/* Change Password Section */}
        <div className="settings-section" style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', borderLeft: '4px solid var(--ceres-error)' }}>
          <div className="settings-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={20} /> Change Password
            </h2>
          </div>
          
          {!showPasswordForm ? (
            <button 
              className="btn btn-primary"
              onClick={() => setShowPasswordForm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Lock size={16} /> Change Admin Password
            </button>
          ) : (
            <>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-primary"
                  onClick={handleChangePassword}
                >
                  Update Password
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        {/* API Settings */}
        <div className="settings-section">
          <div className="settings-header">
            <h2>API Configuration</h2>
          </div>
          
          <div className="form-group">
            <label>Backend API URL</label>
            <input
              type="text"
              value={settings.apiUrl}
              onChange={(e) => handleChange('apiUrl', e.target.value)}
              placeholder={getBackendUrl()}
            />
            <small style={{ color: 'var(--ceres-text-tertiary)', marginTop: '4px', display: 'block' }}>
              The base URL of your backend server. Used for all API calls.
            </small>
          </div>
        </div>

        {/* Dashboard Settings */}
        <div className="settings-section">
          <div className="settings-header">
            <h2>Dashboard Preferences</h2>
          </div>

          <div className="form-group">
            <label>Auto-Refresh Interval (seconds)</label>
            <input
              type="number"
              value={settings.refreshInterval}
              onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
              min="10"
              max="300"
            />
            <small style={{ color: 'var(--ceres-text-tertiary)', marginTop: '4px', display: 'block' }}>
              How often the dashboard data refreshes automatically (10-300 seconds).
            </small>
          </div>

          <div className="form-group">
            <label>Items Per Page</label>
            <select
              value={settings.maxTicketsPerPage}
              onChange={(e) => handleChange('maxTicketsPerPage', parseInt(e.target.value))}
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
            <small style={{ color: 'var(--ceres-text-tertiary)', marginTop: '4px', display: 'block' }}>
              Maximum number of items displayed per page in tables.
            </small>
          </div>
        </div>

        {/* Display Settings */}
        <div className="settings-section">
          <div className="settings-header">
            <h2>Display & Notifications</h2>
          </div>

          <div className="form-group">
            <label>Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light (Coming Soon)</option>
              <option value="auto">Auto (Coming Soon)</option>
            </select>
            <small style={{ color: 'var(--ceres-text-tertiary)', marginTop: '4px', display: 'block' }}>
              Choose your preferred theme for the dashboard.
            </small>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                id="notifications"
                checked={settings.notifications}
                onChange={(e) => handleChange('notifications', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="notifications" style={{ margin: 0, cursor: 'pointer' }}>
                Enable notifications
              </label>
            </div>
            <small style={{ color: 'var(--ceres-text-tertiary)', marginTop: '4px', display: 'block' }}>
              Receive alerts for important events and updates.
            </small>
          </div>
        </div>

        {/* Info Section */}
        <div className="settings-section" style={{ backgroundColor: 'rgba(255, 235, 59, 0.1)', borderLeft: '4px solid var(--ceres-primary)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle size={20} style={{ color: 'var(--ceres-primary)', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 8px 0' }}>About</h3>
              <p style={{ margin: '0', color: 'var(--ceres-text-secondary)', fontSize: '14px' }}>
                Ceres Liner Admin Dashboard v1.0 - A comprehensive ticket management and conductor system.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} /> Save Settings
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleReset}
          >
            Reset to Default
          </button>
        </div>
      </div>

      <style>{`
        .settings-section {
          background: linear-gradient(135deg, var(--ceres-surface) 0%, var(--ceres-surface-light) 100%);
          border: 1px solid var(--ceres-border);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .settings-header {
          margin-bottom: 20px;
        }

        .settings-header h2 {
          font-size: 16px;
          margin: 0;
          color: var(--ceres-text);
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--ceres-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          background: var(--ceres-bg);
          border: 1px solid var(--ceres-border);
          border-radius: 6px;
          color: var(--ceres-text);
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--ceres-primary);
          box-shadow: 0 0 0 3px rgba(255, 235, 59, 0.1);
        }
      `}</style>
    </div>
  );
}

export default Settings;
