import api from './api';
const API_BASE_URL = '/fournisseurs';

// 🔹 CRUD & listes
export const getAllFournisseurs = () => api.get(API_BASE_URL);
export const getFournisseurById = (id) => api.get(`${API_BASE_URL}/${id}`);
export const searchFournisseurs = (keyword) =>
  api.get(`${API_BASE_URL}/search`, { params: { keyword } });

export const createFournisseur = (fournisseurData) =>
  api.post(API_BASE_URL, fournisseurData);

export const updateFournisseur = (id, fournisseurData) =>
  api.put(`${API_BASE_URL}/${id}`, fournisseurData);

export const deleteFournisseur = (id) =>
  api.delete(`${API_BASE_URL}/${id}`);
