import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminLeaveApproval = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await attendanceAPI.getLeaveRequests();
      setLeaveRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    }
    setLoading(false);
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await attendanceAPI.approveLeave(leaveId);
      toast.success('Leave approved successfully!');
      fetchLeaveRequests();
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await attendanceAPI.rejectLeave(leaveId);
      toast.success('Leave rejected');
      fetchLeaveRequests();
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4" style={{color: '#111827'}}>Leave Approval</h1>
        
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
          </div>
        ) : (
          <div style={{maxHeight: '600px', overflowY: 'auto'}}>
            {leaveRequests.map((request) => (
              <div key={request.id} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: '#ffffff'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div style={{flex: 1}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px'}}>
                      <h4 style={{margin: 0, fontWeight: 'bold', fontSize: '16px'}}>{request.employee_name}</h4>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        backgroundColor: request.status === 'approved' ? '#d1fae5' : request.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                        color: request.status === 'approved' ? '#065f46' : request.status === 'rejected' ? '#991b1b' : '#92400e'
                      }}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280', marginBottom: '4px'}}>
                      <span>ID: {request.employee_id}</span>
                      <span>{request.leave_type.replace('_', ' ').toUpperCase()}</span>
                      <span>{request.start_date} to {request.end_date}</span>
                    </div>
                    <p style={{margin: 0, fontSize: '13px', color: '#374151'}}>{request.reason}</p>
                  </div>
                  {request.status === 'pending' && (
                    <div style={{display: 'flex', gap: '6px'}}>
                      <button
                        onClick={() => handleApproveLeave(request.id)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px'
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectLeave(request.id)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px'
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLeaveApproval;