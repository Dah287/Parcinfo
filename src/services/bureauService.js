// services/bureauService.js
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.80:8080/api/bureaux';

export const getAllBureaux = () => {
  return axios.get(API_BASE_URL);
};

export const getBureauById = (id) => {
  return axios.get(`${API_BASE_URL}/${id}`);
};

export const getBureauByCode = (code) => {
  return axios.get(`${API_BASE_URL}/code/${code}`);
};

export const createBureau = (data) => {
  return axios.post(API_BASE_URL, data);
};

export const updateBureau = (id, data) => {
  return axios.put(`${API_BASE_URL}/${id}`, data);
};

export const deleteBureau = (id) => {
  return axios.delete(`${API_BASE_URL}/${id}`);
};