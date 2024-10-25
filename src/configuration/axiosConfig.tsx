import axios, { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const tokenString = sessionStorage.getItem('token');
        const tokenData = tokenString ? JSON.parse(tokenString) : null;
        const deviceId = sessionStorage.getItem('deviceId');

        if (tokenData) {
            config.headers['Authorization'] = `Bearer ${tokenData.token}`;
            config.headers['fs-user-id'] = tokenData.fsUserId;
            config.headers['device-id'] = deviceId;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
