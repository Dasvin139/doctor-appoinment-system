import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser            = (data)         => API.post('/auth/register', data);
export const loginUser               = (data)         => API.post('/auth/login', data);
export const forgotPassword          = (data)         => API.post('/auth/forgot-password', data);

export const getMyProfile            = ()             => API.get('/profile');
export const updateMyProfile         = (data)         => API.put('/profile', data);

export const getAllDoctors            = (params)       => API.get('/doctors', { params });
export const getDoctorById           = (id)           => API.get(`/doctors/${id}`);

export const createSlot              = (data)         => API.post('/slots', data);
export const createBulkSlots         = (data)         => API.post('/slots/bulk', data);
export const getMySlots              = (params)       => API.get('/slots/my-slots', { params });
export const getDoctorSlots          = (id, params)   => API.get(`/slots/doctor/${id}`, { params });
export const deleteSlot              = (id)           => API.delete(`/slots/${id}`);

export const bookAppointment         = (data)         => API.post('/appointments', data);
export const getMyAppointments       = (params)       => API.get('/appointments/mine', { params });
export const getDoctorAppointments   = (params)       => API.get('/appointments/doctor', { params });
export const updateAppointmentStatus = (id, data)     => API.put(`/appointments/${id}/status`, data);

export const getPendingDoctors       = ()             => API.get('/admin/doctors/pending');
export const getAdminAllDoctors      = (params)       => API.get('/admin/doctors', { params });
export const verifyDoctor            = (userId)       => API.put(`/admin/doctors/${userId}/verify`);
export const rejectDoctor            = (userId, data) => API.put(`/admin/doctors/${userId}/reject`, data);
export const getAdminAllUsers        = (params)       => API.get('/admin/users', { params });
export const toggleUserStatus        = (id)           => API.put(`/admin/users/${id}/toggle`);
export const getAnalytics            = ()             => API.get('/admin/analytics');

export default API;
