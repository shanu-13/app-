import React, { useState } from 'react';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const ChangePassword = ({ onClose }) => {
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await userAPI.changePassword({
        old_password: passwords.old_password,
        new_password: passwords.new_password
      });
      toast.success('Password changed successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="text-2xl font-bold mb-4">Change Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Current Password"
            className="form-input"
            value={passwords.old_password}
            onChange={(e) => setPasswords({...passwords, old_password: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            className="form-input"
            value={passwords.new_password}
            onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="form-input"
            value={passwords.confirm_password}
            onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
            required
          />
          <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
            <button type="submit" className="btn btn-primary">Change Password</button>
            <button type="button" onClick={onClose} className="btn" style={{backgroundColor: '#6b7280', color: 'white'}}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;