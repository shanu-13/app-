import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [organization, setOrganization] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const fetchOrganization = useCallback(async (orgId) => {
    try {
      const response = await api.get('/organizations/list/');
      const org = response.data.find(o => o.id.toString() === orgId);
      setOrganization(org);
    } catch (error) {
      console.error('Error fetching organization:', error);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const selectedOrgId = localStorage.getItem('selectedOrganization');
    if (!selectedOrgId) {
      navigate('/');
      return;
    }
    fetchOrganization(selectedOrgId);
  }, [navigate, fetchOrganization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(credentials.username, credentials.password);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  const handleBackToOrganizations = () => {
    localStorage.removeItem('selectedOrganization');
    navigate('/');
  };

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <div className="login-header">
            <button
              onClick={handleBackToOrganizations}
              className="login-back-btn"
            >
              <svg style={{width: '16px', height: '16px', marginRight: '4px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Organizations
            </button>
            
            {organization.logo && (
              <img
                src={organization.logo}
                alt={organization.name}
                className="login-org-logo"
              />
            )}
            
            <h2 className="login-org-name">
              {organization.name}
            </h2>
            <p className="login-subtitle">
              Sign in to your account
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              required
              className="login-input"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
            <input
              type="password"
              required
              className="login-input"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />

            <button
              type="submit"
              disabled={loading}
              className="login-btn"
            >
              {loading ? (
                <div className="login-loading">
                  <div className="login-spinner"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <p className="login-footer-text">
              Professional Attendance Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;