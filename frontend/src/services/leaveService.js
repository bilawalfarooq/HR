import api from './api';

const LEAVE_API = '/leaves';

const leaveService = {
    getTypes: async () => {
        const response = await api.get(`${LEAVE_API}/types`);
        return response.data;
    },

    createType: async (data) => {
        const response = await api.post(`${LEAVE_API}/types`, data);
        return response.data;
    },

    getMyLeaves: async () => {
        const response = await api.get(`${LEAVE_API}/my-requests`);
        return response.data;
    },

    requestLeave: async (data) => {
        const response = await api.post(`${LEAVE_API}/request`, data);
        return response.data;
    },

    getPendingLeaves: async () => {
        const response = await api.get(`${LEAVE_API}/pending`);
        return response.data;
    },

    approveLeave: async (id, data) => {
        const response = await api.put(`${LEAVE_API}/approve/${id}`, data);
        return response.data;
    },

    getBalance: async () => {
        const response = await api.get(`${LEAVE_API}/balance`);
        return response.data;
    }
};

export default leaveService;
