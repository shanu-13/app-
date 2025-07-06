import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const OrganizationSelection = () => {
  const [organizations, setOrganizations] = useState([]);
  const [showRegistration, setShowRegistration] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await api.get('/organizations/list/');
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationSelect = (orgId) => {
    localStorage.setItem('selectedOrganization', orgId);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="org-selection-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto'}}></div>
          <p style={{marginTop: '16px', color: '#6b7280'}}>Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="org-selection-page">
      <div className="org-header">
        <h1 className="org-title">
          Professional Attendance Management System
        </h1>
        <p className="org-subtitle">
          Streamline your organization's attendance tracking with our comprehensive solution
        </p>
      </div>

      <div className="org-content">
        {!showRegistration ? (
          <>
            {organizations.length > 0 ? (
              <div className="org-grid">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => handleOrganizationSelect(org.id)}
                    className="org-card"
                  >
                    {org.logo && (
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="org-logo"
                      />
                    )}
                    <h3 className="org-name">{org.name}</h3>
                    <p className="org-email">{org.email}</p>
                    {org.website && (
                      <a href={org.website} className="org-website" onClick={(e) => e.stopPropagation()}>
                        {org.website}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="org-empty">
                <div className="org-empty-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="org-empty-title">No Organizations Found</h3>
                <p className="org-empty-text">Be the first to register your organization</p>
              </div>
            )}
            
            <div style={{textAlign: 'center'}}>
              <button
                onClick={() => setShowRegistration(true)}
                className="register-btn"
              >
                Register New Organization
              </button>
            </div>
          </>
        ) : (
          <OrganizationRegistration 
            onBack={() => setShowRegistration(false)}
            onSuccess={() => {
              setShowRegistration(false);
              fetchOrganizations();
            }}
          />
        )}
      </div>
    </div>
  );
};

const OrganizationRegistration = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    admin_username: '',
    admin_password: '',
    admin_email: '',
    admin_first_name: '',
    admin_last_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/organizations/register/', formData);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="registration-form">
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px'}}>
        <h2 style={{fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', margin: 0}}>Register Organization</h2>
        <button
          onClick={onBack}
          style={{background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer'}}
        >
          <svg style={{width: '24px', height: '24px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div style={{background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '6px', marginBottom: '20px'}}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-section">
            <h3>Organization Details</h3>
            <input
              type="text"
              name="name"
              placeholder="Organization Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="professional-input"
            />
            <input
              type="email"
              name="email"
              placeholder="Organization Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="professional-input"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="professional-input"
            />
            <input
              type="url"
              name="website"
              placeholder="Website (optional)"
              value={formData.website}
              onChange={handleChange}
              className="professional-input"
            />
            <textarea
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="professional-textarea"
            />
          </div>

          <div className="form-section">
            <h3>Admin Account</h3>
            <input
              type="text"
              name="admin_first_name"
              placeholder="First Name"
              value={formData.admin_first_name}
              onChange={handleChange}
              required
              className="professional-input"
            />
            <input
              type="text"
              name="admin_last_name"
              placeholder="Last Name"
              value={formData.admin_last_name}
              onChange={handleChange}
              required
              className="professional-input"
            />
            <input
              type="email"
              name="admin_email"
              placeholder="Admin Email"
              value={formData.admin_email}
              onChange={handleChange}
              required
              className="professional-input"
            />
            <input
              type="text"
              name="admin_username"
              placeholder="Username"
              value={formData.admin_username}
              onChange={handleChange}
              required
              className="professional-input"
            />
            <input
              type="password"
              name="admin_password"
              placeholder="Password"
              value={formData.admin_password}
              onChange={handleChange}
              required
              className="professional-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="register-btn"
          >
            {loading ? 'Registering...' : 'Register Organization'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationSelection;