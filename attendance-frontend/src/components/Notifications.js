import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await attendanceAPI.getNotifications();
      setNotifications(response.data);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    }
    setLoading(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await attendanceAPI.markNotificationRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? {...notif, is_read: true} : notif
      ));
      // Trigger event to update sidebar badge
      window.dispatchEvent(new CustomEvent('notificationRead'));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave_approved':
        return '✅';
      case 'leave_rejected':
        return '❌';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'leave_approved':
        return '#d1fae5';
      case 'leave_rejected':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4" style={{color: '#111827'}}>Notifications</h1>
        
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
            {notifications.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px', color: '#6b7280'}}>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '12px',
                    backgroundColor: notification.is_read ? '#ffffff' : getNotificationColor(notification.notification_type),
                    opacity: notification.is_read ? 0.7 : 1,
                    cursor: notification.is_read ? 'default' : 'pointer'
                  }}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div style={{display: 'flex', alignItems: 'flex-start', gap: '12px'}}>
                    <div style={{fontSize: '20px', marginTop: '2px'}}>
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
                        <h3 style={{
                          margin: 0, 
                          fontSize: '16px', 
                          fontWeight: 'bold',
                          color: '#111827'
                        }}>
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <span style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%',
                            display: 'inline-block'
                          }}></span>
                        )}
                      </div>
                      <p style={{
                        margin: 0, 
                        fontSize: '14px', 
                        color: '#374151',
                        lineHeight: '1.5',
                        marginBottom: '8px'
                      }}>
                        {notification.message}
                      </p>
                      <p style={{
                        margin: 0, 
                        fontSize: '12px', 
                        color: '#6b7280'
                      }}>
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;