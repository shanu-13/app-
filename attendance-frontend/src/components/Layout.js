import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = isAdmin ? [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Profile', href: '/profile' },
  ] : [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Attendance', href: '/attendance' },
    { name: 'Leave Management', href: '/leave' },
    { name: 'Profile', href: '/profile' },
  ];

  const adminNavigation = [
    { name: 'Employee Management', href: '/admin/employees' },
    { name: 'Leave Approval', href: '/admin/leaves' },
    { name: 'Reports', href: '/admin/reports' },
  ];

  const handleNavigation = (href) => {
    navigate(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => location.pathname === href;

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f9fafb'}}>
      <div className="sidebar">
        <div className="text-center mb-4" style={{borderBottom: '2px solid #e5e7eb', paddingBottom: '20px'}}>
          <h1 style={{fontSize: '24px', fontWeight: '700', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0}}>OrganizationHub</h1>
          <p style={{fontSize: '12px', color: '#6b7280', margin: '4px 0'}}>Attendance Management System</p>
        </div>
        
        <nav>
          <div style={{marginBottom: '20px'}}>
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className="btn"
                style={{
                  width: '100%',
                  marginBottom: '8px',
                  textAlign: 'left',
                  backgroundColor: isActive(item.href) ? '#eff6ff' : 'transparent',
                  color: isActive(item.href) ? '#3b82f6' : '#374151',
                  border: 'none',
                  padding: '12px 16px'
                }}
              >
                {item.name}
              </button>
            ))}
            
            {isAdmin && (
              <>
                <div style={{borderTop: '1px solid #e5e7eb', marginTop: '16px', paddingTop: '16px'}}>
                  <p style={{fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '16px'}}>
                    Admin
                  </p>
                </div>
                {adminNavigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className="btn"
                    style={{
                      width: '100%',
                      marginBottom: '8px',
                      textAlign: 'left',
                      backgroundColor: isActive(item.href) ? '#eff6ff' : 'transparent',
                      color: isActive(item.href) ? '#3b82f6' : '#374151',
                      border: 'none',
                      padding: '12px 16px'
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </>
            )}
          </div>
        </nav>

        <div style={{position: 'absolute', bottom: '20px', width: 'calc(100% - 40px)', borderTop: '1px solid #e5e7eb', paddingTop: '16px'}}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '16px'}}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <span style={{color: 'white', fontSize: '14px', fontWeight: '500'}}>
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </span>
            </div>
            <div>
              <p style={{fontSize: '14px', fontWeight: '500', color: '#374151', margin: 0}}>
                {user?.first_name} {user?.last_name}
              </p>
              <p style={{fontSize: '12px', color: '#6b7280', margin: 0, textTransform: 'capitalize'}}>
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-danger"
            style={{width: '100%'}}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;