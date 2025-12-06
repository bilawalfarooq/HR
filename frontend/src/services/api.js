import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration and errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error);
            return Promise.reject({
                message: 'Unable to connect to the server. Please check your internet connection.',
                isNetworkError: true
            });
        }

        // If error is 401 and we haven't retried yet
        // AND the request is NOT a login request (login 401 means invalid credentials)
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/login')) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // Try to refresh token
                const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                    refreshToken,
                });

                const { accessToken } = response.data.data;

                // Save new token
                localStorage.setItem('accessToken', accessToken);

                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                // Only redirect if not already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }

                return Promise.reject({
                    message: 'Your session has expired. Please login again.',
                    isAuthError: true
                });
            }
        }

        // Handle other errors with user-friendly messages
        const errorMessage = error.response?.data?.message ||
            error.message ||
            'Something went wrong. Please try again.';

        return Promise.reject({
            ...error,
            message: errorMessage,
            statusCode: error.response?.status,
            errors: error.response?.data?.errors || []
        });
    }
);

export default api;
