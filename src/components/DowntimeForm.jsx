import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DowntimeForm = ({ user }) => {
  const [channels, setChannels] = useState([]);
  const [formData, setFormData] = useState({
    channel_id: '',
    downtime_type: 'scheduled',
    start_time: '',
    end_time: '',
    duration_minutes: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/channels', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChannels(response.data);
    } catch (error) {
      console.error('Error fetching channels:', error);
      setMessage('Error loading channels. Please try again.');
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

    // Auto-calculate duration when start and end times are set
    if ((name === 'start_time' || name === 'end_time') && formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);
      const duration = Math.round((end - start) / (1000 * 60)); // Convert to minutes
      if (duration > 0) {
        setFormData(prev => ({
          ...prev,
          duration_minutes: duration.toString()
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/downtime', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Downtime record added successfully!');
      setFormData({
        channel_id: '',
        downtime_type: 'scheduled',
        start_time: '',
        end_time: '',
        duration_minutes: '',
        reason: ''
      });
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error adding downtime record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading channels...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px', color: '#333' }}>
        Record Downtime
      </h1>

      <div className="card">
        {message && (
          <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="channel_id">Channel *</label>
            <select
              id="channel_id"
              name="channel_id"
              value={formData.channel_id}
              onChange={handleChange}
              required
              disabled={submitting}
            >
              <option value="">Select a channel</option>
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="downtime_type">Downtime Type *</label>
            <select
              id="downtime_type"
              name="downtime_type"
              value={formData.downtime_type}
              onChange={handleChange}
              required
              disabled={submitting}
            >
              <option value="scheduled">Scheduled</option>
              <option value="unscheduled">Unscheduled</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="start_time">Start Time *</label>
              <input
                type="datetime-local"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_time">End Time *</label>
              <input
                type="datetime-local"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="duration_minutes">Duration (minutes) *</label>
            <input
              type="number"
              id="duration_minutes"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              min="1"
              required
              disabled={submitting}
              placeholder="Duration will be auto-calculated from start and end times"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="3"
              disabled={submitting}
              placeholder="Brief description of the downtime reason..."
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Record Downtime'}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setFormData({
                  channel_id: '',
                  downtime_type: 'scheduled',
                  start_time: '',
                  end_time: '',
                  duration_minutes: '',
                  reason: ''
                });
                setMessage('');
              }}
              disabled={submitting}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#333' }}>Instructions</h3>
        <ul style={{ color: '#666', lineHeight: '1.6' }}>
          <li>Select the appropriate channel that experienced downtime</li>
          <li>Choose whether the downtime was scheduled or unscheduled</li>
          <li>Enter the exact start and end times of the downtime</li>
          <li>Duration will be automatically calculated, but you can adjust if needed</li>
          <li>Provide a brief reason for the downtime (optional but recommended)</li>
          <li>All fields marked with * are required</li>
        </ul>
      </div>
    </div>
  );
};

export default DowntimeForm;