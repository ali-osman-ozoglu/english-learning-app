import axios from 'axios';

// Geliştirme aşaması için kendi bilgisayarınızın yerel IP adresini (IPv4) yazmalısınız.
// Örnek: 'http://192.168.1.100:5000/api'
// Canlıya alırken Hostinger URL'si ile değiştirilecek.
import { getAuthToken } from '../utils/auth';

const API_URL = 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// İsteklerden önce her zaman güvenlik tokanını (X-Auth-Token) ekle
apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers['X-Auth-Token'] = token;
  } else {
    console.warn('[API Client] Uyarı: X-Auth-Token bulunamadı!');
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
