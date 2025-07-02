import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('monthly');

  useEffect(() => {
    fetchAttendanceReport();
  }, []);

  const fetchAttendanceReport = async () => {
    setLoading(true);
    try {
      const response = await attendanceAPI.getAdminReport();
      setAttendanceData(response.data);
    } catch (error) {
      toast.error('Failed to fetch attendance report');
    }
    setLoading(false);
  };

  const downloadReport = () => {
    const csvContent = [
      ['Employee', 'Date', 'Clock In', 'Clock Out', 'Total Hours', 'Status'],
      ...attendanceData.map(record => [
        `${record.user?.first_name || ''} ${record.user?.last_name || ''}`,
        record.date,
        record.clock_in ? new Date(record.clock_in).toLocaleTimeString() : 'N/A',
        record.clock_out ? new Date(record.clock_out).toLocaleTimeString() : 'N/A',
        record.total_hours || '0.00',
        record.is_present ? 'Present' : 'Absent'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully!');
  };

  const calculateStats = () => {
    const totalRecords = attendanceData.length;
    const presentRecords = attendanceData.filter(record => record.is_present).length;
    const totalHours = attendanceData.reduce((sum, record) => sum + parseFloat(record.total_hours || 0), 0);
    const avgHours = totalRecords > 0 ? (totalHours / totalRecords).toFixed(2) : 0;

    return {
      totalRecords,
      presentRecords,
      absentRecords: totalRecords - presentRecords,
      totalHours: totalHours.toFixed(2),
      avgHours
    };
  };

  const stats = calculateStats();

  return (
    <div className="container">
      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
          <h1 className="text-2xl font-bold" style={{color: '#111827'}}>Attendance Reports</h1>
          <div style={{display: 'flex', gap: '12px'}}>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-input"
              style={{width: 'auto'}}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button onClick={downloadReport} className="btn btn-success">
              Download CSV
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4" style={{marginBottom: '24px'}}>
          <div className="card" style={{padding: '16px'}}>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue">{stats.totalRecords}</div>
              <p style={{fontSize: '14px', color: '#6b7280'}}>Total Records</p>
            </div>
          </div>
          <div className="card" style={{padding: '16px'}}>
            <div className="text-center">
              <div className="text-3xl font-bold text-green">{stats.presentRecords}</div>
              <p style={{fontSize: '14px', color: '#6b7280'}}>Present Days</p>
            </div>
          </div>
          <div className="card" style={{padding: '16px'}}>
            <div className="text-center">
              <div className="text-3xl font-bold text-red">{stats.absentRecords}</div>
              <p style={{fontSize: '14px', color: '#6b7280'}}>Absent Days</p>
            </div>
          </div>
          <div className="card" style={{padding: '16px'}}>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{color: '#f59e0b'}}>{stats.avgHours}</div>
              <p style={{fontSize: '14px', color: '#6b7280'}}>Avg Hours/Day</p>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="card">
          <h3 className="font-bold mb-4" style={{color: '#111827'}}>Attendance Records</h3>
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
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{borderBottom: '2px solid #e5e7eb'}}>
                    <th style={{padding: '12px', textAlign: 'left', color: '#374151'}}>Employee</th>
                    <th style={{padding: '12px', textAlign: 'left', color: '#374151'}}>Date</th>
                    <th style={{padding: '12px', textAlign: 'left', color: '#374151'}}>Clock In</th>
                    <th style={{padding: '12px', textAlign: 'left', color: '#374151'}}>Clock Out</th>
                    <th style={{padding: '12px', textAlign: 'left', color: '#374151'}}>Total Hours</th>
                    <th style={{padding: '12px', textAlign: 'left', color: '#374151'}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((record, index) => (
                    <tr key={index} style={{borderBottom: '1px solid #f3f4f6'}}>
                      <td style={{padding: '12px'}}>
                        {record.user?.first_name} {record.user?.last_name}
                      </td>
                      <td style={{padding: '12px'}}>{record.date}</td>
                      <td style={{padding: '12px'}}>
                        {record.clock_in ? new Date(record.clock_in).toLocaleTimeString() : 'N/A'}
                      </td>
                      <td style={{padding: '12px'}}>
                        {record.clock_out ? new Date(record.clock_out).toLocaleTimeString() : 'N/A'}
                      </td>
                      <td style={{padding: '12px'}}>{record.total_hours || '0.00'}</td>
                      <td style={{padding: '12px'}}>
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
    </div>
  );
};

export default AdminReports;