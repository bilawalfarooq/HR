import api from './api';

const timesheetService = {
    getMyTimesheets: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/timesheets/my-timesheets${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    getTimesheetById: async (id) => {
        const response = await api.get(`/timesheets/my-timesheets/${id}`);
        return response.data;
    },

    createTimesheet: async (data) => {
        const response = await api.post('/timesheets/my-timesheets', data);
        return response.data;
    },

    updateTimesheet: async (id, data) => {
        const response = await api.put(`/timesheets/my-timesheets/${id}`, data);
        return response.data;
    },

    submitTimesheet: async (id) => {
        const response = await api.put(`/timesheets/my-timesheets/${id}/submit`);
        return response.data;
    },

    getPendingTimesheets: async () => {
        const response = await api.get('/timesheets/pending');
        return response.data;
    },

    approveTimesheet: async (id, status, rejectionReason = null) => {
        const response = await api.put(`/timesheets/${id}/approve`, {
            status,
            rejection_reason: rejectionReason
        });
        return response.data;
    }
};

export default timesheetService;

