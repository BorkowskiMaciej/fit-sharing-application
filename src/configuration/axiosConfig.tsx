import axios, { AxiosError, AxiosInstance } from 'axios';
import { UserToken } from '../types';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
});

export const setupAxiosInterceptors = (logout: () => void) => {
    let isLogoutMessageDisplayed = false;

    axiosInstance.interceptors.request.use(
        (config) => {
            const tokenString = sessionStorage.getItem('token');
            const tokenData: UserToken | null = tokenString ? JSON.parse(tokenString) : null;
            const deviceId = sessionStorage.getItem('deviceId');

            if (tokenData) {
                config.headers['Authorization'] = `Bearer ${tokenData.token}`;
                config.headers['fs-user-id'] = tokenData.fsUserId;
                config.headers['device-id'] = deviceId;
            }
            return config;
        },
        (error) => {
            if (error instanceof AxiosError && error.response?.data) {
                switch (error.response.data.code) {
                    case 'SERVICE-0010' || 'SERVICE-0011':
                        if (!isLogoutMessageDisplayed) {
                            isLogoutMessageDisplayed = true;
                            logout();
                            window.dispatchEvent(new CustomEvent('showMessage', {
                                detail: {
                                    message: 'Your session has expired. Please log in again to continue.',
                                    type: 'blue'
                                }
                            }));
                            setTimeout(() => {
                                isLogoutMessageDisplayed = false;
                            }, 3000);
                        }
                        break;

                    case 'SERVICE-0000':
                        window.dispatchEvent(new CustomEvent('showMessage', {
                            detail: {
                                message: 'Something went wrong on our end. Please try again in a few minutes.',
                                type: 'red'
                            }
                        }));
                        break;
                }
            }
            return Promise.reject(error);
        }
    );

};

export default axiosInstance;
