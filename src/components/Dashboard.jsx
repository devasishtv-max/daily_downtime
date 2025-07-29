import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const Dashboard = ({ user }) => {
  const [recentDowntime, setRecentDowntime] = useState([]);
  const [stats, setStats] = useState({
    totalScheduled: 0,
    totalUnscheduled: 0,
    totalChannels: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Get recent downtime records
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const [recentResponse, statsResponse] = await Promise.all([
        axios.get(`/api/downtime?start_date=${startOfDay.toISOString()}&end_date=${endOfDay.toISOString()}`, { headers }),
        axios.get('/api/downtime/report', { 
          headers,
          params: {
            start_date: startOfDay.toISOString(),
            end_date: endOfDay.toISOString()
          }
        })
      ]);

      setRecentDowntime(recentResponse.data.slice(0, 5));
      
      const totalScheduled = statsResponse.data.reduce((sum, item) => sum + (item.scheduled_downtime || 0), 0);
      const totalUnscheduled = statsResponse.data.reduce((sum, item) => sum + (item.unscheduled_downtime || 0), 0);
      
      setStats({
        totalScheduled,
        totalUnscheduled,
        totalChannels: statsResponse.data.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px', color: '#333' }}>
        Welcome, {user.team_name}!
      </h1>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="card">
          <h3 style={{ color: '#1976d2', marginBottom: '8px' }}>Today's Scheduled Downtime</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {stats.totalScheduled} minutes
          </p>
        </div>
        
        <div className="card">
          <h3 style={{ color: '#d32f2f', marginBottom: '8px' }}>Today's Unscheduled Downtime</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {stats.totalUnscheduled} minutes
          </p>
        </div>
        
        <div className="card">
          <h3 style={{ color: '#388e3c', marginBottom: '8px' }}>Total Channels</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {stats.totalChannels}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 style={{ marginBottom: '16px', color: '#333' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/downtime" className="btn btn-primary">
            Record New Downtime
          </Link>
          <Link to="/reports" className="btn btn-secondary">
            View Reports
          </Link>
          {user.role === 'admin' && (
            <Link to="/users" className="btn btn-secondary">
              Manage Users
            </Link>
          )}
        </div>
      </div>

      {/* Recent Downtime Records */}
      <div className="card">
        <h2 style={{ marginBottom: '16px', color: '#333' }}>Recent Downtime Records</h2>
        {recentDowntime.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No downtime records for today.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Channel</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Time</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {recentDowntime.map((record) => (
                <tr key={record.id}>
                  <td>{record.channel_name}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: record.downtime_type === 'scheduled' ? '#e3f2fd' : '#ffebee',
                      color: record.downtime_type === 'scheduled' ? '#1976d2' : '#d32f2f'
                    }}>
                      {record.downtime_type}
                    </span>
                  </td>
                  <td>{record.duration_minutes} minutes</td>
                  <td>
                    {format(new Date(record.start_time), 'HH:mm')} - {format(new Date(record.end_time), 'HH:mm')}
                  </td>
                  <td>{record.recorded_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;