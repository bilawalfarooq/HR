import api from './api';

export const generateFnF = async (data) => {
    const response = await api.post('/fnf/generate', data);
    return response.data;
};

export const updateFnFStatus = async (fnfId, data) => {
    const response = await api.put(`/fnf/${fnfId}/status`, data);
    return response.data;
};
