import api from './api';

export const getDashboard = async () => {
    const response = await api.get('/employee/dashboard');
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/employee/profile');
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await api.put('/employee/profile', data);
    return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
    const response = await api.post('/employee/profile/change-password', {
        current_password: currentPassword,
        new_password: newPassword
    });
    return response.data;
};

export const getMyDocuments = async () => {
    const response = await api.get('/employee/documents');
    return response.data;
};

export const uploadDocument = async (formData) => {
    const response = await api.post('/employee/documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const downloadDocument = async (id) => {
    const response = await api.get(`/employee/documents/${id}/download`, {
        responseType: 'blob'
    });
    return response.data;
};

export const deleteDocument = async (id) => {
    const response = await api.delete(`/employee/documents/${id}`);
    return response.data;
};

export const getNotifications = async (params = {}) => {
    const response = await api.get('/employee/notifications', { params });
    return response.data;
};

export const markNotificationAsRead = async (id) => {
    const response = await api.put(`/employee/notifications/${id}/read`);
    return response.data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await api.put('/employee/notifications/read-all');
    return response.data;
};

export const deleteNotification = async (id) => {
    const response = await api.delete(`/employee/notifications/${id}`);
    return response.data;
};

