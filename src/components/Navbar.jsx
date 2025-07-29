import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          Downtime Tracker
        </div>
        <ul className="navbar-nav">
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/downtime">Record Downtime</Link>
          </li>
          <li>
            <Link to="/reports">Reports</Link>
          </li>
          {user.role === 'admin' && (
            <li>
              <Link to="/users">User Management</Link>
            </li>
          )}
          <li>
            <span style={{ color: '#fff', padding: '8px 16px' }}>
              {user.team_name} ({user.username})
            </span>
          </li>
          <li>
            <button 
              onClick={onLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;