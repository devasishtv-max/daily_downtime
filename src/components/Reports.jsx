import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';

const Reports = ({ user }) => {
  const [reportData, setReportData] = useState([]);
  const [detailedRecords, setDetailedRecords] = useState([]);
  const [filters, setFilters] = useState({
    start_date: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    report_type: 'summary'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const startDate = new Date(filters.start_date);
      const endDate = new Date(filters.end_date);
      endDate.setHours(23, 59, 59, 999);

      const [summaryResponse, detailedResponse] = await Promise.all([
        axios.get('/api/downtime/report', {
          headers,
          params: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
          }
        }),
        axios.get('/api/downtime', {
          headers,
          params: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
          }
        })
      ]);

      setReportData(summaryResponse.data);
      setDetailedRecords(detailedResponse.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getLast24HoursData = (channelId) => {
    const yesterday = subDays(new Date(), 1);
    const today = new Date();
    return detailedRecords.filter(record => 
      record.channel_id === channelId &&
      new Date(record.start_time) >= yesterday &&
      new Date(record.start_time) <= today
    );
  };

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'hh:mm:ss a');
  };

  if (loading) {
    return <div className="loading">Loading report...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px', color: '#333' }}>
        Downtime Reports
      </h1>

      {/* Filters */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', color: '#333' }}>Report Filters</h3>
        <div className="report-filters">
          <div className="form-group">
            <label htmlFor="start_date">Start Date</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_date">End Date</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="report_type">Report Type</label>
            <select
              id="report_type"
              name="report_type"
              value={filters.report_type}
              onChange={handleFilterChange}
            >
              <option value="summary">Summary Report</option>
              <option value="detailed">Detailed Records</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Report */}
      {filters.report_type === 'summary' && (
        <div className="card">
          <h2 style={{ marginBottom: '16px', color: '#333' }}>
            Working Status - ADC Channels ({format(new Date(filters.start_date), 'MMM dd, yyyy')} to {format(new Date(filters.end_date), 'MMM dd, yyyy')})
          </h2>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Cumulative downtime during the period from {format(new Date(filters.start_date), 'MMM dd, yyyy')} to {format(new Date(filters.end_date), 'MMM dd, yyyy')}
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Sr.</th>
                  <th>Channel</th>
                  <th colSpan="2">Downtime in mins (Cumulative for the period)</th>
                  <th>Downtime (Minutes) - Last 24h</th>
                  <th>From (Time)</th>
                  <th>To (Time)</th>
                  <th>Scheduled /Un-Scheduled</th>
                  <th>Reason</th>
                </tr>
                <tr>
                  <th></th>
                  <th></th>
                  <th>Scheduled</th>
                  <th>Unscheduled</th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((channel, index) => {
                  const last24Hours = getLast24HoursData(channel.channel_id);
                  const hasLast24Hours = last24Hours.length > 0;
                  
                  return (
                    <tr key={channel.channel_id}>
                      <td>{index + 1}</td>
                      <td>{channel.channel_name}</td>
                      <td>{channel.scheduled_downtime || 0}</td>
                      <td>{channel.unscheduled_downtime || 0}</td>
                      <td>
                        {hasLast24Hours ? 
                          last24Hours.reduce((sum, record) => sum + record.duration_minutes, 0) : 
                          'Nil'
                        }
                      </td>
                      <td>
                        {hasLast24Hours ? 
                          formatTime(last24Hours[0].start_time) : 
                          'Nil'
                        }
                      </td>
                      <td>
                        {hasLast24Hours ? 
                          formatTime(last24Hours[0].end_time) : 
                          'Nil'
                        }
                      </td>
                      <td>
                        {hasLast24Hours ? 
                          last24Hours[0].downtime_type === 'scheduled' ? 'Scheduled' : 'Un-Scheduled' : 
                          'Nil'
                        }
                      </td>
                      <td>
                        {hasLast24Hours ? 
                          last24Hours[0].reason || 'Reason awaited' : 
                          'Nil'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Records */}
      {filters.report_type === 'detailed' && (
        <div className="card">
          <h2 style={{ marginBottom: '16px', color: '#333' }}>
            Detailed Downtime Records
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Type</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration (mins)</th>
                  <th>Reason</th>
                  <th>Recorded By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {detailedRecords.map((record) => (
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
                    <td>{formatTime(record.start_time)}</td>
                    <td>{formatTime(record.end_time)}</td>
                    <td>{record.duration_minutes}</td>
                    <td>{record.reason || '-'}</td>
                    <td>{record.recorded_by}</td>
                    <td>{format(new Date(record.start_time), 'MMM dd, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {detailedRecords.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '20px' }}>
              No downtime records found for the selected period.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;