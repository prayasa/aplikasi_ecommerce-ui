// lib/auth.ts

import axios from 'axios';

// URL backend Laravel Anda, didefinisikan langsung di sini
const API_URL = "http://127.0.0.1:8000/api";

/**
 * Fungsi untuk login ke backend.
 * Mengirim email dan password, dan jika berhasil, menyimpan token ke localStorage.
 * @param email - Email pengguna
 * @param password - Password pengguna
 * @returns Data respons dari server jika berhasil
 */
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,      // Menggunakan 'email' sesuai dengan AuthController.php Anda
    password,
  });

  // Jika respons memiliki token, simpan di localStorage
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }

  return response.data;
};

/**
 * Fungsi untuk logout.
 * Menghapus token dari localStorage dan memanggil endpoint logout di backend.
 */
export const logout = async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      await axios.post(
        `${API_URL}/logout`,
        {}, // Body kosong
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Gagal saat logout di server:", error);
    }
  }
  // Selalu hapus token dari local storage, bahkan jika panggilan server gagal
  localStorage.removeItem('authToken');
};

/**
 * Fungsi untuk mendapatkan token dari localStorage.
 * @returns Token autentikasi atau null jika tidak ada.
 */
export const getToken = () => {
  // Pastikan kode ini hanya berjalan di sisi client
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};