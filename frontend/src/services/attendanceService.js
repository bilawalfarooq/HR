import api from './api';

const ATTENDANCE_API = '/attendance';

const attendanceService = {
    // Stats
    getDashboardStats: async (date) => {
        try {
            const response = await api.get(`${ATTENDANCE_API}/dashboard`, { params: { date } });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getLogs: async (date, employeeId) => {
        try {
            const response = await api.get(`${ATTENDANCE_API}/logs`, { params: { date, employee_id: employeeId } });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    processAttendance: async (date) => {
        try {
            const response = await api.post(`${ATTENDANCE_API}/process`, { date });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Shifts
    getShifts: async () => {
        try {
            const response = await api.get(`${ATTENDANCE_API}/shifts`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createShift: async (shiftData) => {
        try {
            const response = await api.post(`${ATTENDANCE_API}/shifts`, shiftData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateShift: async (id, shiftData) => {
        try {
            const response = await api.put(`${ATTENDANCE_API}/shifts/${id}`, shiftData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteShift: async (id) => {
        try {
            const response = await api.delete(`${ATTENDANCE_API}/shifts/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Devices
    getDevices: async () => {
        try {
            const response = await api.get(`${ATTENDANCE_API}/devices`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    registerDevice: async (deviceData) => {
        try {
            const response = await api.post(`${ATTENDANCE_API}/devices`, deviceData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Import
    importAttendance: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post(`${ATTENDANCE_API}/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default attendanceService;
