// services/serviceService.js
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.80:8080/api/services';

export const getAllServices = () => {
  return axios.get(API_BASE_URL);
};

export const getServiceById = (id) => {
  return axios.get(`${API_BASE_URL}/${id}`);
};

export const getServiceByCode = (code) => {
  return axios.get(`${API_BASE_URL}/code/${code}`);
};

export const getServicesByDepartment = (departmentId) => {
  return axios.get(`${API_BASE_URL}/department/${departmentId}`);
};

export const createService = (data) => {
  return axios.post(API_BASE_URL, data);
};

export const updateService = (id, data) => {
  return axios.put(`${API_BASE_URL}/${id}`, data);
};

export const deleteService = (id) => {
  return axios.delete(`${API_BASE_URL}/${id}`);
};