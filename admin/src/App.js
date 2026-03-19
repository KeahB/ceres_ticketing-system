import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Conductors from './pages/Conductors';
import Tickets from './pages/Tickets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AdminUsers from './pages/AdminUsers';
import Sidebar from './components/Sidebar';
import { clearAdminSession, hasValidAdminToken } from './utils/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    hasValidAdminToken()
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const ProtectedLayout = ({ children }) => (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} onLogout={handleLogout} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <AdminLogin onLoginSuccess={() => {
                setIsAuthenticated(true);
              }} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/conductors"
          element={
            isAuthenticated ? (
              <ProtectedLayout>
                <Conductors />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/tickets"
          element={
            isAuthenticated ? (
              <ProtectedLayout>
                <Tickets />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/reports"
          element={
            isAuthenticated ? (
              <ProtectedLayout>
                <Reports />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin-users"
          element={
            isAuthenticated ? (
              <ProtectedLayout>
                <AdminUsers />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            isAuthenticated ? (
              <ProtectedLayout>
                <Settings />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
