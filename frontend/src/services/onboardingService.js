import api from './api';

export const createOnboardingTask = async (data) => {
    const response = await api.post('/onboarding/tasks', data);
    return response.data;
};

export const assignTasksToEmployee = async (employeeId) => {
    const response = await api.post(`/onboarding/assign/${employeeId}`);
    return response.data;
};

export const getEmployeeOnboardingStatus = async (employeeId) => {
    const response = await api.get(`/onboarding/progress/${employeeId}`);
    return response.data;
};

export const updateTaskStatus = async (onboardingId, data) => {
    const response = await api.put(`/onboarding/progress/${onboardingId}/status`, data);
    return response.data;
};
