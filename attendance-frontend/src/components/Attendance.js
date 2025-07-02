import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      const response = await attendanceAPI.getAttendanceHistory();
      setAttendanceHistory(response.data);
    } catch (error) {
      toast.error('Failed to fetch attendance history');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4" style={{color: '#111827'}}>Attendance History</h1>
        
        {loading ? (
          <div className="text-center" style={{padding: '40px'}}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p style={{marginTop: '16px', color: '#6b7280'}}>Loading...</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((record, index) => (
                  <tr key={index}>
                    <td>{record.date}</td>
                    <td>{record.clock_in ? new Date(record.clock_in).toLocaleTimeString() : 'N/A'}</td>
                    <td>{record.clock_out ? new Date(record.clock_out).toLocaleTimeString() : 'N/A'}</td>
                    <td>{record.total_hours || '0.00'}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: record.is_present ? '#d1fae5' : '#fee2e2',
                        color: record.is_present ? '#065f46' : '#991b1b'
                      }}>
                        {record.is_present ? 'Present' : 'Absent'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;