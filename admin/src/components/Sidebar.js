import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Menu, 
  X,
  BarChart3,
  Settings,
  FileText,
  Shield
} from 'lucide-react';
import '../styles/Sidebar.css';

function Sidebar({ isOpen, toggleSidebar, onLogout }) {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/conductors', icon: Users, label: 'Conductors' },
    { path: '/admin-users', icon: Shield, label: 'Admin Users' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/tickets', icon: FileText, label: 'Tickets' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile menu button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo Section */}
        <div className="sidebar-logo">
          <div className="logo-mark" aria-hidden="true">
            <span className="logo-circle">CL</span>
            <span className="logo-accent"></span>
          </div>
          <div className="logo-text">
            <span className="logo-eyebrow">Admin Dashboard</span>
            <h2>Ceres Liner</h2>
            <p>Ticketing control center</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="nav-section-title">MAIN MENU</p>
          <ul className="nav-items">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => {
                    // Close sidebar on mobile after click
                    if (window.innerWidth < 768) {
                      toggleSidebar();
                    }
                  }}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => {
              onLogout();
              toggleSidebar();
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>

          <div className="sidebar-version">
            <p>v1.0.0</p>
            <small>Dumaguete City</small>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
