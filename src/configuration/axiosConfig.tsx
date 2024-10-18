import axios, { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const tokenString = sessionStorage.getItem('token');
        const tokenData = tokenString ? JSON.parse(tokenString) : null;

        if (tokenData) {
            config.headers['Authorization'] = `Bearer ${tokenData.token}`;
            config.headers['fs-user-id'] = tokenData.fsUserId;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
