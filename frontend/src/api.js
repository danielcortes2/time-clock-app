import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const register = async (email, password, name) => {
  const response = await api.post('/register', { email, password, full_name: name });
  return response.data;
};

export const createUser = async (email, password, name, is_admin = false) => {
  const response = await api.post('/create-user', { email, password, full_name: name, is_superuser: is_admin });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/me');
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

export const exportEntries = async () => {
  const response = await api.get('/export-entries', { responseType: 'blob' });
  return response.data;
};

export const clockIn = async () => {
  const response = await api.post('/clock-in');
  return response.data;
};

export const clockOut = async () => {
  const response = await api.post('/clock-out');
  return response.data;
};

export const getMyEntries = async () => {
  const response = await api.get('/my-entries');
  return response.data;
};

export const getAllEntries = async () => {
  const response = await api.get('/all-entries');
  return response.data;
};

export const getMySchedule = async () => {
  const response = await api.get('/my-schedule');
  return response.data;
};

export const getUserSchedule = async (userId) => {
  const response = await api.get(`/schedules/${userId}`);
  return response.data;
};

export const setUserSchedule = async (userId, entries) => {
  const response = await api.put(`/schedules/${userId}`, { entries });
  return response.data;
};

export default api;