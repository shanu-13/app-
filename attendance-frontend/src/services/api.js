import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          return api.request(error.config);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    try {
      return await api.post('/auth/login/', credentials);
    } catch (error) {
      console.error('Login API Error:', error);
      throw error;
    }
  },
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/update/', data),
  createUser: (userData) => api.post('/auth/create-user/', userData),
  getUsers: () => api.get('/auth/users/'),
};

export const attendanceAPI = {
  clockIn: () => api.post('/attendance/clock-in/'),
  clockOut: () => api.post('/attendance/clock-out/'),
  getTodayAttendance: () => api.get('/attendance/today/'),
  getAttendanceHistory: () => api.get('/attendance/history/'),
  requestLeave: (leaveData) => api.post('/attendance/leave/request/', leaveData),
  getLeaveBalance: () => api.get('/attendance/leave/balance/'),
  getAdminReport: () => api.get('/attendance/admin/report/'),
  getLeaveRequests: () => api.get('/attendance/leave/requests/'),
  approveLeave: (leaveId) => api.patch(`/attendance/leave/${leaveId}/approve/`),
  rejectLeave: (leaveId) => api.patch(`/attendance/leave/${leaveId}/reject/`),
};

export const userAPI = {
  changePassword: (passwordData) => api.post('/auth/change-password/', passwordData),
};

export default api;