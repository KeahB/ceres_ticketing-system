import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, User } from 'lucide-react';
import '../styles/AdminLogin.css';
import { adminApi } from '../utils/api';

function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminApi.post('/login', {
        username: username.trim(),
        password,
      });

      localStorage.setItem('adminToken', response.data.token);
      if (response.data.admin) {
        localStorage.setItem('adminProfile', JSON.stringify(response.data.admin));
      }
      onLoginSuccess();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login right now.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          <div className="login-logo-mark" aria-hidden="true">
            <div className="login-logo-badge">CL</div>
          </div>
          <h1>Ceres Liner</h1>
          <p>Admin Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">ADMIN USERNAME</label>
            <div className="password-input-wrapper">
              <User size={20} className="input-icon" />
              <input
                id="username"
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">ADMIN PASSWORD</label>
            <div className="password-input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-login"
            disabled={loading}
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
          </button>

          <div className="login-footer">
            <p className="footer-text">Ceres Liner Management System</p>
            <p className="footer-version">v1.0.0 | Dumaguete City</p>
          </div>
        </form>
      </div>

      <div className="login-info">
        <p>Secure Admin Portal</p>
        <p>Manage conductors and system operations</p>
      </div>
    </div>
  );
}

export default AdminLogin;
