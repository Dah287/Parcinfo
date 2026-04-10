import api from './api';
const API_BASE_URL = '/bureaux';

export const getAllBureaux = () => {
  return api.get(API_BASE_URL);
};

export const getBureauById = (id) => {
  return api.get(`${API_BASE_URL}/${id}`);
};

export const getBureauByCode = (code) => {
  return api.get(`${API_BASE_URL}/code/${code}`);
};

export const createBureau = (data) => {
  return api.post(API_BASE_URL, data);
};

export const updateBureau = (id, data) => {
  return api.put(`${API_BASE_URL}/${id}`, data);
};

export const deleteBureau = (id) => {
  return api.delete(`${API_BASE_URL}/${id}`);
};