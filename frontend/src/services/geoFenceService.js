import api from './api';

export const getGeoFences = async (params = {}) => {
    const response = await api.get('/geo-fences', { params });
    return response.data;
};

export const getGeoFenceById = async (id) => {
    const response = await api.get(`/geo-fences/${id}`);
    return response.data;
};

export const createGeoFence = async (data) => {
    const response = await api.post('/geo-fences', data);
    return response.data;
};

export const updateGeoFence = async (id, data) => {
    const response = await api.put(`/geo-fences/${id}`, data);
    return response.data;
};

export const deleteGeoFence = async (id) => {
    const response = await api.delete(`/geo-fences/${id}`);
    return response.data;
};

export const testLocation = async (latitude, longitude) => {
    const response = await api.post('/geo-fences/test-location', {
        latitude,
        longitude
    });
    return response.data;
};

