import api from './api';

// Admin Dashboard
export const getAdminDashboard = async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
};

// Employees
export const getAllEmployees = async (params = {}) => {
    const response = await api.get('/admin/employees', { params });
    return response.data;
};

export const getEmployeeDetails = async (id) => {
    const response = await api.get(`/admin/employees/${id}`);
    return response.data;
};

export const updateEmployeeStatus = async (id, data) => {
    const response = await api.put(`/admin/employees/${id}/status`, data);
    return response.data;
};

// Approvals
export const getPendingApprovals = async () => {
    const response = await api.get('/admin/approvals/pending');
    return response.data;
};

