import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    project: '',
    designation: '',
    status: ''
  });
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    employee_id: '',
    project: '',
    designation: '',
    date_joined_company: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, filters]);

  const fetchEmployees = async () => {
    try {
      const response = await authAPI.getUsers();
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const filterEmployees = () => {
    let filtered = employees;
    
    if (filters.project) {
      filtered = filtered.filter(emp => emp.project === filters.project);
    }
    if (filters.designation) {
      filtered = filtered.filter(emp => emp.designation === filters.designation);
    }
    if (filters.status) {
      filtered = filtered.filter(emp => filters.status === 'active' ? emp.is_active : !emp.is_active);
    }
    
    setFilteredEmployees(filtered);
  };

  const getUniqueProjects = () => {
    return [...new Set(employees.filter(emp => emp.project).map(emp => emp.project))];
  };

  const getUniqueDesignations = () => {
    return [...new Set(employees.filter(emp => emp.designation).map(emp => emp.designation))];
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const employeeData = {
        ...newEmployee,
        role: 'employee'
      };
      await authAPI.createUser(employeeData);
      toast.success('Employee created successfully!');
      setShowCreateForm(false);
      setNewEmployee({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        employee_id: '',
        project: '',
        designation: '',
        date_joined_company: ''
      });
      fetchEmployees();
    } catch (error) {
      const errorMsg = error.response?.data?.username?.[0] || 
                      error.response?.data?.email?.[0] || 
                      error.response?.data?.employee_id?.[0] || 
                      'Failed to create employee';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h1 className="text-2xl font-bold" style={{color: '#111827'}}>Employee Management</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            Create New Employee
          </button>
        </div>

        {/* Filters */}
        <div style={{display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap'}}>
          <select
            value={filters.project}
            onChange={(e) => setFilters({...filters, project: e.target.value})}
            style={{padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px'}}
          >
            <option value="">All Projects</option>
            {getUniqueProjects().map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
          <select
            value={filters.designation}
            onChange={(e) => setFilters({...filters, designation: e.target.value})}
            style={{padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px'}}
          >
            <option value="">All Designations</option>
            {getUniqueDesignations().map(designation => (
              <option key={designation} value={designation}>{designation}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            style={{padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px'}}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Employee List */}
        <div style={{maxHeight: '500px', overflowY: 'auto'}}>
          {filteredEmployees.map((employee) => (
            <div key={employee.id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '10px',
              marginBottom: '6px',
              backgroundColor: '#ffffff'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', gap: '20px', alignItems: 'center', flex: 1}}>
                  <div style={{minWidth: '120px'}}>
                    <p style={{margin: 0, fontWeight: 'bold', fontSize: '14px'}}>{employee.first_name} {employee.last_name}</p>
                    <p style={{margin: 0, fontSize: '12px', color: '#6b7280'}}>ID: {employee.employee_id || 'N/A'}</p>
                  </div>
                  <div style={{minWidth: '100px'}}>
                    <p style={{margin: 0, fontSize: '13px', fontWeight: '500'}}>{employee.project || 'No Project'}</p>
                    <p style={{margin: 0, fontSize: '12px', color: '#6b7280'}}>{employee.designation || 'N/A'}</p>
                  </div>
                  <div style={{minWidth: '80px'}}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      backgroundColor: employee.is_active ? '#d1fae5' : '#fee2e2',
                      color: employee.is_active ? '#065f46' : '#991b1b'
                    }}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Employee Modal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{width: '500px', maxHeight: '80vh', overflow: 'auto'}}>
            <h2 className="text-2xl font-bold mb-4" style={{color: '#111827'}}>Create New Employee</h2>
            <form onSubmit={handleCreateEmployee}>
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>Employee ID *</label>
                <input
                  type="text"
                  placeholder="EMP001"
                  className="form-input"
                  value={newEmployee.employee_id}
                  onChange={(e) => setNewEmployee({...newEmployee, employee_id: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2" style={{gap: '16px', marginBottom: '16px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>Username *</label>
                  <input
                    type="text"
                    placeholder="john.doe"
                    className="form-input"
                    value={newEmployee.username}
                    onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>Default Password *</label>
                  <input
                    type="password"
                    placeholder="Temporary password"
                    className="form-input"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2" style={{gap: '16px', marginBottom: '16px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>First Name *</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="form-input"
                    value={newEmployee.first_name}
                    onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>Last Name *</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="form-input"
                    value={newEmployee.last_name}
                    onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>Email Address *</label>
                <input
                  type="email"
                  placeholder="john.doe@company.com"
                  className="form-input"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2" style={{gap: '16px', marginBottom: '16px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>Project</label>
                  <input
                    type="text"
                    placeholder="Project Alpha"
                    className="form-input"
                    value={newEmployee.project}
                    onChange={(e) => setNewEmployee({...newEmployee, project: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>Job Title</label>
                  <input
                    type="text"
                    placeholder="Software Developer"
                    className="form-input"
                    value={newEmployee.designation}
                    onChange={(e) => setNewEmployee({...newEmployee, designation: e.target.value})}
                  />
                </div>
              </div>
              
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>Date Joined</label>
                <input
                  type="date"
                  className="form-input"
                  value={newEmployee.date_joined_company}
                  onChange={(e) => setNewEmployee({...newEmployee, date_joined_company: e.target.value})}
                  style={{width: '50%'}}
                />
              </div>
              
              <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                <button type="submit" className="btn btn-primary">Create Employee</button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
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

export default AdminEmployees;