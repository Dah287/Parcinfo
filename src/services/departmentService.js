// services/departmentService.js
import api from './api';
const API_BASE_URL = '/departments';

export const getAllDepartments = () => {
  return api.get(API_BASE_URL);
};

export const getDepartmentById = (id) => {
  return api.get(`${API_BASE_URL}/${id}`);
};

export const getDepartmentByCode = (code) => {
  return api.get(`${API_BASE_URL}/code/${code}`);
};

export const createDepartment = (data) => {
  return api.post(API_BASE_URL, data);
};

export const updateDepartment = (id, data) => {
  return api.put(`${API_BASE_URL}/${id}`, data);
};

export const deleteDepartment = (id) => {
  return api.delete(`${API_BASE_URL}/${id}`);
};