import api from './api';

const HOLIDAY_API = '/holidays';

const holidayService = {
    getHolidays: async () => {
        const response = await api.get(HOLIDAY_API);
        return response.data;
    },

    createHoliday: async (data) => {
        const response = await api.post(HOLIDAY_API, data);
        return response.data;
    },

    deleteHoliday: async (id) => {
        const response = await api.delete(`${HOLIDAY_API}/${id}`);
        return response.data;
    }
};

export default holidayService;
