import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Vite proxy will handle the rest
});

// Add a request interceptor to add the token
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            const { token } = JSON.parse(user);
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
