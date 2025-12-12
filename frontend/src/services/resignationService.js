import api from './api';

export const submitResignation = async (data) => {
    const response = await api.post('/resignations/submit', data);
    return response.data;
};

export const updateResignationStatus = async (id, data) => {
    const response = await api.put(`/resignations/${id}/status`, data);
    return response.data;
};

export const getResignations = async (params) => {
    const response = await api.get('/resignations', { params });
    return response.data;
};

export const submitExitInterview = async (data) => {
    const response = await api.post('/resignations/exit-interview', data);
    return response.data;
};
