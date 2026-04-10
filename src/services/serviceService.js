// services/serviceService.js
import api from './api';
const API_BASE_URL = '/services';

export const getAllServices = () => {
  return api.get(API_BASE_URL);
};

export const getServiceById = (id) => {
  return api.get(`${API_BASE_URL}/${id}`);
};

export const getServiceByCode = (code) => {
  return api.get(`${API_BASE_URL}/code/${code}`);
};

export const getServicesByDepartment = (departmentId) => {
  return api.get(`${API_BASE_URL}/department/${departmentId}`);
};

export const createService = (data) => {
  return api.post(API_BASE_URL, data);
};

export const updateService = (id, data) => {
  return api.put(`${API_BASE_URL}/${id}`, data);
};

export const deleteService = (id) => {
  return api.delete(`${API_BASE_URL}/${id}`);
};