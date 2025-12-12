import api from './api';

export const addAsset = async (data) => {
    const response = await api.post('/assets', data);
    return response.data;
};

export const assignAsset = async (assetId, data) => {
    const response = await api.post(`/assets/${assetId}/assign`, data);
    return response.data;
};

export const returnAsset = async (assetId, data) => {
    const response = await api.post(`/assets/${assetId}/return`, data);
    return response.data;
};

export const getEmployeeAssets = async (employeeId) => {
    const response = await api.get(`/assets/employee/${employeeId}`);
    return response.data;
};
