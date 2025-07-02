import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';

const LeaveManagement = () => {
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({
    leave_type: 'full_day',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const response = await attendanceAPI.getLeaveBalance();
      setLeaveBalance(response.data);
    } catch (error) {
      toast.error('Failed to fetch leave balance');
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    try {
      await attendanceAPI.requestLeave(leaveRequest);
      toast.success('Leave request submitted successfully!');
      setShowRequestForm(false);
      setLeaveRequest({
        leave_type: 'full_day',
        start_date: '',
        end_date: '',
        reason: ''
      });
      fetchLeaveBalance();
    } catch (error) {
      toast.error('Failed to submit leave request');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
          <h1 className="text-2xl font-bold" style={{color: '#111827'}}>Leave Management</h1>
          <button
            onClick={() => setShowRequestForm(true)}
            className="btn btn-primary"
          >
            Request Leave
          </button>
        </div>

        {/* Leave Balance */}
        <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
          <div style={{backgroundColor: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1, textAlign: 'center'}}>
            <div className="text-2xl font-bold text-blue">{leaveBalance?.total_allowed || 4}</div>
            <p style={{fontSize: '12px', color: '#6b7280'}}>Total Allowed</p>
          </div>
          <div style={{backgroundColor: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1, textAlign: 'center'}}>
            <div className="text-2xl font-bold text-red">{leaveBalance?.used_leaves || 0}</div>
            <p style={{fontSize: '12px', color: '#6b7280'}}>Used Leaves</p>
          </div>
          <div style={{backgroundColor: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1, textAlign: 'center'}}>
            <div className="text-2xl font-bold text-green">{leaveBalance?.remaining_leaves || 4}</div>
            <p style={{fontSize: '12px', color: '#6b7280'}}>Remaining</p>
          </div>
        </div>

        {/* Calendar View */}
        <div className="card">
          <h3 className="font-bold mb-4" style={{color: '#111827'}}>Monthly Calendar</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            textAlign: 'center'
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{
                padding: '8px',
                fontWeight: 'bold',
                backgroundColor: '#f3f4f6',
                color: '#374151'
              }}>
                {day}
              </div>
            ))}
            {Array.from({length: 30}, (_, i) => (
              <div key={i} style={{
                padding: '12px',
                border: '1px solid #e5e7eb',
                backgroundColor: Math.random() > 0.8 ? '#fee2e2' : 'white',
                color: Math.random() > 0.8 ? '#991b1b' : '#374151'
              }}>
                {i + 1}
              </div>
            ))}
          </div>
          <p style={{fontSize: '12px', color: '#6b7280', marginTop: '12px'}}>
            Red dates indicate leave days
          </p>
        </div>
      </div>

      {/* Leave Request Modal */}
      {showRequestForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-2xl font-bold mb-4" style={{color: '#111827'}}>Request Leave</h2>
            <form onSubmit={handleSubmitLeave}>
              <select
                className="form-input"
                value={leaveRequest.leave_type}
                onChange={(e) => setLeaveRequest({...leaveRequest, leave_type: e.target.value})}
                required
              >
                <option value="full_day">Full Day</option>
                <option value="half_day">Half Day</option>
                <option value="sick">Sick Leave</option>
              </select>
              
              <input
                type="date"
                className="form-input"
                placeholder="Start Date"
                value={leaveRequest.start_date}
                onChange={(e) => setLeaveRequest({...leaveRequest, start_date: e.target.value})}
                required
              />
              
              <input
                type="date"
                className="form-input"
                placeholder="End Date"
                value={leaveRequest.end_date}
                onChange={(e) => setLeaveRequest({...leaveRequest, end_date: e.target.value})}
                required
              />
              
              <textarea
                className="form-input"
                placeholder="Reason for leave"
                value={leaveRequest.reason}
                onChange={(e) => setLeaveRequest({...leaveRequest, reason: e.target.value})}
                rows="3"
                required
              ></textarea>
              
              <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                <button type="submit" className="btn btn-primary">Submit Request</button>
                <button 
                  type="button" 
                  onClick={() => setShowRequestForm(false)}
                  className="btn"
                  style={{backgroundColor: '#6b7280', color: 'white'}}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;