import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    team_name: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Error loading users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/users', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('User created successfully!');
      setFormData({
        username: '',
        password: '',
        team_name: '',
        role: 'user'
      });
      fetchUsers(); // Refresh the users list
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error creating user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px', color: '#333' }}>
        User Management
      </h1>

      {/* Add New User Form */}
      <div className="card">
        <h2 style={{ marginBottom: '16px', color: '#333' }}>Add New User</h2>
        
        {message && (
          <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={submitting}
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="team_name">Team Name *</label>
              <input
                type="text"
                id="team_name"
                name="team_name"
                value={formData.team_name}
                onChange={handleChange}
                required
                disabled={submitting}
                placeholder="e.g., Network Team, Operations Team"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={submitting}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating User...' : 'Create User'}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setFormData({
                  username: '',
                  password: '',
                  team_name: '',
                  role: 'user'
                });
                setMessage('');
              }}
              disabled={submitting}
              style={{ marginLeft: '16px' }}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>

      {/* Users List */}
      <div className="card">
        <h2 style={{ marginBottom: '16px', color: '#333' }}>Existing Users</h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Team Name</th>
                <th>Role</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem.id}>
                  <td>{userItem.username}</td>
                  <td>{userItem.team_name}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: userItem.role === 'admin' ? '#ffebee' : '#e3f2fd',
                      color: userItem.role === 'admin' ? '#d32f2f' : '#1976d2'
                    }}>
                      {userItem.role}
                    </span>
                  </td>
                  <td>{new Date(userItem.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '20px' }}>
            No users found.
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', color: '#333' }}>Instructions</h3>
        <ul style={{ color: '#666', lineHeight: '1.6' }}>
          <li><strong>Username:</strong> Must be unique and will be used for login</li>
          <li><strong>Password:</strong> Minimum 6 characters, will be securely hashed</li>
          <li><strong>Team Name:</strong> Identifies which team the user belongs to</li>
          <li><strong>Role:</strong> 
            <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
              <li><strong>User:</strong> Can record downtime and view reports</li>
              <li><strong>Admin:</strong> Can manage users and access all features</li>
            </ul>
          </li>
          <li>All new users will be able to log in immediately after creation</li>
          <li>Users can only be created by administrators</li>
        </ul>
      </div>
    </div>
  );
};

export default UserManagement;