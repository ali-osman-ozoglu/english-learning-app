import axios from 'axios';

// Geliştirme aşamasında localhost, canlıya alırken hostinger URL'si
const API_URL = 'http://localhost:5000/api/admin';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': 'super-secret-admin-key' // Basit güvenlik önlemi
    }
});

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
