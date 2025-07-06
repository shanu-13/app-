import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';

const EmployeeLeaveManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await attendanceAPI.getEmployeesLeaveManagement();
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
    setLoading(false);
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await attendanceAPI.approveLeave(leaveId);
      toast.success('Leave approved successfully!');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await attendanceAPI.rejectLeave(leaveId);
      toast.success('Leave rejected');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4" style={{color: '#111827'}}>Employee Leave Management</h1>
        
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
          <div style={{display: 'grid', gap: '16px'}}>
            {employees.map((employee) => (
              <div key={employee.id} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#ffffff'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
                  <div>
                    <h3 style={{margin: 0, fontWeight: 'bold', fontSize: '18px', color: '#111827'}}>
                      {employee.name}
                    </h3>
                    <div style={{display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280', marginTop: '4px'}}>
                      <span>ID: {employee.employee_id || 'N/A'}</span>
                      <span>Email: {employee.email}</span>
                      {employee.designation && <span>Role: {employee.designation}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEmployee(selectedEmployee === employee.id ? null : employee.id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px'
                    }}
                  >
                    {selectedEmployee === employee.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {/* Leave Balance */}
                <div style={{display: 'flex', gap: '12px', marginBottom: '12px'}}>
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    textAlign: 'center',
                    flex: 1
                  }}>
                    <div style={{fontWeight: 'bold', color: '#3b82f6'}}>{employee.leave_balance.total_allowed}</div>
                    <div style={{fontSize: '11px', color: '#6b7280'}}>Total</div>
                  </div>
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    textAlign: 'center',
                    flex: 1
                  }}>
                    <div style={{fontWeight: 'bold', color: '#ef4444'}}>{employee.leave_balance.used_leaves}</div>
                    <div style={{fontSize: '11px', color: '#6b7280'}}>Used</div>
                  </div>
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    textAlign: 'center',
                    flex: 1
                  }}>
                    <div style={{fontWeight: 'bold', color: '#10b981'}}>{employee.leave_balance.remaining_leaves}</div>
                    <div style={{fontSize: '11px', color: '#6b7280'}}>Remaining</div>
                  </div>
                </div>

                {/* Recent Leave Requests */}
                {selectedEmployee === employee.id && (
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '12px',
                    marginTop: '12px'
                  }}>
                    <h4 style={{margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold'}}>Recent Leave Requests</h4>
                    {employee.recent_leave_requests.length === 0 ? (
                      <p style={{fontSize: '13px', color: '#6b7280', margin: 0}}>No leave requests found</p>
                    ) : (
                      <div style={{display: 'grid', gap: '8px'}}>
                        {employee.recent_leave_requests.map((request) => (
                          <div key={request.id} style={{
                            backgroundColor: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            padding: '8px'
                          }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                              <div>
                                <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px'}}>
                                  <span style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                  }}>
                                    {request.leave_type.replace('_', ' ')}
                                  </span>
                                  <span style={{
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    fontSize: '10px',
                                    backgroundColor: request.status === 'approved' ? '#d1fae5' : request.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                    color: request.status === 'approved' ? '#065f46' : request.status === 'rejected' ? '#991b1b' : '#92400e'
                                  }}>
                                    {request.status.toUpperCase()}
                                  </span>
                                </div>
                                <div style={{fontSize: '11px', color: '#6b7280'}}>
                                  {request.start_date} to {request.end_date}
                                </div>
                                <div style={{fontSize: '11px', color: '#374151', marginTop: '2px'}}>
                                  {request.reason}
                                </div>
                              </div>
                              {request.status === 'pending' && (
                                <div style={{display: 'flex', gap: '4px'}}>
                                  <button
                                    onClick={() => handleApproveLeave(request.id)}
                                    style={{
                                      padding: '4px 8px',
                                      fontSize: '10px',
                                      backgroundColor: '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '3px'
                                    }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectLeave(request.id)}
                                    style={{
                                      padding: '4px 8px',
                                      fontSize: '10px',
                                      backgroundColor: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '3px'
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeLeaveManagement;