import api from './api';

const ROSTER_API = '/roster';

const rosterService = {
    getRoster: async (startDate, endDate) => {
        const response = await api.get(ROSTER_API, { params: { start_date: startDate, end_date: endDate } });
        return response.data;
    },

    assignShift: async (data) => {
        const response = await api.post(`${ROSTER_API}/assign`, data);
        return response.data;
    },

    bulkAssign: async (data) => {
        const response = await api.post(`${ROSTER_API}/bulk-assign`, data);
        return response.data;
    }
};

export default rosterService;
