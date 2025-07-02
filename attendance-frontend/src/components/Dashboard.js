import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodayAttendance();
    fetchLeaveBalance();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceAPI.getTodayAttendance();
      setTodayAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await attendanceAPI.getLeaveBalance();
      setLeaveBalance(response.data);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    try {
      await attendanceAPI.clockIn();
      toast.success('Clocked in successfully!');
      fetchTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Clock in failed');
    }
    setLoading(false);
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      await attendanceAPI.clockOut();
      toast.success('Clocked out successfully!');
      fetchTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Clock out failed');
    }
    setLoading(false);
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="card" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', marginBottom: '30px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1 style={{fontSize: '28px', fontWeight: '700', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p style={{color: 'rgba(255,255,255,0.9)', fontSize: '16px'}}>{formatDate(currentTime)}</p>
            <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginTop: '4px'}}>
              {isAdmin ? 'Administrator Dashboard' : 'Employee Portal'}
            </p>
          </div>
          <div className="text-center">
            <div style={{fontSize: '36px', fontWeight: '700', fontFamily: 'monospace', textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>
              {formatTime(currentTime)}
            </div>
            <p style={{fontSize: '14px', color: 'rgba(255,255,255,0.9)'}}>Current Time</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4">
        <div className="card">
          <h3 className="font-bold mb-4" style={{color: '#111827'}}>Today's Attendance</h3>
          <div>
            {todayAttendance?.clock_in ? (
              <div style={{marginBottom: '12px'}}>
                <p style={{fontSize: '14px', color: '#6b7280'}}>Clock In</p>
                <p className="font-bold text-green">
                  {new Date(todayAttendance.clock_in).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <button
                onClick={handleClockIn}
                disabled={loading}
                className="btn btn-success"
                style={{width: '100%', marginBottom: '12px'}}
              >
                Clock In
              </button>
            )}
            
            {todayAttendance?.clock_out ? (
              <div>
                <p style={{fontSize: '14px', color: '#6b7280'}}>Clock Out</p>
                <p className="font-bold text-red">
                  {new Date(todayAttendance.clock_out).toLocaleTimeString()}
                </p>
              </div>
            ) : todayAttendance?.clock_in ? (
              <button
                onClick={handleClockOut}
                disabled={loading}
                className="btn btn-danger"
                style={{width: '100%'}}
              >
                Clock Out
              </button>
            ) : null}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4" style={{color: '#111827'}}>Working Hours</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue">
              {todayAttendance?.total_hours || '0.00'}
            </div>
            <p style={{fontSize: '14px', color: '#6b7280'}}>Hours Today</p>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4" style={{color: '#111827'}}>Leave Balance</h3>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{color: '#f59e0b'}}>
              {leaveBalance?.remaining_leaves || 0}
            </div>
            <p style={{fontSize: '14px', color: '#6b7280'}}>Days Remaining</p>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4" style={{color: '#111827'}}>Status</h3>
          <div className="text-center">
            <div style={{
              display: 'inline-flex',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: todayAttendance?.is_present ? '#d1fae5' : '#f3f4f6',
              color: todayAttendance?.is_present ? '#065f46' : '#374151'
            }}>
              {todayAttendance?.is_present ? 'Present' : 'Absent'}
            </div>
          </div>
        </div>
      </div>

      {/* Professional Details */}
      <div className="card">
        <h3 className="font-bold mb-4" style={{color: '#111827'}}>Professional Details</h3>
        <div className="grid grid-cols-3">
          <div>
            <p style={{fontSize: '14px', color: '#6b7280'}}>Employee ID</p>
            <p className="font-bold">{user?.employee_id || 'N/A'}</p>
          </div>
          <div>
            <p style={{fontSize: '14px', color: '#6b7280'}}>Department</p>
            <p className="font-bold">{user?.department || 'N/A'}</p>
          </div>
          <div>
            <p style={{fontSize: '14px', color: '#6b7280'}}>Designation</p>
            <p className="font-bold">{user?.designation || 'N/A'}</p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="card">
          <h3 className="font-bold mb-4" style={{color: '#111827'}}>Admin Quick Actions</h3>
          <div className="grid grid-cols-2">
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/admin/employees'}
            >
              View All Employees
            </button>
            <button 
              className="btn btn-success"
              onClick={() => window.location.href = '/admin/reports'}
            >
              Generate Reports
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;