import api from './api';

// Super Admin Dashboard
export const getSuperAdminDashboard = async () => {
    const response = await api.get('/super-admin/dashboard');
    return response.data;
};

// Companies
export const getAllCompanies = async (params = {}) => {
    const response = await api.get('/super-admin/companies', { params });
    return response.data;
};

export const getCompanyDetails = async (id) => {
    const response = await api.get(`/super-admin/companies/${id}`);
    return response.data;
};

export const updateCompanyStatus = async (id, status) => {
    const response = await api.put(`/super-admin/companies/${id}/status`, { status });
    return response.data;
};

// Subscription Plans
export const getSubscriptionPlans = async () => {
    const response = await api.get('/super-admin/plans');
    return response.data;
};

export const createSubscriptionPlan = async (data) => {
    const response = await api.post('/super-admin/plans', data);
    return response.data;
};

export const updateSubscriptionPlan = async (id, data) => {
    const response = await api.put(`/super-admin/plans/${id}`, data);
    return response.data;
};

// Subscriptions
export const getAllSubscriptions = async (params = {}) => {
    const response = await api.get('/super-admin/subscriptions', { params });
    return response.data;
};

export const assignSubscription = async (data) => {
    const response = await api.post('/super-admin/subscriptions/assign', data);
    return response.data;
};

