import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/fournisseurs';

export const getAllFournisseurs = () => {
  return axios.get(API_BASE_URL).then(res => res.data);
};

export const getFournisseurById = (id) => {
  return axios.get(`${API_BASE_URL}/${id}`).then(res => res.data);
};

export const createFournisseur = (data) => {
  return axios.post(API_BASE_URL, data);
};

export const updateFournisseur = (id, data) => {
  return axios.put(`${API_BASE_URL}/${id}`, data);
};

export const deleteFournisseur = (id) => {
  return axios.delete(`${API_BASE_URL}/${id}`);
};
