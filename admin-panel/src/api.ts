import axios from 'axios';

const API_URL = 'https://mylanguage.site/api/admin';

// Sayfa yenilense bile tokanı korumak için localStorage kullanıyoruz
const getStoredToken = () => localStorage.getItem('adminToken') || '';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Her istekte güncel token'ı ekle
api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
        config.headers['x-admin-token'] = token;
    }
    return config;
});

export const loginAdmin = async (username: string, password: string) => {
    const res = await api.post('/login', { username, password });
    if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminRole', res.data.role.toString());
    }
    return res.data;
};

export const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
};

export const getContents = async () => {
    const res = await api.get('/content');
    return res.data.contents;
};

export const createContent = async (data: any) => {
    const res = await api.post('/content', data);
    return res.data.content;
};

export const bulkCreateContent = async (dataArray: any[]) => {
    const res = await api.post('/content/bulk', dataArray);
    return res.data;
};

export const deleteContent = async (id: string) => {
    await api.delete(`/content/${id}`);
};

export const deleteAllContent = async () => {
    const res = await api.delete('/content-all');
    return res.data;
};
