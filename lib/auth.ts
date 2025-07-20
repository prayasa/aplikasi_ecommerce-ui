// lib/auth.ts

import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/api";

// ====================================================================
// apiClient SEKARANG MENJADI SATU-SATUNYA CARA UNTUK BERBICARA DENGAN API
// ====================================================================
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
  }
});

apiClient.interceptors.request.use(
  (config) => {
    // Pastikan ini hanya berjalan di browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// ====================================================================


export const login = async (email, password) => {
  const response = await apiClient.post('/login', {
    email,
    password,
  });

  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  return response.data;
};

// --- FUNGSI BARU YANG DIPERBAIKI ---
export const customerLogin = async (email, password) => {
  const response = await apiClient.post('/customer/login', {
    email,
    password,
  });

  if (response.data.customer) {
    localStorage.setItem('customerData', JSON.stringify(response.data.customer));
  }
  localStorage.removeItem('authToken');
  return response.data;
};

export const logout = async () => {
  try {
    // Endpoint logout dilindungi, jadi apiClient akan otomatis menambahkan token
    await apiClient.post('/logout');
  } catch (error) {
    console.error("Gagal saat logout di server:", error);
  }
  localStorage.removeItem('authToken');
  localStorage.removeItem('customerData');
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};