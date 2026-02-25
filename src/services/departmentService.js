// services/departmentService.js
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.80:8080/api/departments';

export const getAllDepartments = () => {
  return axios.get(API_BASE_URL);
};

export const getDepartmentById = (id) => {
  return axios.get(`${API_BASE_URL}/${id}`);
};

export const getDepartmentByCode = (code) => {
  return axios.get(`${API_BASE_URL}/code/${code}`);
};

export const createDepartment = (data) => {
  return axios.post(API_BASE_URL, data);
};

export const updateDepartment = (id, data) => {
  return axios.put(`${API_BASE_URL}/${id}`, data);
};

export const deleteDepartment = (id) => {
  return axios.delete(`${API_BASE_URL}/${id}`);
};