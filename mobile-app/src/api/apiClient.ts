import axios from 'axios';

// Geliştirme aşaması için kendi bilgisayarınızın yerel IP adresini (IPv4) yazmalısınız.
// Örnek: 'http://192.168.1.100:5000/api'
// Canlıya alırken Hostinger URL'si ile değiştirilecek.
const API_URL = 'http://10.0.2.2:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
