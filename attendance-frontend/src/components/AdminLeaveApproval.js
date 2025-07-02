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
          <div>
            {leaveRequests.map((request) => (
              <div key={request.id} className="card" style={{marginBottom: '16px', padding: '16px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <h3 className="font-bold">{request.user?.first_name} {request.user?.last_name}</h3>
                    <p style={{color: '#6b7280', fontSize: '14px'}}>
                      {request.leave_type} - {request.start_date} to {request.end_date}
                    </p>
                    <p style={{marginTop: '8px'}}>{request.reason}</p>
                  </div>
                  <div style={{display: 'flex', gap: '8px'}}>
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveLeave(request.id)}
                          className="btn btn-success"
                          style={{padding: '8px 16px'}}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectLeave(request.id)}
                          className="btn btn-danger"
                          style={{padding: '8px 16px'}}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: request.status === 'approved' ? '#d1fae5' : request.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                      color: request.status === 'approved' ? '#065f46' : request.status === 'rejected' ? '#991b1b' : '#92400e'
                    }}>
                      {request.status}
                    </span>
                  </div>
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